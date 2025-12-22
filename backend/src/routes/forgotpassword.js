import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import db from "../config/db.js";

const router = express.Router();

/* =====================
   FORGOT PASSWORD
===================== */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const [users] = await db.execute(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (!users.length) {
    return res.json({ msg: "Jika email terdaftar, link akan dikirim" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await db.execute(
    `INSERT INTO password_resets (user_id, token, expired_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
    [users[0].id, token]
  );

  res.json({ msg: "Link reset password dikirim" });
});

/* =====================
   RESET PASSWORD
===================== */
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  const [rows] = await db.execute(
    `SELECT * FROM password_resets
     WHERE token = ? AND used = FALSE AND expired_at > NOW()`,
    [token]
  );

  if (!rows.length) {
    return res.status(400).json({ msg: "Token tidak valid atau kadaluarsa" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await db.execute(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashed, rows[0].user_id]
  );

  await db.execute(
    "UPDATE password_resets SET used = TRUE WHERE id = ?",
    [rows[0].id]
  );

  res.json({ msg: "Password berhasil direset" });
});

export default router;
