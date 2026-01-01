import db from "../config/db.js";

export const findByEmail = async (email) => {
  return await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
};

export const createUser = async (name, email, hashed, token) => {
  return await db.query(
    "INSERT INTO users (name, email, password, verify_token) VALUES (?, ?, ?, ?)",
    [name, email, hashed, token]
  );
};

export const findByVerifyToken = async (token) => {
  return await db.query(
    "SELECT * FROM users WHERE verify_token = ?",
    [token]
  );
};

export const verifyUser = async (id) => {
  return await db.query(
    "UPDATE users SET email_verified = true, verify_token = NULL WHERE id = ?",
    [id]
  );
};
