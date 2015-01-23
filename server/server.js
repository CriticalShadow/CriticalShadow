var express = require('express');
var app 	= express();
var port 	= process.env.PORT || 3000;

    app.get('/', function(req, res){
    	res.sendfile('index.html');
    });

    app.listen(port, function() {
       console.log("Listening on " + port);
    });