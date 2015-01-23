var db = require('./db');
// var sequelize = require('sequelize');

var setUser = function(user) {
  var name = user.name;
  var password = user.password;
  var email = user.email;
  db.User
  .create({
    name: name,
    password: password,
    email: email
  })
  .complete(function(err, user) {
    if (err) { 
      console.log(err)
    } else {
      console.log(user);
      return user;
    }
  });  
};

var getUser = function(user) {
  var name = user.name;
  var password = user.password;
  var email = user.email;
  db.User
  .find({ where: {
    name: name,
    password: password
  }})
  .complete(function(err, user) {
    if (!!err) {
      console.log('An error occurred while searching for John:', err)
    } else if (!user) {
      console.log('No user with the username ' + name + ' has been found.')
    } else {
      console.log('Hello ' + user.name + '!')
      console.log('All attributes of john:', user.values)
    }
  }) 
};

var setMap = function(map) {

  var name = map.name;
  var guid = map.guid;
  var UserId = map.UserId;
  var locations = map.locations;

  

  

}

var getMap = function(guid) {

  var wholeMap = {};

  db.Map
  .find({ where: 
    {
      guid: guid
    }, 
      include: [Location]
  })
  .complete(function(err, map) {
    if (!!err) {
      console.log('An error occurred while searching for the map:', err)
    } else if (!map) {
      console.log('No map with the guid ' + guid + ' has been found.')
    } else {
      wholeMap.map = map;
      console.log('All attributes of the map:', map)
    }
  });

  return wholeMap;
  // db.Locations
  // .find({ where: {

  // }})

}


// var neil = setUser({name: 'neil', password: 'neilspass', email: 'neil@gmail.com'});

// getUser({name: 'neil', password: 'neilspass'});
