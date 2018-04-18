"use strict";

module.exports = function (sequelize, DataTypes) {
    var Status = sequelize.define("status", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type: DataTypes.STRING, unique: true},
        isActive: {type: DataTypes.BOOLEAN, defaultValue: true},
    },{
        timestamps: false,
    });
    return Status;
};