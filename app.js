import express from "express";
import usuariosRoutes from "./src/routes/usuarios.routes.js";
import cors from 'cors';
import { formatoRta } from "./src/scripts/formatoRta.js";
import pkg from 'express-validator';
const { body, query, matchedData, validationResult } = pkg;

const app = express();

// Use CORS middleware and allow all origins (you can specify domains instead of * if you want to restrict access)
app.use(cors({ origin: "*" }));

app.use(express.json());

app.listen(3000)

// Use your custom routes
app.use("/api", usuariosRoutes);

// Handle 404 errors for non-existing routes
app.use((req, res, next) => {
  console.log("Petición a ruta no encontrada...");
  res.status(404).json(formatoRta("", "endpoint no encontrado...."));
});

/* // Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json(formatoRta("", "Error interno del servidor"));
}); */


export default app;