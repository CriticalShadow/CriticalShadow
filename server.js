var express     = require('express');
var app 	    = express();
var port 	    = process.env.PORT || 3000;

    app.get('/', function(req, res) {
        res.sendfile('./client/index.html');
    });

    app.get('/login', function(req, res) {
        res.sendfile('./client/templates/login.html');
    });

    app.get('/signup', function(req, res) {
        res.sendfile('./client/templates/signup.html');
    });

    app.post('/signup', function(req, res) {
        console.log(req);
        console.log(res);
        res.send(req);
    });

    app.listen(port, function() {
        console.log("Listening on " + port);
    });