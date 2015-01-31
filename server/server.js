var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var port = process.env.PORT || 3000;
var host = process.env.HOST;
var path = require('path');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var db = require('./db');
var handlers = require('./handlers');
var Guid = require('node-uuid');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.static(__dirname + '/../client'));
app.set('views', '../views');
app.set('view engine', 'jade'); //templating engine for dashboard and active map view

var FACEBOOK_APP_ID = 922911927720037;
var FACEBOOK_APP_SECRET = '513872ee43b515e579d4133a0d7e4086';

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback"
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
  ));

//This is the handler for Facebook authentication. Our application redirects to facebook which will ask for permission and then make a GET req to the route below
app.get('/auth/facebook', passport.authenticate('facebook'), function (req, res) {
});

//Facebook redirects to this URL upon approval
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/signup' }), function (req, res) {
  handlers.setUser(req.user.displayName)
    .then(function (user) {
      res.cookie('u_id', user.id);
    })
    .then(function () {
      res.redirect('/myMap');
    });
});

//Home page
app.get('/', function (req, res) {
  res.sendFile(__dirname, 'index.html');
});

//View Example page now using Jade templates
app.get('/example', function (req, res) {
  res.render('example', { title: 'Bootcamps in San Francisco'});
});

//MyMap page
app.get('/myMap', function (req, res) {
  res.sendFile(path.join(__dirname, '/../client/myMap.html'));
});

//MyMap request for all user maps
app.get('/myMap/user', function (req, res) {
  handlers.getUserMaps(req.cookies.u_id)
    .then(function (maps) {
      res.send(maps);
    });
});

//Active Map View
app.get('/maps/:guid', function (req, res) {
  handlers.getMap(req.params.guid)
  .then(function (mapData) {
    res.render('activemap', mapData);
  });
});

//User Dashboard
app.get('/dashboard', function (req, res) {
  handlers.getUserMaps(req.cookies.u_id)
    .then(function (userMaps) {
      res.render('dashboard', userMaps);
    });
});

//createMaps page for individual users
app.route('/createMaps')
  .get(function (req, res) {
    res.sendFile(path.join(__dirname, '/../client/createMaps.html'));
  })
  .post(function (req, res) {
    console.log('reqbody', req.body)
    var guid = Guid.v4().slice(0, 8);
    var map = req.body; //map data from client
    map.UserId = req.cookies.u_id; //adds UserId property
    map.Guid = guid; //adds a Guid property
    handlers.setMap(map); //Adds this map to the database
    res.send(guid); //allows for preview from alert box
  });

//Login
app.post('/login', function (req, res) {
  res.redirect('/auth/facebook');
});

//Sign up
app.post('/signup', function (req, res) {
  res.redirect('/auth/facebook');
});

//Deleting Cookies
app.get('/del', function (req, res) {
  res.clearCookie('u_id'); 
  res.redirect('/');
});

app.listen(port, function () {
  console.log("Listening on " + port);
});