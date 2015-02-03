var db = require('./db');
var sequelize = require('sequelize');
var Promise = require('bluebird');

var handlers = {};

// set the user in the db
handlers.setUser = function (username) {
  return new Promise(function (resolve, reject) {
    var name = username;
    // check to see whether or not the user exists already
    db.User
    .find({ where: {
      name: name}
    })
    .complete(function (err, user) {
      if (err) {
        console.log(err);
        return err;
      } else if (user === null) { 
        // if the user is not found in the db, then we create the user
        db.User.create({
          name: username
        })
        .complete(function (err, user) {
          if (err) { 
            console.log(err)
          } else {
            // send the user info back to the server
            resolve(user);
          }
        });  
      } else { 
        // send the user info back to the server
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

  // see if the map already exists
  db.Map.find({ where: {
    guid: guid
  }})
  .complete(function (err, results) {
    if (err) {
      console.log('error searching for map guid');
      return err;
    } else if (results === null) { 
      // if map guid does not exist, create the map
      db.Map.create({
        name: name, 
        guid: guid,
        UserId: UserId
      })
      .complete(function (err, mapdata) {
        if (err) {
          console.log('Error creating map: ', err);
        } else {
          mapResults = mapdata;
          // loop through the locations array and create each location
          for (var i = 0; i < locations.length; i++) {
            (function(index) {
              // check to see if location exists
              db.Location.find({ where: {
                name: locations[index].name,
                latitude: locations[index].lat,
                longitude: locations[index].lng
              }})
              .complete(function (err, location) {
                if (err) { 
                  console.log('error: ', err);
                  return err;
                } else if (location === null) { 
                  // if location does not exist we create the location in the locations table
                  db.Location.create({
                    name: locations[index].name,
                    latitude: locations[index].lat,
                    longitude: locations[index].lng
                  }).complete(function (err, locationdata) {
                    // assign the MapLocation join table the correct MapId and Location Id for the specific location
                    db.MapLocation.create({
                      MapId: mapResults.dataValues.id,
                      LocationId: locationdata.dataValues.id
                    })
                    .complete(function (err, maplocdata) {
                      if (err) {
                        console.log('error creating map location', err);
                        return err;
                      } else {
                        // store the content for the specific map location in the MapLocationContents tables
                        db.MapLocationContent.create({
                          title: locations[index].name,  // for now, this will be the same as the name stored in the locations table, however, eventually the locations stored in the locations table should be separate from each map location
                          description: locations[index].desc,
                          address: locations[index].address,
                          MapLocationLocationId: maplocdata.LocationId,
                          mapOrder: index
                        }).complete(function (err, maplocationcontent) {
                          if (err) {
                            console.log('error creating map location content', err);
                            return err;
                          }
                        })
                      }
                    });
                  });
                } else { // if the location already exists
                  console.log('location ' + locations[index].name + ' already exists');
                  // here we are skipping the creation of the location in the locations table because it already exists
                  // *NB* This is the key to solving the bug where the description of the map is the same for all locations
                  // The location id is looking to the location stored in the locations table, but it should be 
                  // an id specific to the maplocationcontent record for that map location. 
                  db.MapLocation.create({
                      MapId: mapResults.dataValues.id,
                      LocationId: location.dataValues.id
                    })
                    .complete(function (err, maplocdata) {
                      if (err) {
                        console.log('error creating map location', err);
                        return err;
                      } else {
                        console.log('MapLocationdata', maplocdata);
                        // store the contents for the specific map location
                        db.MapLocationContent.create({
                          title: locations[index].name,  // for now, this will be the same as the name stored in the locations table, however, eventually the locations stored in the locations table should be separate from each map location
                          description: locations[index].desc,
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
                }
              });
            })(i);
          }
        }
      })
    } 
  })
};

// this function returns the entire map object for a specified map guid
handlers.getMap = function (guid) {

  // used to sort the order of the locations displayed for a map
  var compare = function (a,b) {
    if (a.last_nom < b.last_nom)
       return -1;
    if (a.last_nom > b.last_nom)
      return 1;
    return 0;
  };

  return new Promise(function (resolve, reject) {
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
      // find all the locations for the map
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
                console.log('location', location);
                if (err) {
                  console.log('Error returning the location from the locations table', err); 
                } else if (typeof location === 'object') {
                  wholeMap.locations[index].lat = location.latitude;
                  wholeMap.locations[index].lng = location.longitude;
                  // find each locations associated content from the MapLocationContents table
                  db.MapLocationContent.find({ 
                    where: {
                      MapLocationLocationId: location.dataValues.id
                    }
                  })
                  .complete(function (err, locationcontent) {
                    // set the properties on the wholeMap object
                    wholeMap.locations[index].title = locationcontent.dataValues.title;
                    wholeMap.locations[index].icon_url = locationcontent.dataValues.icon_url;
                    wholeMap.locations[index].desc = locationcontent.dataValues.description === null ? "" : locationcontent.dataValues.description.toString();
                    wholeMap.locations[index].address = locationcontent.dataValues.address;
                    wholeMap.locations[index].mapOrder = locationcontent.dataValues.mapOrder;
                    if (index === maplocations.length - 1) { 
                      // sort the locations by mapOrder
                      wholeMap.locations.sort(compare); 
                      resolve(wholeMap);
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
  });
};

// get all maps for a user, denoted by the userId passed into the function
handlers.getUserMaps = function (userId) {

  return new Promise(function (resolve, reject) {
    var allUserMaps = [];

    db.Map.findAll({ 
      where: {
        UserId: userId
      }
    })
    .complete(function(err, maps) {
      console.log('got all the maps for the user with the user id ' + userId);
      var count = 0;
      if (maps.length === 0 || maps === undefined) { // if the user has not created any maps yet
        var data = {data: []};
        resolve(data);
      } else {
        maps.forEach(function(map) {
          handlers.getMap(map.dataValues.guid)
          .then(function(results) {
            allUserMaps.push(results);
            count++;
            if (count === maps.length) {
              console.log('allUserMaps', allUserMaps);
              var data = {data: allUserMaps};
              resolve(data);
            }
          });
        });
      }
    });
  });
};

module.exports = handlers;

// setUser({name: 'neil', password: 'neilspass', email: 'neil@gmail.com'});

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

// handlers.getUserMaps(1);


