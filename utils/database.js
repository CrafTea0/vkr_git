const Sequelize = require('sequelize');
const keys = require('../keys')

const sequelize = new Sequelize(keys.NAME_DB, keys.LOGIN_DB, keys.PASSWORD_DB, {
  dialect: "mysql",  
  host: "localhost",
  timezone: '+05:00'
})


module.exports = sequelize