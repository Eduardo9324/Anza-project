"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
// Variables de entorno
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;

const sequelize = new Sequelize(
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
  {
    logging: false,
    native: false,
  }
);
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
const modelFiles = fs
  .readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  );

modelFiles.forEach((file) => {
  modelDefiners.push(require(path.join(__dirname, "/models", file)));
});

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));

// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { User, Product, Purchase, Sale, Cart, Book, Transaction } =
  sequelize.models;

// Aca vendrian las relaciones

// UNO A MUCHOS
// Usuario puede tener varias compras
User.hasMany(Purchase);
// Una compra pertenece a un usuario
Purchase.belongsTo(User);

// MUCHOS A MUCHOS
// Una compra puede tener varios productos y un producto puede estar en varias compras
Purchase.belongsToMany(Product, { through: "PurchaseItem" });
Product.belongsToMany(Purchase, { through: "PurchaseItem" });

// MUCHOS A MUCHOS
// Un usuario puede comprar muchos productos u un producto puede ser comprado por muchos usuarios
User.belongsToMany(Product, { through: "UserProc" });
Product.belongsToMany(User, { through: "UserProc" });

// uno a muchos - un producto puede tener muchas ventas
Product.hasMany(Sale);
// Un producto solo puede terner una venta
Sale.belongsTo(Product);

Purchase.hasMany(Sale)
Sale.belongsTo(Purchase);

// Relacion de usuario con caroo de compras
User.hasMany(Cart);
Cart.belongsTo(User);

// Relacion de carro de compras con productos
Cart.belongsToMany(Product, { through: "CartProduct" });
Product.belongsToMany(Cart, { through: "CartProduct" });


Transaction.belongsToMany(Product, { through: "transactions-products" });
Product.belongsToMany(Transaction, { through: "transactions-products" });


Transaction.belongsTo(User);
User.hasMany(Transaction);


module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
