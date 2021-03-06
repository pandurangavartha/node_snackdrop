var fs = require("fs");
var path = require("path");
var settings = require('../../config/settings');

global.sequelize = new Sequelize(settings.database.database, settings.database.user, settings.database.password, {
    host: settings.database.host,
    dialect: settings.database.protocol,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
   // logging: false
    logging: console.log
});
var db = {};

fs.readdirSync(__dirname).filter(function (file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
}).forEach(function (file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
});

Object.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;