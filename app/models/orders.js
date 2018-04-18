"use strict";

module.exports = function (sequelize, DataTypes) {
    var Orders = sequelize.define("orders", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        row: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Row is required');
                    }
                }
            }
        },
        seatNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Seat Number is required');
                    }
                }
            }
        },
        totalPrice:{ type: DataTypes.STRING,},
        deliveryCharge:{ type: DataTypes.STRING,},
        grandTotal:{ type: DataTypes.STRING,},
        itemType:{ type: DataTypes.INTEGER,},
        isDelete: {type: DataTypes.BOOLEAN, defaultValue: false},
        createdOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},
    }, {
        timestamps: false
    });
    
    Orders.associate = function (models) {
        Orders.belongsTo(models.users, {
            foreignKey: {
                name: "userId",
                notEmpty: true
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        Orders.belongsTo(models.stadiums, {
            foreignKey: {
                name: "stadiumId",
                notEmpty: true
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        Orders.belongsTo(models.zones, {
            foreignKey: {
                name: "zoneId",
                notEmpty: true
            },
            as: 'zones',
            onDelete: 'CASCADE',
            hooks: true
        });
        Orders.belongsTo(models.zones, {
            foreignKey: {
                name: "subZoneId",
                notEmpty: true
            },
            as: 'subzones',
            onDelete: 'CASCADE',
            hooks: true
        });
        Orders.hasMany(models.orderitems, {
            foreignKey: {
                name: "orderId",
                notEmpty: true
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        Orders.hasMany(models.orderdealsitems, {
            foreignKey: {
                name: "orderId",
                notEmpty: true
            },
            onDelete: 'CASCADE',
            hooks: true
        });
    };
    
    Orders.afterCreate(function(ins, opt) {
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
    
    Orders.afterDestroy(function(ins, opt) {
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

    return Orders;
};