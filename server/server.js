var express   	= require('express');
var bodyParser  = require('body-parser');
var app 	    = express();
var port 	    = process.env.PORT || 3000;
var host 		= process.env.HOST;
var path 		= require('path');

app.use(express.static(__dirname + '/../client'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.sendFile(__dirname, 'index.html');
});

app.get('/mymap', function (req, res) {
  res.sendFile(path.join(__dirname, '/../client/mymap.html'));
});

app.get('/createMaps', function (req, res) {
  res.sendFile(path.join(__dirname, '/../client/createMaps.html'));
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, '/../client/templates/login.html'));
});

app.get('/signup', function (req, res) {
  res.sendFile(path.join(__dirname, '/../client/templates/signup.html'));
});

app.post('/signup', function(req, res) {
    
    //check to see if info exists in db, if not then move forward, if so then send message saying
    //user exists

    var username = req.body.usernameInput;
    var password = req.body.passwordInput; // we can hash here when the time comes
    var email	 = req.body.emailInput;

    //Sequelize user.create function here using client info

    console.log(req.body);

});

app.get('/login', function(req, res) {
    
    //check to see if info exists in db as well as matching password, if so then move forward,
    // if so then send message

    var username = req.body.usernameInput;
    var password = req.body.passwordInput; // we can hash here when the time comes

    //Sequelize user.create function here to check db for proper user information

    console.log(req.body);

});

app.listen(port, function() {
  console.log("Listening on " + port);
});