var Sequelize = require('sequelize');
var sequelize = new Sequelize('shadowdb', 'root', '', {
  dialect: "mysql" // or 'sqlite', 'postgres', 'mariadb'
});

// User ID primary key is automatically created by Sequelize, no need to define this in the model
var User = sequelize.define('User', {
  name: Sequelize.STRING,
  password: Sequelize.STRING,
  email: Sequelize.STRING
});

// Map ID primary key automaticaly created.  User ID foreign key will be assigned later 
var Map = sequelize.define('Map', {
  name: Sequelize.STRING,
  guid: Sequelize.STRING
});


var Location = sequelize.define('Location', {
  name: Sequelize.STRING,
  latitude: Sequelize.FLOAT,
  longitude: Sequelize.FLOAT
});

// The MapLocation is the join table between the Map and Location tables
var MapLocation = sequelize.define('MapLocation', {});

MapLocation.sync();

// This table will have a foreign key relationship to the MapLocation table's primary key
var MapLocationContent = sequelize.define('MapLocationContent', {
  title: Sequelize.STRING,
  icon_url: Sequelize.STRING,
  text: Sequelize.BLOB
});

// A user can create many maps.  1 to many relationship
User.hasMany(Map);
Map.belongsTo(User);


// Many to many relationship between maps and locations, through the MapLocation table
Map.belongsToMany(Location, { through: 'MapLocation' });
Location.belongsToMany(Map, { through: 'MapLocation' });

// A map location has one content record associated with it. 1 to 1 relationship
MapLocation.hasOne(MapLocationContent);
MapLocationContent.belongsTo(MapLocation);


sequelize
  .sync({ force: true })
  .complete(function(err) {
     if (!!err) {
       console.log('An error occurred while creating the table:', err)
     } else {
       console.log('It worked!')
     }
  })