"use strict";

module.exports = function (sequelize, DataTypes) {
    var OrderDealItems = sequelize.define("orderdealsitems", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        price: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Price is required');
                    }
                }
            }
        },
        quantity: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Quantity is required');
                    }
                }
            }
        },
           isActive: {type: DataTypes.BOOLEAN, defaultValue: false},
    }, {
        timestamps: false
    });
    
    OrderDealItems.associate = function (models) {
        OrderDealItems.belongsTo(models.orders, {
            foreignKey: {
                name: "orderId",
                notEmpty: false,
                onDelete: "CASCADE",
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        OrderDealItems.belongsTo(models.deals, {
            foreignKey: {
                name: "dealId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        OrderDealItems.belongsTo(models.status, {
            foreignKey: {
                name: "statusId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
       /* OrderDealItems.belongsTo(models.dealsproducts, {
            foreignKey: {
                name: "dealId",
                notEmpty: false
            },
             targetKey : "dealId",
            onDelete: 'CASCADE',
            hooks: true
        });*/
    };
    
    OrderDealItems.afterCreate(function(ins, opt) {
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
   
    OrderDealItems.afterDestroy(function(ins, opt) {
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

    return OrderDealItems;
};