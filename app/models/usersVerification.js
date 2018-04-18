"use strict";

module.exports = function (sequelize, DataTypes) {
    var UserVerifications = sequelize.define("userverifications", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        code: {type: DataTypes.STRING},
        isActive: {type: DataTypes.BOOLEAN,defaultValue: false},
        createdOn: {type: DataTypes.DATE, defaultValue: Sequelize.NOW},
        type: DataTypes.ENUM('forgetpassword')
    },{
        timestamps: false
    });
    
    UserVerifications.associate = function (models) {
        UserVerifications.belongsTo(models.users, {
            onDelete: 'CASCADE',
            hooks: true,
           // as:'user',
            foreignKey: {
                name:'userId',
                allowNull: false
            }
        });
    };
    
    return UserVerifications;
};