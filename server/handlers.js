var db = require('./db');
var sequelize = require('sequelize');
var Promise = require('bluebird');

var handlers = {};

handlers.setUser = function (username) {
  return new Promise(function (resolve, reject) {
    var name = username;
    db.User
    .find({ where: {
      name: name}
    })
    .complete(function (err, user) {
      if (err) {
        console.log(err);
        return err;
      } else if (user === null) { // if not found, then we create the user
        db.User.create({
          name: username
        })
        .complete(function (err, user) {
          if (err) { 
            console.log(err)
          } else {
            // console.log(user);
            resolve(user);
          }
        });  
      } else { // if found, tell the user that the name is already taken
        // console.log(user);
        resolve(user);
      }
    });
  });
};

handlers.getUser = function (user) {
  return new Promise(function (resolve, reject) {
    var name = user.name;
    db.User
    .find({ where: {
      name: name
    }})
    .complete(function (err, user) {
      if (!!err) {
        console.log('An error occurred while searching for John:', err)
      } else if (!user) {
        console.log('No user with the username ' + name + ' has been found.')
      } else {
        console.log(user);
        resolve(user);
      }
    });
  });
};

handlers.setMap = function (map) {
  var name = map.mapName;
  var guid = map.Guid;
  var UserId = map.UserId;
  var locations = map.locations;
  var mapResults;
  var locationsResults = [];

  // create map
  db.Map.find({ where: {
    guid: guid
  }})
  .complete(function (err, results) {
    if (err) {
      // console.log('error searching for map guid')
      return err;
    } else if (results === null) { // if map guid does not exist
      db.Map.create({
        name: name, 
        guid: guid,
        UserId: UserId
      })
      .complete(function (err, mapdata) {
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
              .complete(function (err, location) {
                if (err) { 
                  // console.log('error: ', err)
                  return err;
                } else if (location === null) { // if location does not exist we create the location
                  db.Location.create({
                    name: locations[index].name,
                    latitude: locations[index].latitude,
                    longitude: locations[index].longitude
                  }).complete(function (err, locationdata) {
                    // assign the MapLocation join table the correct MapId and Location Id for the specific location
                    db.MapLocation.create({
                      MapId: mapResults.dataValues.id,
                      LocationId: locationdata.dataValues.id
                    })
                    .complete(function (err, maplocdata) {
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
                          MapLocationLocationId: maplocdata.LocationId,
                          mapOrder: index
                        }).complete(function (err, maplocationcontent) {
                          if (err) {
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

handlers.getMap = function (guid) {
  var wholeMap = {};
  wholeMap.locations = [];

  db.Map
  .find({ 
    where: {
      guid: guid
    }
  })
  .complete(function (err, map) {
    if (!!err) {
      console.log('An error occurred while searching for the map:', err)
    } else if (!map) {
      console.log('No map with the guid ' + guid + ' has been found.')
    } else {
      wholeMap.map = map.dataValues;
      db.MapLocation.findAll({ 
        where: {
          MapId: map.id
        }
      })
      .complete(function (err, maplocations) {
        if (err) {
          console.log('Error finding the associated map\'s locations', err);
        } else if (maplocations.length === 0) {
          console.log('No map locations exist for that map id', maplocations);
        } else {
          for (var i = 0; i < maplocations.length; i++) {
            (function (index) {
              wholeMap.locations.push(maplocations[index].dataValues);
              db.Location.find({
                where: {
                  id: maplocations[index].LocationId
                }
              })
              .complete(function (err, location) {
                if (err) {
                  console.log('Error returning the location from the locations table', err); 
                } else if (typeof location === 'object') {
                  wholeMap.locations[index].latitude = location.latitude;
                  wholeMap.locations[index].longitude = location.longitude;
                  db.MapLocationContent.find({ 
                    where: {
                      MapLocationLocationId: location.dataValues.id
                    }
                  })
                  .complete(function (err, locationcontent) {
                    wholeMap.locations[index].title = locationcontent.dataValues.title;
                    wholeMap.locations[index].icon_url = locationcontent.dataValues.icon_url;
                    wholeMap.locations[index].description = locationcontent.dataValues.description;
                    wholeMap.locations[index].address = locationcontent.dataValues.address;
                    wholeMap.locations[index].mapOrder = locationcontent.dataValues.mapOrder;
                    if (index === maplocations.length - 1) {
                      // need to change this implementaion!  Returning the correct data, but need a better
                      // than setTimeout
                      setTimeout(function () {
                        console.log('wholeMap', wholeMap);
                        return wholeMap;
                      }, 100);
                    }
                  })
                } else {
                  console.log('Location not found');
                }
              })
            }(i))
          }
        }
      });
    }
  });
};

module.exports = handlers;

//setUser({name: 'neil', password: 'neilspass', email: 'neil@gmail.com'});

//getUser({name: 'neil', password: 'neilspass'});

// handlers.setMap({name: 'letters13', guid: 'jf90j3fo7', UserId: 1, locations: [
//   {
//     name: 'Starbucks', // unique location name in the locations table
//     latitude: 143.48384905,
//     longitude: 239.4398548383,
//     description: 'This is the longest description for the first location, it is just amazing, omg...',
//     address: '944 Market Street #8, San Francisco, CA 94102',
//     title: 'Number one user input title' // this is the user input
//   },
//   {
//     name: 'McDonalds',
//     latitude: 23.34223265,
//     longitude: 123.98473345,
//     description: 'This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. This is a lot of information to handle in one go. ',
//     address: '113 8th Avenue, San Francisco, CA 94019',
//     title: 'Number two user input title'
//   },
//   {
//     name: 'Super Duper Burgers',
//     latitude: 234.34985322,
//     longitude: 11.34754352897065584938,
//     description: 'yo dude, here\'s my description',
//     address: '88 Colin P Kelly Jr St San Francisco, CA 94107 United States',
//     title: 'Number three user input title'
//   }
// ]});

handlers.getMap('a5298');















