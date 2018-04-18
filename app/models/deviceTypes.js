"use strict";

module.exports = function (sequelize, DataTypes) {
    var DeviceTypes = sequelize.define("devicetypes", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type: DataTypes.STRING, unique: true},
    },{
        timestamps: false,
    });
    return DeviceTypes;
};