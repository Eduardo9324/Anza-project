"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
const { Router } = require("express");
const { Product } = require("../db");

const productRouter = Router();

// Obtener productos - Funsiona
productRouter.get("/", async (req, res) => {
  try {
    const allProducts = await Product.findAll();
    allProducts
      ? res.status(200).json(allProducts)
      : res.status(404).send("No hay productos.");
  } catch (error) {
    res.status(400).json(error);
  }
});


// Obtener producto por su id - Funsiona
productRouter.get("/id", async (req, res) => {
  const { id } = req.query;

  try {
    const findProduct = await Product.findByPk(id);

    if (!findProduct) {
      res.status(404).send("Producto no encontrado.");
    } else {
      return res.status(200).json(findProduct);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});


// Actualiza producto - Funsiona
productRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, state, category, stock } = req.body;

  if (!id) {
    return res.status(400).send("No se paso un id correcto.");
  }

  const findProduct = await Product.findOne({ where: { id: id } });

  if (!findProduct) {
    return res.status(400).send("Producto no encontrado.");
  }

  try {
    if ((name && description && price && image && state && category, stock)) {
      await findProduct.update({
        name,
        description,
        price,
        image,
        state,
        category,
        stock,
      });
      return res.status(200).json(findProduct);
    } else {
      return res.status(400).send("Faltan datos para actualizar el producto.");
    }
  } catch (error) {
    console.log("Error in PUT request", error);
    return res.status(400).json(error);
  }
});


// Eliminar producto - Funsiona
productRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send("No se ha proporcionado un id.");
  }

  try {
    const findProduct = await Product.findOne({ where: { id: id } });

    if (!findProduct) {
      return res.status(400).send("Producto no encontrado.");
    } else {
      await findProduct.destroy();
      return res.status(200).send("Producto eliminado correctamente.");
    }
  } catch (error) {
    console.log("Error en la solicitud DELETE", error);
    return res.status(400).json(error);
  }
});


// Crea un producto - Funsiona
productRouter.post("/create", async (req, res) => {
  const { name, description, price, image, state, category, stock } = req.body;

  if (
    !name ||
    !description ||
    !price ||
    !image ||
    !state ||
    !category ||
    !stock
  ) {
    return res
      .status(400)
      .send("Faltan datos obligatorios para crear el producto.");
  }

  try {
    const existProduct = await Product.findOne({ where: { name: name } });

    if (existProduct) {
      return res.status(400).send("Este producto ya fue creado.");
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      image,
      state,
      category,
      stock,
    });

    newProduct
      ? res.status(201).json(newProduct)
      : res.status(404).send("No se encontro el producto !!!");
  } catch (error) {
    console.log("Error en la solicitud de creacion", error);
    return res.status(400).json(error);
  }
});


// Promedios de calificacion - Funsiona
productRouter.post("/rating/:id", async (req, res) => {
  let califics = [];

  try {
    const { id } = req.params;
    const calf = req.body.rating;

    if (
      calf < 1 ||
      calf > 5 ||
      typeof calf !== "number" ||
      !Number.isInteger(calf)
    ) {
      res.status(400).send("Valores invalidos !!!");
    }

    califics.push(calf);

    let sum = califics.reduce((a, b) => a + b);
    let pro = Math.ceil(sum / califics.length);
    const proProduct = await Product.findByPk(id);
    await proProduct.update({ totalRating: pro }, { where: { id: id } });
    proProduct ? res.status(200).json(proProduct) : res.status(404).send("No se encontro promedio");
  } catch (error) {
    console.log(error)
  }
});


// Actualiza el promedio 
productRouter.put("/rating/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    rating < 1 || rating > 5
      ? res.status(400).send("Valores invalidos !!!")
      : rating;

    if (
      rating < 1 ||
      rating > 5 ||
      typeof rating !== "number" ||
      !Number.isInteger(rating)
    ) {
      res.status(400).send("Valores invalidos !!!");
    }

    if (id) {
      const findProduct = await Product.findByPk(id);
      const newRating = findProduct.rating + rating;
      const newRating2 = Math.ceil(newRating / findProduct.totalRating);
      const newTotalRating = findProduct.totalRating + 1;
      await findProduct.update(
        { totalRating: newTotalRating, rating: newRating2 },
        { where: { id: id } }
      );
      res.status(200).send("rating modificado con exito");
    } else {
      res.status(404).send("No se encontro ID");
    }
  } catch (error) {
    console.log("entre al error del put", error);
  }
});



module.exports = productRouter;