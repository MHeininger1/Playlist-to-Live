const express = require("express");
const app = express();
const request = require("request");
app.set("view engine", "ejs");


app.get('/', function(req, res) {
    res.send("yo");
    
});

app.get('/login', function(req, res) {
    var scopes = 'playlist-read-private playlist-read-collaborative';
    res.redirect('https://accounts.spotify.com/authorize' +
      '?response_type=token' +
      '&client_id=' + '28c2c40fbdb6448b9a2ad2f3de6319ce' +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + 'http://localhost:3000/callback');
      console.log(req);
    });
   
    

  
 



app.listen(3000, function(){
    console.log("Server running");
});