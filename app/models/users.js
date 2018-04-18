"use strict";
module.exports = function (sequelize, DataTypes) {
    var Users = sequelize.define("users", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
//        roleId: {type: DataTypes.INTEGER},
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
        email: {
            type: DataTypes.STRING,
            unique: {args: true, msg: "Email id already exist."},
            allowNull: false,
            validate: {
                isEmail: {args: true, msg: "Email id is not valid."},
                fn: function (val) {
                    if (typeof val == 'undefined' || val == '' || val == null) {
                        throw new Error('Email id is required');
                    }
                }
            }
        },
        password: {
            type: DataTypes.STRING,
//            allowNull: false,
//            validate: {
//                fn: function (val) {
//                    if (typeof val == 'undefined' || val == '' || val == null) {
//                        throw new Error('Password is required');
//                    }
//                }
//            }
        },
        isActive: {type: DataTypes.BOOLEAN, defaultValue: true},
        isDelete: {type: DataTypes.BOOLEAN, defaultValue: false},
        createdOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},
        updatedOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},

    }, {
        timestamps: false
    }, {
      indexes: [
        {
          unique: true,
          fields: ['email']
        }
      ]
    });
    
    Users.associate = function (models) {
        Users.belongsTo(models.roles, {
            onDelete: "CASCADE",
            foreignKey: {
                name: "roleId",
                notEmpty: false
            }
        });
        Users.hasOne(models.customerdetails, {
            foreignKey: {
                name: "userId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        Users.hasOne(models.vendordetails, {
            foreignKey: {
                name: "userId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
    };
    
    Users.afterCreate(function(ins, opt) {
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
    
    Users.beforeUpdate(function(ins, opt) {
        
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

     Users.afterDestroy(function(ins, opt) {
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

    return Users;
};