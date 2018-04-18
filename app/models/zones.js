"use strict";
/** 
* This is the zones model. 
* Creating schema for zones 
* 
* @class zones
*/

module.exports = function (sequelize, DataTypes) {
    var Zones = sequelize.define("zones", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        zoneName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Name is required');
                    }
                }
            }
        },
        seats: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Seats is required');
                    }
                }
            }
        },
        isActive: {type: DataTypes.BOOLEAN, defaultValue: true},
        isDelete: {type: DataTypes.BOOLEAN, defaultValue: false},
        createdOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},
        updatedOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},
    }, {
        timestamps: false
    });
    
    Zones.associate = function (models) {
        Zones.belongsTo(models.stadiums, {
            foreignKey: {
                name: "stadiumId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        Zones.hasMany(models.zones, {            
            foreignKey: {                
                name: "parentZoneId",
                notEmpty: false,               
            },
            as: 'subzones',
            onDelete: 'CASCADE',
            hooks: true
        });
        Zones.hasMany(models.vendorzones, {
            foreignKey: {
                name: "zoneId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        Zones.hasMany(models.orders, {
            foreignKey: {
                name: "zoneId",
                notEmpty: false
            },
           // onDelete: 'CASCADE',
            hooks: true
        });
        Zones.belongsTo(models.users, {
            foreignKey: {
                name: "createdBy",
                notEmpty: false
            }
        });
        Zones.belongsTo(models.users, {
            foreignKey: {
                name: "updatedBy",
                notEmpty: false
            }
        });
    };
    
    Zones.afterCreate(function(ins, opt) {
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
    
    Zones.beforeUpdate(function(ins, opt) {
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

     Zones.afterDestroy(function(ins, opt) {
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

    return Zones;
};