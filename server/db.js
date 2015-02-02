var Sequelize = require('sequelize');
var db = {};

  if (process.env.HEROKU_POSTGRESQL_PINK_URL) {
    // the application is executed on Heroku ... use the postgres database
    var match = process.env.HEROKU_POSTGRESQL_PINK_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
 
    db.sequelize = new Sequelize(match[5], match[1], match[2], {
      dialect:  'postgres',
      protocol: 'postgres',
      port:     match[4],
      host:     match[3],
      logging:  true //false
    })
  } else {
    // the application is executed on the local machine ...
    db.sequelize = new Sequelize('shadowdb', 'W', '', {
      dialect: "postgres"
    });
  }

// db.sequelize = new Sequelize('shadowdb', 'W', '', {
//   dialect: "postgres"
// });

// User ID primary key is automatically created by Sequelize, no need to define this in the model
db.User = db.sequelize.define('User', {
  name: Sequelize.STRING,
});

// Map ID primary key automaticaly created.  User ID foreign key will be assigned later 
db.Map = db.sequelize.define('Map', {
  name: Sequelize.STRING,
  guid: Sequelize.STRING
});

db.Location = db.sequelize.define('Location', {
  name: Sequelize.STRING,
  latitude: Sequelize.DECIMAL(18, 15),
  longitude: Sequelize.DECIMAL(18, 15)
});

// The MapLocation is the join table between the Map and Location tables
db.MapLocation = db.sequelize.define('MapLocation', {});

// db.MapLocation.sync();

// This table will have a foreign key relationship to the MapLocation table's primary key
db.MapLocationContent = db.sequelize.define('MapLocationContent', {
  title: Sequelize.STRING,
  icon_url: Sequelize.STRING,
  description: Sequelize.BLOB,
  address: Sequelize.STRING,
  mapOrder: Sequelize.INTEGER
});

// A user can create many maps.  1 to many relationship
db.User.hasMany(db.Map);
db.Map.belongsTo(db.User);

// Many to many relationship between maps and locations, through the MapLocation table
db.Map.belongsToMany(db.Location, { through: 'MapLocation' });
db.Location.belongsToMany(db.Map, { through: 'MapLocation' });

// A map location has one content record associated with it. 1 to 1 relationship
db.MapLocation.hasOne(db.MapLocationContent);
db.MapLocationContent.belongsTo(db.MapLocation);


db.sequelize
.sync()
.complete(function(err) {
   if (!!err) {
     console.log('An error occurred while creating the table:', err)
   } else {
     console.log('It worked!')
   }
});

module.exports = db;