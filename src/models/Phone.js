const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Phone = sequelize.define('Phone', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    phone: {
        type: DataTypes.STRING(25),
        allowNull: false,
        unique: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'phone',
    timestamps: false
});

module.exports = Phone;
