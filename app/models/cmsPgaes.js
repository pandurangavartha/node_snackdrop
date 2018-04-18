"use strict";


module.exports = function (sequelize, DataTypes) {
    var CmsPages = sequelize.define("cmspages", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Title is required');
                    }
                }
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Content is required');
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
    
    CmsPages.associate = function (models) {
        CmsPages.belongsTo(models.users, {
            foreignKey: {
                name: "createdBy",
                notEmpty: false
            }
        });
        CmsPages.belongsTo(models.users, {
            foreignKey: {
                name: "updatedBy",
                notEmpty: false
            }
        });
    }
    
    CmsPages.beforeUpdate(function(ins, opt) {
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

    return CmsPages;
};