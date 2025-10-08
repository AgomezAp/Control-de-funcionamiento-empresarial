import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "❌ DATABASE_URL no está definida en las variables de entorno"
  );
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  protocol: "postgres",
  timezone: "-03:00",
  dialectOptions: {
    useUTC: false,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false, // Solo logs en desarrollo
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
