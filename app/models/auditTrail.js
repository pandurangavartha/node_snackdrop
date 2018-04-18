"use strict";

module.exports = function (sequelize, DataTypes) {
    var AuditTrail = sequelize.define("audittrails", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        modelName: DataTypes.STRING,
        tableName: DataTypes.STRING,
        pastData: DataTypes.TEXT,
        currentData: DataTypes.TEXT,
        action: DataTypes.STRING,
        remoteIp: DataTypes.STRING,
        createdOn: {type: DataTypes.DATE,defaultValue:Sequelize.NOW}
    },{
        timestamps: false
    });
    return AuditTrail;
};