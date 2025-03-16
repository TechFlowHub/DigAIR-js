const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Phone = require('./Phone');

const RepeatOffenderPhone = sequelize.define('RepeatOffenderPhone', {
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
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'repeat_offender_phone',
    timestamps: false
});

Phone.hasMany(RepeatOffenderPhone, { foreignKey: 'fk_phone' });
RepeatOffenderPhone.belongsTo(Phone, { foreignKey: 'fk_phone' });

module.exports = RepeatOffenderPhone;
