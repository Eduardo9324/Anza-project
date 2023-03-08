"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
const { Router } = require("express");
const { Purchase } = require("../db");

const purchaseRouter = Router();

// Obtener las compras - Funsiona
purchaseRouter.get("/", async (req, res) => {
  try {
    const allPurcheses = await Purchase.findAll();
    allPurcheses
      ? res.status(200).json(allPurcheses)
      : res.status(404).send("No hay compras.");
    
  } catch (error) {
    res.status(400).json(error);
  }
});


// Obtener compra por id - Funsiona
purchaseRouter.get("/:id", async (req, res) => {
  const { id } = req.query;

  try {
    const findPurchase = await Purchase.findByPk(id);

    if (!findPurchase) {
      res.status(404).send("Compra no encontrado");
    } else {
      return res.status(200).json(findPurchase);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});


// crear compra - Funsiona
purchaseRouter.post("/create", async (req, res) => {
  const { address, total } = req.body;
  
  if (!address || !total) {
    return res.status(400).send("Faltan datos obligatorios para completar la compra.");
  }

  try {
    const newPurchase = await Purchase.create({
      address,
      total,
    });

    newPurchase
      ? res.status(201).json(newPurchase)
      : res.status(404).send("No se encontro compra !!!");
    
  } catch (error) {
    console.log("Error en la solicitud de registro", error);
    return res.status(400).json(error);
  }
});


// Actualizar la compra - Funsiona
purchaseRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { address, total } = req.body;

  if (!id) {
    return res.status(400).send("No se paso un id correcto.");
  }

  const findPurchase = await Purchase.findOne({ where: { id: id } });

  if (!findPurchase) {
    return res.status(400).send("Compra no encontrado.");
  }

  try {
    if (address && total) {
      await findPurchase.update({
        address,
        total
      });
      return res.status(200).json(findPurchase);
    } else {
      return res.status(400).send("Faltan datos para actualizar la compra.");
    }

  } catch (error) {
    console.log("Error in PUT request", error);
    return res.status(400).json(error);
  }
});


// Eliminar la Compra - Funsiona
purchaseRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send("No se ha proporcionado un id.");
  }

  try {
    const findPurchase = await Purchase.findOne({ where: { id: id } });

    if (!findPurchase) {
      return res.status(400).send("Compra no encontrado.");
    } else {
      await findPurchase.destroy();
      return res.status(200).send("Compra eliminada correctamente.");
    }
  } catch (error) {
    console.log("Error en la solicitud DELETE", error);
    return res.status(400).json(error);
  }
});


module.exports = purchaseRouter;