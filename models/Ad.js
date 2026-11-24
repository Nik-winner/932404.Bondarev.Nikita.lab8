const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ad = sequelize.define('Ad', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true, len: [3, 255] }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0
        }
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: [['electronics', 'transport', 'books', 'hobby', 'other']]
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'sold', 'archived'),
        allowNull: false,
        defaultValue: 'active'
    }
}, {
    tableName: 'ads',
    timestamps: true
});

module.exports = Ad;