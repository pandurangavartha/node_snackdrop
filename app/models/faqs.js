"use strict";

module.exports = function (sequelize, DataTypes) {
    var Faqs = sequelize.define("faqs", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        question: {type: DataTypes.TEXT},
        answer: {type: DataTypes.TEXT},
        createdBy: DataTypes.INTEGER,
        updatedBy: DataTypes.INTEGER,
        isActive: {type: DataTypes.BOOLEAN, defaultValue: true},
        isDelete: {type: DataTypes.BOOLEAN, defaultValue: false},
        createdOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},
        updatedOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},
    }, {
        timestamps: false
    });
    
    Faqs.beforeUpdate(function(ins, opt) {
        var dt = dateTime.create();
        var formatted = dt.format('Y-m-d H:M:S');
        ins.updatedOn = formatted;
    });
    
    return Faqs;
};