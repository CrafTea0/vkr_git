const Sequelize = require('sequelize');
const sequelize = require('../utils/database')

const User = sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    id_partner: {
      type: Sequelize.STRING,
      allowNull: true
    },
    main_token: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    main_token_exp_time: {
      type: 'DATETIME',
      defaultValue: Sequelize.DataTypes.NOW,
      allowNull: false
    }
  });

module.exports = User