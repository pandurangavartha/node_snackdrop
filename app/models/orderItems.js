"use strict";

module.exports = function (sequelize, DataTypes) {
    var OrderItems = sequelize.define("orderitems", {
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
    
    OrderItems.associate = function (models) {
        OrderItems.belongsTo(models.orders, {
            foreignKey: {
                name: "orderId",
                notEmpty: false,
                onDelete: "CASCADE",
            },
            onDelete: 'CASCADE',
            hooks: true            
        });
        OrderItems.belongsTo(models.products, {
            foreignKey: {
                name: "productId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        OrderItems.belongsTo(models.status, {
            foreignKey: {
                name: "statusId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
    };
    
    OrderItems.afterCreate(function(ins, opt) {
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
   
    OrderItems.afterDestroy(function(ins, opt) {
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

    return OrderItems;
};