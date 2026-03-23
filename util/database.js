const Sequelize = require("sequelize");

const sequelize = new Sequelize("Max_course", "root", "root", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
