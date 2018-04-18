"use strict";
/**
 * Product Category model
 * @param {type} sequelize
 * @param {type} DataTypes
 * @returns {module.exports.ProductCategory|nm$_productCategory.module.exports.ProductCategory}
 */
module.exports = function (sequelize, DataTypes) {
    var ProductCategory = sequelize.define("productcategory", {
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
        isActive: {type: DataTypes.BOOLEAN, defaultValue: true},
        isDelete: {type: DataTypes.BOOLEAN, defaultValue: false},
        createdOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},
        updatedOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},

    }, {
        timestamps: false
    });
    /*Associate models*/
    ProductCategory.associate = function (models) {
        ProductCategory.belongsTo(models.stadiums, {
            foreignKey: {
                name: "stadiumId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        ProductCategory.belongsTo(models.users, {
            foreignKey: {
                name: "createdBy",
                notEmpty: false
            }
        });
        ProductCategory.belongsTo(models.users, {
            foreignKey: {
                name: "updatedBy",
                notEmpty: false
            }
        });
    };
    /*add logs*/
    ProductCategory.afterCreate(function(ins, opt) {
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
    
    ProductCategory.beforeUpdate(function(ins, opt) {
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

     ProductCategory.afterDestroy(function(ins, opt) {
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

    return ProductCategory;
};