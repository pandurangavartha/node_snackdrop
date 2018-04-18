"use strict";

module.exports = function (sequelize, DataTypes) {
    var Settings = sequelize.define("settings", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        fields: {type: DataTypes.STRING},
        values: {type: DataTypes.STRING},
//        updatedBy: DataTypes.INTEGER,
        updatedOn: {type: DataTypes.DATE}
        
    },{
        timestamps: false
    });
    
    Settings.associate = function (models) {
        Settings.belongsTo(models.users, {
            foreignKey: {
                name: "updatedBy",
                notEmpty: false
            }
        });
    }
    
    Settings.beforeUpdate(function(ins, opt) {
        var dt = dateTime.create();
        var formatted = dt.format('Y-m-d H:M:S');
        ins.updatedOn = formatted;
        var auditTrailData = {
                modelName: ins['$modelOptions'].name.singular,
                tableName: ins['$modelOptions'].name.plural,
                pastData: JSON.stringify(ins._previousDataValues),
                currentData: JSON.stringify(ins.dataValues),
                action: "update",
                createdBy: typeof requestUserId != 'undefined' || requestUserId != '' ? requestUserId : 0,
                remoteIp: requestUserIp,
        };
        models.audittrails.create(auditTrailData).then(function (atd) {
        });
    });
    
    return Settings;
};