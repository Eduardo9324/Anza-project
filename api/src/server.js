"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
const express = require("express");
const createError = require("http-errors");
const helmet = require("helmet");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

require("./db.js");
const routes = require("./routes/index");
const server = express();

// Middlewares
// Mejora los niveles de seguridad de la aplicacion
server.use(helmet());
// Acepta solicitudes HTTP desde dominios externos
server.use(cors());

// Hora y fecha de las solicitudes
const logTime = (req, res, next) => {
  console.log(
    `Date: ${new Date().toString()} - Method: ${req.method} - URL: ${req.url}`
  );
  next();
};

// Registro de informacion HTTP en la consola del servidor
server.use(logger("dev"));
// Analiza las solicitudes HTTP a travez de la codificacion URL
server.use(express.urlencoded({ extended: false, limit: "100mb" }));
// Analizador de la solicitudes body json
server.use(express.json());
// Permite establecer cookies en las solicitudes entrantes y salientes
server.use(cookieParser());
// Permite metodos HTTP y establece cabeceras
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

server.use(logTime);
server.use("/api", routes);

// Manejo de error 404
server.use((req, res, next) => {
  next(createError(404));
});

// Manejo de errores
server.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.server?.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });

  next();
});

module.exports = server;