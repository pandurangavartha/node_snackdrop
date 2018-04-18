"use strict";

module.exports = function (sequelize, DataTypes) {
    var DealsProducts = sequelize.define("dealsproducts", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    }, {
        timestamps: false
    });
    
    DealsProducts.associate = function (models) {
        DealsProducts.belongsTo(models.deals, {
            foreignKey: {
                name: "dealId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
        DealsProducts.belongsTo(models.products, {
            foreignKey: {
                name: "productId",
                notEmpty: false
            },
            onDelete: 'CASCADE',
            hooks: true
        });
    };
    
    return DealsProducts;
};