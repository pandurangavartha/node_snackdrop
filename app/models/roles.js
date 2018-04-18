"use strict";

module.exports = function (sequelize, DataTypes) {
    var Roles = sequelize.define("roles", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type: DataTypes.STRING, unique: true},
    },{
        timestamps: false,
    });
    return Roles;
};