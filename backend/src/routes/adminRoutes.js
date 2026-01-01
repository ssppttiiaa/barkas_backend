import express from "express";
import db from "../config/db.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/approve-seller/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak" });
  }

  const sellerId = req.params.id;

  // update status verifikasi
  await db.execute(
    "UPDATE seller_verifications SET status = 'approved' WHERE id = ?",
    [sellerId]
  );

  // ambil user_id
  const [[seller]] = await db.execute(
    "SELECT user_id FROM seller_verifications WHERE id = ?",
    [sellerId]
  );

  // ubah role user
  await db.execute(
    "UPDATE users SET role = 'seller' WHERE id = ?",
    [seller.user_id]
  );

  res.json({
    message: "Seller berhasil disetujui"
  });
});

export default router;
