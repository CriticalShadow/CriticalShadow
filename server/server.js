var express   = require('express');
var app 	    = express();
var port 	    = process.env.PORT || 3000;
var host = process.env.HOST;

app.use(express.static(__dirname + '/../client'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + 'index.html');
});

app.get('/login', function (req, res) {
  res.sendFile('./client/templates/login.html');
});

app.get('/signup', function (req, res) {
  res.sendFile('./client/templates/signup.html');
});

app.post('/signup', function (req, res) {
  console.log(req);
  console.log(res);
  res.send(req);
});

app.listen(port, function() {
  console.log("Listening on " + port);
});