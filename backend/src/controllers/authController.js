import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  findByEmail,
  createUser,
  findByVerifyToken,
  verifyUser
} from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * REGISTER
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. cek email sudah ada
    const [exist] = await findByEmail(email);
    if (exist.length) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // 2. hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. generate token verifikasi
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // 4. simpan user
    await createUser(name, email, hashedPassword, verifyToken);

    // 5. kirim email verifikasi (opsional, tidak boleh gagalkan register)
    try {
      const link = `http://localhost:3000/api/auth/verify/${verifyToken}`;

      await sendEmail(
        email,
        "Verifikasi Email",
        `<p>Halo <b>${name}</b>,</p>
         <p>Klik link berikut untuk verifikasi akun kamu:</p>
         <a href="${link}">${link}</a>`
      );
    } catch (emailError) {
      console.log("Email gagal dikirim:", emailError.message);
    }

    return res.status(201).json({
      message: "Registrasi berhasil, silakan cek email untuk verifikasi"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * VERIFY EMAIL
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const [user] = await findByVerifyToken(token);
    if (!user.length) {
      return res.status(400).json({ message: "Token tidak valid" });
    }

    await verifyUser(user[0].id);

    return res.json({ message: "Email berhasil diverifikasi" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await findByEmail(email);
    if (!user.length) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // BLOK JIKA BELUM VERIFIKASI
    if (!user[0].email_verified) {
      return res.status(403).json({
        message: "Email belum diverifikasi"
      });
    }

    const valid = await bcrypt.compare(password, user[0].password);
    if (!valid) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      {
        id: user[0].id,
        role: user[0].role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login berhasil",
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

router.post("/seller/apply", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;

    // cek role sekarang
    const [users] = await db.execute(
      "SELECT role FROM users WHERE user_id = ?",
      [userId]
    );

    if (!users.length) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    if (users[0].role === "seller") {
      return res.status(400).json({ message: "User sudah seller" });
    }

    // update role
    await db.execute(
      "UPDATE users SET role = 'seller' WHERE user_id = ?",
      [userId]
    );

    res.json({
      message: "Berhasil menjadi seller"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
