const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ads_db', 'root', '532443Nikita', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging: false
});

module.exports = sequelize;