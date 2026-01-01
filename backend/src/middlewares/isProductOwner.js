import db from "../config/db.js";

export default async function isProductOwner(req, res, next) {
  try {
    const productId = req.params.id;
    const userId = req.user.user_id;
    const role = req.user.role;

    // admin boleh langsung
    if (role === "admin") {
      return next();
    }

    const [rows] = await db.execute(
      "SELECT seller_id FROM products WHERE id = ?",
      [productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    if (rows[0].seller_id !== userId) {
      return res.status(403).json({
        message: "Tidak boleh mengubah produk seller lain"
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
