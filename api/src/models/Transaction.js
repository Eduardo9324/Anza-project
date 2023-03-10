"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Transaction",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      productsID: {
        type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.STRING)),
        defaultValue: [],
      },
      total: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
    },
    {
      timestamps: false
    }
  );
};
