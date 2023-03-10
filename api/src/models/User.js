"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true, // el campo no debe estar vacío
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isNumeric: true, // el campo debe ser numérico
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true, // el campo debe ser una dirección de correo electrónico válida
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          isLongEnough(value) {
            if (value.length < 8) {
              throw new Error("La contraseña debe tener al menos 8 caracteres");
            }
          },
        },
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
};
