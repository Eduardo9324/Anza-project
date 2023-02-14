"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
require("dotenv").config();
const { Router } = require("express");
const userRouter = Router();
// Requiero estas dependencias para la autenticacion del usuario
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Importa el modelo
const { User } = require("../db")


// Obtener usuarios - Funsiona
userRouter.get("/", async (req, res) => {
  const allUsers = await User.findAll();
  try {
    allUsers ? res.status(200).json(allUsers) : res.status(404).send("No hay usuarios")
  } catch (error) {
    res.status(400).json(error)
  }
});


// obtener usuario por su id - Funsiona
userRouter.get("/id", async (req, res) => {
  const { id } = req.query

  try {
    const findUser = await User.findByPk(id);

    if (!findUser) {
      res.status(404).send("Usuario no encontrado");
    } else {
      return res.status(200).json(findUser);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});


// busca usuario, si no existe lo crea - Funsiona
userRouter.post("/", async (req, res) => {
  const { id, name, email } = req.body;

  if (!id) {
    try {
      res.status(201).send("No hay id");
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  } else {
    try {
      const findUser = await User.findOne({ where: { id: id } });

      if (findUser) {
        res.status(201).send("Usuario ya existe");
      } else {
        const newUser = await User.findOrCreate({ where: { id, name, email } });

        res.status(201).json(newUser);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  }
});


// Actualiza los datos del usuario - Funsiona
userRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address } = req.body;

  if (!id) {
    return res.status(400).send("No se paso un id correcto.");
  }

  const findUser = await User.findOne({ where: { id: id } });

  if (!findUser) {
    return res.status(400).send("Usuario no encontrado.");
  }

  try {
    if (name && phone && email && address) {
      await findUser.update({ name, phone, email, address });
      return res.status(200).json(findUser);
    } else {
      return res.status(400).send("Faltan informacion para actualizar el usuario.");
    }
  } catch (error) {
    console.log("Error in PUT request", error);
    return res.status(400).json(error);
  }
});


// Elimina un usuario - Funsiona
userRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send("No se ha proporcionado un id.");
  }

  try {
    const findUser = await User.findOne({ where: { id: id } });

    if (!findUser) {
      return res.status(400).send("Usuario no encontrado.");
    } else {
      await findUser.destroy();
      return res.status(200).send("Usuario eliminado correctamente.");
    }

  } catch (error) {
    console.log("Error en la solicitud DELETE", error);
    return res.status(400).json(error);
  }
});


// Ruta de registro de usuario - Funsiona
userRouter.post("/registro", async (req, res) => {
  const { id, name, phone, email, address, password } = req.body;

  if (!id || !name || !phone || !email || !address || !password) {
    return res.status(400).send("Faltan datos obligatorios para el registro.");
  }

  try {
    const existUser = await User.findOne({ where: { id: id } });

    if (existUser) {
      return res.status(400).send("Este usuario ya está registrado.");
    }

    // crea una contraseña encriptada
    const hashedPassword = await bcrypt.hash(password, 8);

    // crea el usuario en la base de datos
    const newUser = await User.create({
      id,
      name,
      phone,
      email,
      address,
      password: hashedPassword
    });

    newUser
      ? res.status(201).json(newUser)
      : res.status(404).send("No se encontro usuario !!!");
  } catch (error) {
    console.log("Error en la solicitud de registro", error);
    return res.status(400).json(error);
  }
});


// Ruta de inicio de sesión - Finsiona
userRouter.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Verificar si el usuario existe
      const verifyUser = await User.findOne({ where: { email } });
      if (!verifyUser) {
        return res
          .status(401)
          .send("Correo electrónico incorrecto.");
      }

      // Verificar la contraseña
      const isPasswordValid = await bcrypt.compare(password, verifyUser.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .send("Contraseña incorrecta.");
      }

      // Crear un token JWT
      const token = jwt.sign(
        { userId: verifyUser.id },
        process.env.ACCESS_TOKEN_SECRET
      );

      // Enviar el token como una cookie HTTP
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
      });
      res.status(200).send("Inicio de sesión exitoso");

    } catch (error) {
      console.error(error);
      return res.status(500).json("Error al iniciar sesión", error);
    }
  });

// Ruta de cierre de sesion - Funsiona
userRouter.post("/logout", async (req, res) => {
  try {
    // Eliminar la cookie del token JWT
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).send("Cierre de sesión exitoso");
    
  } catch (error) {
    console.error(error);
    return res.status(500).json("Error al cerrar sesión", error);
  }
});



module.exports = userRouter;