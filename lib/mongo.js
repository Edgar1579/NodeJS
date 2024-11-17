import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

const MONGO_OPTIONS = {
  tls: process.env.USE_TLS === 'true', // Configurable a través de una variable de entorno
  serverSelectionTimeoutMS: 4000,
  autoSelectFamily: false,
};

export class MongoLib {
  constructor() {
    if (!MongoLib.instance) {
      this.client = new MongoClient(MONGO_URI, MONGO_OPTIONS);
      this.dbName = MONGO_DB_NAME;
      this.connection = null;
      MongoLib.instance = this; // Implementar patrón Singleton
    }
    return MongoLib.instance;
  }

  async connect() {
    if (!this.connection) {
      try {
        console.log("Conectando a la BBDD...");
        this.connection = await this.client.connect();
        console.log("Conectado a la BBDD");
      } catch (error) {
        console.error("Error en la conexión con la BBDD:", error.message);
        throw new Error("No se pudo conectar a la base de datos");
      }
    }
    return this.connection.db(this.dbName);
  }

  async close() {
    if (this.client && this.connection) {
      try {
        await this.client.close();
        this.connection = null; // Resetea la conexión para permitir una nueva conexión
        console.log("Conexión cerrada");
      } catch (error) {
        console.error("Error al cerrar la conexión:", error.message);
      }
    }
  }
}