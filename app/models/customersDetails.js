"use strict";

module.exports = function (sequelize, DataTypes) {
    var CustomerDetails = sequelize.define("customerdetails", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        //userId : {type: DataTypes.INTEGER},
//        dtId : {type: DataTypes.INTEGER},
        mobile: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Mobile is required');
                    }
                }
            }
        },
        dob: {type: DataTypes.DATEONLY},
        facebookId: {
            type: DataTypes.STRING,
        },
        deviceToken: {
            type: DataTypes.TEXT
        },
        authTokenJWT: {
            type: DataTypes.TEXT,
        },
        
        createdOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},
        updatedOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},

    }, {
        timestamps: false
    });
    
    CustomerDetails.associate = function (models) {
        CustomerDetails.belongsTo(models.users, {
            foreignKey: {
                name: "userId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        CustomerDetails.belongsTo(models.devicetypes, {
            foreignKey: {
                name: "dtId",
                notEmpty: true
            }
        });
    }
    
    CustomerDetails.afterCreate(function(ins, opt) {
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
    
    CustomerDetails.beforeUpdate(function(ins, opt) {
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

    CustomerDetails.afterDestroy(function(ins, opt) {
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

    return CustomerDetails;
};