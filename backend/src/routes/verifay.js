import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  // 1. Cari token
  const [rows] = await db.execute(
    `SELECT * FROM email_verifications
     WHERE token = ? AND used = FALSE AND expired_at > NOW()`,
    [token]
  );

  if (rows.length === 0) {
    return res.status(400).send("Token tidak valid atau sudah expired");
  }

  const verification = rows[0];

  // 2. Update user
  await db.execute(
    `UPDATE users SET email_verified = TRUE
     WHERE user_id = ?`,
    [verification.user_id]
  );

  // 3. Tandai token sudah dipakai
  await db.execute(
    `UPDATE email_verifications SET used = TRUE
     WHERE id = ?`,
    [verification.id]
  );

  res.send("Email berhasil diverifikasi");
});

export default router;
