import express from "express";
import db from "../config/db.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const { store_name, ktp_number } = req.body;
    const userId = req.user.user_id; // ⬅️ FIX DI SINI

    if (!store_name || !ktp_number) {
      return res.status(400).json({
        message: "store_name dan ktp_number wajib diisi"
      });
    }

    if (req.user.role === "seller") {
      return res.status(400).json({
        message: "Kamu sudah menjadi seller"
      });
    }

    const [exist] = await db.execute(
      "SELECT verification_id FROM seller_verifications WHERE user_id = ?",
      [userId]
    );

    if (exist.length > 0) {
      return res.status(400).json({
        message: "Pengajuan seller sudah ada"
      });
    }

    await db.execute(
      `INSERT INTO seller_verifications (user_id, store_name, ktp_number)
       VALUES (?, ?, ?)`,
      [userId, store_name, ktp_number]
    );

    res.json({
      message: "Pengajuan seller berhasil, menunggu verifikasi admin"
    });
  } catch (err) {
    console.error("SELLER APPLY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;