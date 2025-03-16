const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Phone = require('./Phone');

const Evaluation = sequelize.define('Evaluation', {
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
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'evaluation',
    timestamps: false
});

Phone.hasMany(Evaluation, { foreignKey: 'fk_phone' });
Evaluation.belongsTo(Phone, { foreignKey: 'fk_phone' });

module.exports = Evaluation;
