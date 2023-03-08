"use strict"; // Uso modo estricto para depurar errores silenciosos de JavaScript
// Importa el servidor
const server = require("./src/server");
// Importa la base de datos
const { conn } = require("./src/db");
// Variable de entorno al puerto del servidor
const port = process.env.PORT || 3001;


// Funsion que verifica y comprueba la conexion del servidor y la base de datos
const testConection = async () => {
  try {
    await conn.authenticate();
    console.log("Conection ok");
    await conn.sync({ force: true }).then(() => {
      server.listen(port, () => {
        console.log(`%s listening at ${port}`);
      });
    });
  } catch (error) {
    console.log("Error en la conexion", error);
  }
};

testConection();