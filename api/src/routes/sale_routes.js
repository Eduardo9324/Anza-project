"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
const { Router } = require("express");
const saleRouter = Router();
// Importa aqui los modelos
const { Sale, Product }  = require('../db');


// Creo una venta con el id del producto, y actualiza el inventario en la base de datos
saleRouter.post('/', async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).send("Producto no encontado.");
    }

    if (product.stock < quantity) {
      return res.status(400).send("No hay suficientes existencias del producto.");
    }

    const price = product.price * quantity;
    const sale = await Sale.create({ quantity, price });
    await product.decrement('stock', { by: quantity });

    return res.status(201).json(sale);

  } catch (error) {
    console.error(error);
    return res.status(500).json("error", error);
  }
});

module.exports = saleRouter;