var express = require('express');
var bodyParser = require('body-parser'); //for JSON
var cookieParser = require('cookie-parser'); //for browser cookies
var app = express();
var path = require('path');
var passport = require('passport'); //for Facebook login
var FacebookStrategy = require('passport-facebook').Strategy; //for Facebook login
var db = require('./db'); //database
var handlers = require('./handlers'); //database methods
var Guid = require('node-uuid'); //for generating GUIDs

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser()); //use the cookieParser in routes with req/res.cookies
app.use(express.static(__dirname + '/../client'));

app.set('port', process.env.PORT || 3000); //sets the port
app.set('host', process.env.HOST); //sets the host
app.set('views', './views'); //where views live
app.set('view engine', 'jade'); //templating engine for dashboard and active map view
app.set('FB_APPID', process.env.FACEBOOK_APP_ID);
app.set('FB_SECRET', process.env.FACEBOOK_APP_SECRET);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: 922911927720037,
  clientSecret: '513872ee43b515e579d4133a0d7e4086',
  callbackURL: "https://vagabondwithme.herokuapp.com/auth/facebook/callback"
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
      res.cookie('u_id', user.id); //we set a browser cookie 'u_id' to the id of the user from our users table
    })
    .then(function () {
      res.redirect('/myMaps'); //redirect them to their dashboard
    })
    .catch(function() {
      res.redirect('/createMaps');
    });
});

//Home page
app.get('/', function (req, res) {
  res.sendFile(__dirname, 'index.html'); //home page
});

//View Example page now using Jade templates
app.get('/example', function (req, res) {
  res.render('example', { title: 'Bootcamps in San Francisco'}); //View Example on the home page
});

//MyMap request for all user maps
app.get('/myMaps', function (req, res) {
  handlers.getUserMaps(req.cookies.u_id) //use the browser cookie to fetch the appropriate users data
    .then(function (maps) {
      console.log('maps', maps)
      res.render('mymaps', maps); //render the jade template and send along the appropriate data to the client
    });
});

//Active Map View
app.get('/maps/:guid', function (req, res) {
  handlers.getMap(req.params.guid) //the guid is assigned when a map is saved to the db. Someone visiting the URL for a map will hit this route
    .then(function (mapData) {
      res.render('activemap', mapData); //send the activemap jade template and the data from the database for the map with the given guid
    });
});

//createMaps page for individual users
app.route('/createMaps')
  .get(function (req, res) {
    res.sendFile(path.join(__dirname, '/../client/createMaps.html')); //on a get request, send them the client code
  })
  .post(function (req, res) { //on save
    var guid = Guid.v4().slice(0, 8); //create an 8 digit guid
    var map = req.body; //map data from client
    map.UserId = req.cookies.u_id; //adds UserId property
    map.Guid = guid; //adds a Guid property
    handlers.setMap(map); //Adds this map to the database
    res.send(guid); //send the guid back to the client to allow them to view their map from the smart alert box
  });

//Login
app.post('/login', function (req, res) {
  res.redirect('/auth/facebook'); //redirect to facebook auth
});

//Sign up
app.post('/signup', function (req, res) {
  res.redirect('/auth/facebook');
});

//Deleting Cookies
app.get('/del', function (req, res) {
  res.clearCookie('u_id'); //remove the cookie
  res.redirect('/'); //take them to the home page
});

app.listen(app.get('port'), function () {
  console.log("Listening on " + app.get('port'));
});