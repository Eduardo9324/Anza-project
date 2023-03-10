"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
const { Router } = require("express");
// Importar rutas
const users = require("./users_routers");
const products = require("./products._routers");
const purchases = require("./purchase_routes");
const sales = require("./sale_routes");
const cart = require("./cart_routes");


const router = Router();

// Enrutado
router.use("/user", users);
router.use("/products", products);
router.use("/purchases", purchases);
router.use("/sales", sales);
router.use("/cart", cart);




module.exports = router;