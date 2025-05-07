const { Sequelize } = require("sequelize");
require("dotenv").config();

const connection = new Sequelize({
  dialect: "sqlite",
  storage: "./database/database.sqlite",
});

module.exports = connection;
