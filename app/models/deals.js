"use strict";

module.exports = function (sequelize, DataTypes) {
    var Deals = sequelize.define("deals", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {
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
        image: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Image is required');
                    }
                }
            }
        },
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
      /*  quantity: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Quantity is required');
                    }
                }
            }
        },*/
        shortDesc: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Short Description is required');
                    }
                }
            }
        },
        longDesc: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Long Description is required');
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
    
    Deals.associate = function (models) {
        Deals.belongsTo(models.stadiums, {
            foreignKey: {
                name: "stadiumId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        Deals.belongsToMany(models.products, {
            through : models.dealsproducts,
            foreignKey: {
                name: "dealId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        Deals.belongsTo(models.users, {
             foreignKey: {
                 name: "createdBy",
                 notEmpty: false
             },
        });
        Deals.belongsTo(models.users, {
            foreignKey: {
                name: "updatedBy",
                notEmpty: false
            }
        });
    };
    
    Deals.afterCreate(function(ins, opt) {
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
    Deals.beforeUpdate(function(ins, opt) {
        
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
    Deals.afterDestroy(function(ins, opt) {
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

    return Deals;
};