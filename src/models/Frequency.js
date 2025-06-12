const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Phone = require('./Phone');

const Frequency = sequelize.define('Frequency', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fk_phone: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Phone,
            key: 'id'
        }
    },
    interactions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'frequency',
    timestamps: false
});

Phone.hasMany(Frequency, { foreignKey: 'fk_phone' });
Frequency.belongsTo(Phone, { foreignKey: 'fk_phone' });

module.exports = Frequency;