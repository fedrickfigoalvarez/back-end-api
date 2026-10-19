const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "inventory_db",
  connectionLimit: 2,
  ssl:
    process.env.DB_SSL === "true"
      ? process.env.DB_CA
        ? { ca: process.env.DB_CA }
        : { rejectUnauthorized: false }
      : undefined,
});

db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully!");
    connection.release();
  })
  .catch((err) => {
    console.log("gagal terkoneksi", err);
  });

module.exports = db;