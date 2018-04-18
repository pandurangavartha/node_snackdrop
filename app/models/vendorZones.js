"use strict";

module.exports = function (sequelize, DataTypes) {
    var VenderZones = sequelize.define("vendorzones", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        isActive: {type: DataTypes.BOOLEAN, defaultValue: true},
    }, {
        timestamps: false
    });
    
    VenderZones.associate = function (models) {
        VenderZones.belongsTo(models.vendordetails, {
            foreignKey: {
                name: "vendorDetailsId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        VenderZones.belongsTo(models.zones, {
            foreignKey: {
                name: "zoneId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
    };
    
    VenderZones.afterCreate(function(ins, opt) {
        var auditTrailData = {
                modelName: ins['$modelOptions'].name.singular,
                tableName: ins['$modelOptions'].name.plural,
                pastData: '',
                currentData: JSON.stringify(ins.dataValues),
                action: "create",
                createdBy: typeof requestUserId != 'undefined' || requestUserId != '' ? requestUserId : 0,
                remoteIp: requestUserIp,
        };
        models.audittrails.create(auditTrailData).then(function (atd) {
        });
    });
    
    VenderZones.beforeUpdate(function(ins, opt) {
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

     VenderZones.afterDestroy(function(ins, opt) {
         var auditTrailData = {
                modelName: ins['$modelOptions'].name.singular,
                tableName: ins['$modelOptions'].name.plural,
                pastData: JSON.stringify(ins._previousDataValues),
                currentData: JSON.stringify(ins.dataValues),
                action: "delete",
                createdBy: typeof requestUserId != 'undefined' || requestUserId != '' ? requestUserId : 0,
                remoteIp: requestUserIp,
        };
        models.audittrails.create(auditTrailData).then(function (atd) {
        });
     });

    return VenderZones;
};