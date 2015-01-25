var db = require('./db');
var sequelize = require('sequelize');

var setUser = function(user) {
  var name = user.name;
  var password = user.password;
  var email = user.email;
  db.User
  .find({ where: {
    name: name}
  })
  .complete(function(err, user) {
    if (err) {
      console.log(err);
      return err;
    } else if (user === null) { // if not found, then we create the user
      db.User.create({
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
    } else { // if found, tell the user that the name is already taken
      console.log('Username already exists');
    }
  })
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
  var mapResults;
  var locationsResults = [];

  // create map
  db.Map.find({ where: {
    guid: guid
  }})
  .complete(function(err, results) {
    if (err) {
      // console.log('error searching for map guid')
      return err;
    } else if (results === null) { // if map guid does not exist
      db.Map.create({
        name: name, 
        guid: guid,
        UserId: UserId
      })
      .complete(function(err, mapdata) {
        // console.log('mapdata', mapdata);
        if (err) {
          console.log('Error creating map: ', err);
        } else {
          mapResults = mapdata;
          // loop through the location objects and create each location
          for (var i = 0; i < locations.length; i++) {
            // check to see if location exists
            (function(index) {
              db.Location.find({ where: {
                name: locations[index].name,
                latitude: locations[index].latitude,
                longitude: locations[index].longitude
              }})
              .complete(function(err, location) {
                if (err) { 
                  // console.log('error: ', err)
                  return err;
                } else if (location === null) { // if location does not exist we create the location
                  db.Location.create({
                    name: locations[index].name,
                    latitude: locations[index].latitude,
                    longitude: locations[index].longitude
                  }).complete(function(err, locationdata) {
                    // assign the MapLocation join table the correct MapId and Location Id for the specific location
                    db.MapLocation.create({
                      MapId: mapResults.dataValues.id,
                      LocationId: locationdata.dataValues.id
                    })
                    .complete(function(err, maplocdata) {
                      if (err) {
                        console.log(err);
                        return err;
                      } else {
                        console.log('MapLocationdata', maplocdata);
                        // store the contents for the specific map location
                        db.MapLocationContent.create({
                          title: locations[index].title,
                          description: locations[index].description,
                          address: locations[index].address,
                          MapLocationLocationId: maplocdata.LocationId
                        }).complete(function(err, maplocationcontent) {
                          if ( err ) {
                            console.log(err);
                            return err;
                          }
                        })
                      }
                    });
                  });
                } else { // if the location already exists
                  console.log('location ' + location[index].name + ' already exists');
                }
              });
            })(i);
          }
        }
      })
      
    } else { // update the locations associated with the map guid

    }
  })

};


// setUser({name: 'neil', password: 'neilspass', email: 'neil@gmail.com'});

// getUser({name: 'neil', password: 'neilspass'});

setMap({name: 'letters12', guid: 'jf90j3fo7', UserId: 1, locations: [
  {
    name: 'grandma',
    latitude: 143.48384905,
    longitude: 239.43983,
    description: 'This is the longest description for the first location, it is just amazing, omg...',
    address: '944 Market Street #8, San Francisco, CA 94102',
    title: 'Number one user input title'
  },
  {
    name: 'has',
    latitude: 23.34223265,
    longitude: 123.98473345,
    description: 'This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. ',
    address: '113 8th Avenue, San Francisco, CA 94019',
    title: 'Number two user input title'
  },
  {
    name: 'lice',
    latitude: 234.34985322,
    longitude: 11.3478,
    description: 'yo dude, here\'s my description',
    address: '88 Colin P Kelly Jr St San Francisco, CA 94107 United States',
    title: 'Number three user input title'
  }
]});











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
