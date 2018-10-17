const express = require("express");
const app = express();
const request = require("request");
const cookieParser = require("cookie-parser");
const querystring = require("querystring");
const cors = require("cors");
app.set("view engine", "ejs");

const client_id = 'CLient id';
const client_secret = 'client secret';
const redirect_uri = 'http://localhost:3000/callback';
let access_token = '';
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
  var stateKey = 'spotify_auth_state';
  
  
  
  app.use(express.static(__dirname + '/public'))
     .use(cors())
     .use(cookieParser());
  
  app.get('/login', function(req, res) {
  
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    // application requests authorization
    var scope = 'playlist-read-private playlist-read-collaborative';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  });
  
  app.get('/callback', function(req, res) {
  
    // application requests refresh and access tokens
    // after checking the state parameter
    
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };
  
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
  
           access_token = body.access_token,
              refresh_token = body.refresh_token;
  
          var options = {
            url: 'https://api.spotify.com/v1/me/playlists?limit=50',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };
  
          // use the access token to access the Spotify Web API
          request.get(options, function(error, response, body) {
            let playlistInfo = response.body.items;
            res.render("callback", {playlistInfo: playlistInfo});
            // console.log(playlistInfo);
            
            
                     
          });
  
          
          
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
   
  });
  
 
  
  app.get('/refresh_token', function(req, res) {
  
    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
         access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
  });
 
app.get("/", function(req, res){
    res.send("yo");
});


app.get("/playlist/:id", function(req, res){
  let id = req.params.id;
  var options = {
    url: 'https://api.spotify.com/v1/playlists/' + id + '/tracks',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
console.log(access_token); 
console.log(id);
  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {
    let songs = response.body.items;
    // log artist name and track name from array to send "artist name" + "track name" + live to youtube api
    console.log(songs);
    console.log(songs[0].track.artists[0].name);
  });
});



app.listen(3000, function(){
    console.log("Server running");
});