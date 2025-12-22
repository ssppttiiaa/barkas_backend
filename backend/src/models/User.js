import db from "../config/db.js";

export const findByEmail = async (email) => 
    await db.query("SELECT * FROM users WHERE email = ?", [email]);

export const createUser = async (name, email, hashed) =>
    await db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
        [name, email, hashed]
    );