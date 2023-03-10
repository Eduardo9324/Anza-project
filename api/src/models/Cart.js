"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Cart",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      total: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: false,
    }
  );
};
