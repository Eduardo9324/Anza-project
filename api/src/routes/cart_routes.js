"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
const { Router } = require("express");
const { Product, Cart } = require("../db");

const cartRouter = Router();

/* cartRouter.post("/", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "El campo userId es obligatorio" });
    }

    const product = await Product.findByPk(productId);
    const [cart] = await Cart.findOrCreate({ where: { userId } });
    const products = await cart.addProductWithQuantity(product, quantity);
    console.log(products)
    res.status(200).json({ message: "Producto añadido al carrito", products });
    
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al agregar el producto al carrito" });
  }
}); */
cartRouter.post("/", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "El campo userId es obligatorio" });
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: "El producto no existe" });
    }

    const [cart] = await Cart.findOrCreate({ where: { userId } });
    const cartProduct = await cart.getProducts({
      where: { id: product.id },
    });

    if (cartProduct.length > 0) {
      // Si el producto ya está en el carrito, actualizamos la cantidad
      const updatedProduct = await cartProduct[0].Product.update({
        quantity: cartProduct[0].Product.quantity + quantity,
      });
      res
        .status(200)
        .json({
          message: "Cantidad de producto actualizada",
          product: updatedProduct,
        });
    } else {
      // Si el producto no está en el carrito, lo agregamos con la cantidad especificada
      const cartProduct = await cart.addProduct(product, {
        through: { quantity },
      });
      res
        .status(200)
        .json({ message: "Producto añadido al carrito", product: cartProduct });
    }

  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al agregar el producto al carrito" });
  }
});


// Realiza la compra
cartRouter.post("/buy", async (req, res) => {
  try {
    const { id } = req.body;

    const product = await Product.findByPk(id);

    // Se busca el producto por su id. Si no se encuentra, se responde con un código 404
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Se verifica si hay existencias del producto.
    if (product.stock <= 0) {
      return res.json({ message: "No hay existencias de este producto" });
    }

    // Se busca o crea el carrito del usuario. Se utiliza destructuring para obtener el primer elemento del arreglo que devuelve findOrCreate, ya que sólo se espera que haya un carrito para cada usuario.
    const [cart] = await Cart.findOrCreate({ where: { userId: req.user.id } });
    const products = await cart.getProducts({ where: { id } });

    if (products.length > 0) {
      // Si el producto ya está en el carrito, se aumenta su cantidad
      const productInCart = products[0];
      const currentQuantity = productInCart.CartProduct.quantity;
      const newQuantity = currentQuantity + 1;
      await cart.addProduct(productInCart, {
        through: { quantity: newQuantity },
      });
    } else {
      // Si el producto no está en el carrito, se agrega con cantidad 1
      await cart.addProduct(product, { through: { quantity: 1 } });
    }
    // Se disminuye el stock del producto
    await product.update({ stock: product.stock - 1 });
    res.json({ message: "Compra realizada con éxito" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al comprar el producto" });
  }
});



module.exports = cartRouter;