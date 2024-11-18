import express from "express";
import usuariosRoutes from "./src/routes/usuarios.routes.js";
import cors from 'cors';
import { formatoRta } from "./src/scripts/formatoRta.js";
import pkg from 'express-validator';
const { body, query, matchedData, validationResult } = pkg;

const app = express();

// Configurar CORS
app.use(cors({
  origin: ['*'] // Especifica tus orígenes permitidos
}));

app.use(express.json());

// Rutas de la API
app.use('/api', usuariosRoutes);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  console.log("Petición a ruta no encontrada...");
  res.status(404).json(formatoRta("", "endpoint no encontrada"));
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json(formatoRta("", "Error interno del servidor"));
});


export default app;