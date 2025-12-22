import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createPool({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});
db.getConnection()
  .then(() => console.log("Database connected"))
  .catch(err => console.error("DB Error:", err));

export default db;