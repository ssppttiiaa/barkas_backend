// // import express from "express";
// // import { register, login } from "../Controllers/authController.js";
// // const router = express.Router();

// // router.post("/register", register);
// // router.post("/login", login);

// // export default router;


import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import db from "../config/db.js";
import { sendEmail } from "../utils/mailer.js";
import { validatePassword } from "../utils/passwordValidator.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Validasi input kosong
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, dan password wajib diisi"
      });
    }

    // 2️⃣ Validasi password
    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka"
      });
    }

    // 3️⃣ Cek email sudah ada
    const [exist] = await db.execute(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (exist.length > 0) {
      return res.status(400).json({
        message: "Email sudah terdaftar"
      });
    }

    // 4️⃣ Hash password
    const hash = await bcrypt.hash(password, 10);

    // 5️⃣ Simpan user
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password_hash)
       VALUES (?, ?, ?)`,
      [name, email, hash]
    );

    const userId = result.insertId;

    // 6️⃣ Buat token verifikasi
    const token = crypto.randomUUID();

    await db.execute(
      `INSERT INTO email_verifications (user_id, token, expired_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [userId, token]
    );

    // 7️⃣ Kirim email verifikasi
    const link = `http://localhost:3000/verify-email?token=${token}`;

    await sendEmail(
      email,
      "Verifikasi Email",
      `Klik link berikut untuk verifikasi akun:\n\n${link}`
    );

    res.status(201).json({
      message: "Registrasi berhasil, silakan cek email untuk verifikasi"
    });

  } catch (error) {
    console.error("REGISTER EROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi"
      });
    }

    // 2. Cari user
    const [users] = await db.execute(
      `SELECT user_id, password_hash, email_verified
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (!users.length) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    const user = users[0];

    // 3. Cek email sudah diverifikasi
    if (!user.email_verified) {
      return res.status(403).json({
        message: "Email belum diverifikasi"
      });
    }

    // 4. Cek password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({
        message: "Password salah"
      });
    }

    res.json({
      message: "Login berhasil",
      user_id: user.user_id
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});


router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: "Token tidak valid"
      });
    }

    const [rows] = await db.execute(
      `SELECT user_id FROM email_verifications
       WHERE token = ? AND expired_at > NOW()`,
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({
        message: "Token tidak valid atau expired"
      });
    }

    const userId = rows[0].user_id;

    // verifikasi user
    await db.execute(
      `UPDATE users SET email_verified = 1 WHERE user_id = ?`,
      [userId]
    );

    // hapus token
    await db.execute(
      `DELETE FROM email_verifications WHERE user_id = ?`,
      [userId]
    );

    res.json({
      message: "Email berhasil diverifikasi"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


export default router;
