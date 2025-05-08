const { Sequelize } = require("sequelize");
require("dotenv").config();

const connection = new Sequelize({
  dialect: "sqlite",
  storage: "./src/database/database.sqlite",
  logging: false, // Desativa o log das consultas
});

module.exports = connection;
