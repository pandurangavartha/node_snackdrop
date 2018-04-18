"use strict";

module.exports = function (sequelize, DataTypes) {
    var VendorConfig = sequelize.define("vendorconfig", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        keyName: {
            type: DataTypes.STRING
        },
        values: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        updatedOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},
    }, {
        timestamps: false
    });
    
    VendorConfig.associate = function (models) {
        VendorConfig.belongsTo(models.vendordetails, {
            foreignKey: {
                name: "vendorDetailsId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
    };
    
    VendorConfig.beforeUpdate(function(ins, opt) {
        var dt = dateTime.create();
        var formatted = dt.format('Y-m-d H:M:S');
        ins.updatedOn = formatted;
    });
    
    return VendorConfig;
};