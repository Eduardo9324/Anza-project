"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
require("dotenv").config();
const { Router } = require("express");
const userRouter = Router();
// Requiero estas dependencias para la autenticacion del usuario
// Encriptado de contaseña
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Permite cargar archivos de tipo imagen
const multer = require("multer");
// Validator para menejar validaciones de los datos de los usuarios.
const validator = require("validator");
// Importa el modelo
const { User } = require("../db");


// Configuración de multer para permitir manipular archivos de tipo imagen.
/* const storage = multer.diskStorage({
  destination: "src/imgs",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
}); */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
  },
});
// Indica donde se deben guardar los archivos cargados
const upload = multer({ storage });

// RUTAS DE USUARIO


// Obtener lista de usuarios, solo datos especificos - Funsiona
userRouter.get("/", async (req, res) => {
  const { limit = 10, offset = 0, fields = "" } = req.query;

  // Valido que sean numeros enteros.
  const parsedLimit = Math.abs(parseInt(limit));
  const parsedOffset = Math.abs(parseInt(offset));

  // valida que limit y offset sean numeros enteros positivos
  if (
    isNaN(parsedLimit) ||
    isNaN(parsedOffset) ||
    parsedLimit < 0 ||
    parsedOffset < 0
  ) {
    return res
      .status(400)
      .send(
        "Los parámetros de límite y desplazamiento deben ser números enteros positivos."
      );
  }

  // Selecciona campos especificos para la consulta, no muestra informacion sencible
  const allowedFields = ["id", "name", "email"];
  const selectedFields = fields
    .split(",")
    .filter((field) => allowedFields.includes(field.trim()));

  // Valido los campos seleccionados
  if (!selectedFields.every((field) => allowedFields.includes(field))) {
    return res.status(400).send("Uno o más campos seleccionados no existen.");
  };

  if (selectedFields.length > 3) {
    return res.status(400).send("Demasiados campos seleccionados.");
  };

  try {
    // Consulta de usuarios paginados y seleccionados, evita sobre cargar del servidor
    const users = await User.findAll({
      attributes: selectedFields.length > 0 ? selectedFields : allowedFields,
      limit: Math.min(parsedLimit, 100),
      offset: parsedOffset,
    });

    // Verifica si existen usuarios
    if (users.length === 0) {
      return res.status(404).send("No se encontraron usuarios.");
    };

    // Respuesta con los usuarios encontrados
    return res.status(200).json(users);
  } catch (error) {
    // Respuesta con el error de la consulta
    console.log(error);
    return res.status(500).json({ error: "Error al obtener los usuarios" });
  };
});



// obtener usuario por su id - Funsiona
userRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  // Valida que el id sea un numero entero.
  if (isNaN(parseInt(id))) {
    return res.status(400).send("El parámetro ID debe ser un número entero.");
  };

  try {
    // Limita los datos que se van a entregar.
    const findUser = await User.findByPk(id, {
      attributes: ["id", "name", "email"]
    });

    // Verifica que el usuario exista.
    if (!findUser) {
      res.status(404).send("Usuario no encontrado");
    } else {
      return res.status(200).json(findUser);
    };

  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  };
});


// busca usuario, si no existe lo crea - Funsiona
userRouter.post("/", async (req, res) => {
  const { id, name, email } = req.body;

  if (!id) {
    try {
      res.status(201).send("No hay id");
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  } else {
    try {
      const findUser = await User.findOne({ where: { id: id } });

      if (findUser) {
        res.status(201).send("Usuario ya existe");
      } else {
        const newUser = await User.findOrCreate({ where: { id, name, email } });

        res.status(201).json(newUser);
      };

    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    };
  };
});


// Actualiza los datos del usuario - Funsiona
userRouter.put("/:id", upload.single("imagen"), async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address } = req.body;
  const profileImage = req.file?.filename;

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
      // Verifica y actualiza el archivo de imagen
      if (profileImage) {
        await findUser.update({ profileImage });
      }

      return res.status(200).json(findUser);
    } else {
      return res
        .status(400)
        .send("Faltan informacion para actualizar el usuario.");
    }
  } catch (error) {
    console.log("Error in PUT request: ", error);
    return res.status(400).json(error);
  }
});


// Elimina un usuario - Funsiona
userRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send("No se ha proporcionado un id.");
  };

  try {
    const findUser = await User.findOne({ where: { id: id } });

    if (!findUser) {
      return res.status(400).send("Usuario no encontrado.");
    } else {
      await findUser.destroy();
      return res.status(200).send("Usuario eliminado correctamente.");
    };

  } catch (error) {
    console.log("Error en la solicitud DELETE", error);
    return res.status(400).json(error);
  };
});


// Ruta de registro de usuario - Funsiona
userRouter.post("/registro", upload.single("imagen"), async (req, res) => {
  const { id, name, phone, email, address, password } = req.body;
  const profileImage = req.file?.filename;

  if (!id || !name || !phone || !email || !address || !password) {
    return res.status(400).send("Faltan datos obligatorios para el registro.");
  }

  // Validacion de correo electrónico.
  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ error: "El correo electrónico ingresado no es válido." });
  }

  // Validacion de telefono.
  const telefonoRegex = /^[0-9]+$/;
  if (!telefonoRegex.test(phone)) {
    return res
      .status(400)
      .json({ error: "El numero de telefono ingresado no es válido." });
  }

  // Valida que se haya subido una foto de perfil.
  /* if (!profileImage) {
    return res
      .status(400)
      .send("Se requiere una imagen de perfil para el registro.");
  } */

  try {
    const existUser = await User.findOne({ where: { id: id } });

    if (existUser) {
      return res.status(400).send("Este usuario ya está registrado.");
    }

    // crea una contraseña encriptada para guardarla en la DB
    const hashedPassword = await bcrypt.hash(password, 8);

    // crea el usuario en la base de datos
    const newUser = await User.create({
      id,
      name,
      phone,
      email,
      address,
      password: hashedPassword,
      profileImage,
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
      };

      // Verificar la contraseña
      const isPasswordValid = await bcrypt.compare(password, verifyUser.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .send("Contraseña incorrecta.");
      };

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
  };
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
  };
});



module.exports = userRouter;