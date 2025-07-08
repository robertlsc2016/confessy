const { Sequelize } = require("sequelize");
const connection = require("./database");

const Perguntas = connection.define(
  "perguntas",
  {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    datacriacao: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    image_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {}
);

Perguntas.sync({ force: false }).then(() => {});
module.exports = Perguntas;
