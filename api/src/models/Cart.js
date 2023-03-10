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
      },
      productsID: {
        type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.STRING)),
        defaultValue: [],
      },
      total: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      timestamps: false,
    }
  );
};
