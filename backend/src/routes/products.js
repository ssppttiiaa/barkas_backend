import express from "express";
import isSeller from "../middleware/isSeller.js";
import db from "../db.js";

const router = express.Router();

// CREATE PRODUCT
router.post("/", isSeller, async (req, res) => {
  const { name, description, price, category_id, condition, stock } = req.body;

  // expired otomatis 30 hari
  const expiredAt = new Date();
  expiredAt.setDate(expiredAt.getDate() + 30);

  await db.execute(
    `INSERT INTO products
     (user_id, name, description, price, category_id, condition, stock, expired_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.user_id,
      name,
      description,
      price,
      category_id,
      condition,
      stock,
      expiredAt
    ]
  );

  res.json({ message: "Produk berhasil ditambahkan" });
});

export default router;

router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    `SELECT p.*, u.name AS seller_name
     FROM products p
     JOIN users u ON p.user_id = u.user_id
     WHERE p.is_active = TRUE
       AND p.expired_at > NOW()`
  );

  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const [rows] = await db.execute(
    `SELECT * FROM products
     WHERE product_id = ?
       AND is_active = TRUE`,
    [req.params.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }

  res.json(rows[0]);
});

router.put("/:id", isSeller, async (req, res) => {
  const { name, description, price, stock } = req.body;

  const [result] = await db.execute(
    `UPDATE products
     SET name = ?, description = ?, price = ?, stock = ?
     WHERE product_id = ? AND user_id = ?`,
    [name, description, price, stock, req.params.id, req.user.user_id]
  );

  if (result.affectedRows === 0) {
    return res.status(403).json({ message: "Tidak punya akses" });
  }

  res.json({ message: "Produk berhasil diupdate" });
});


router.delete("/:id", isSeller, async (req, res) => {
  await db.execute(
    `UPDATE products SET is_active = FALSE
     WHERE product_id = ? AND user_id = ?`,
    [req.params.id, req.user.user_id]
  );

  res.json({ message: "Produk dinonaktifkan" });
});

import upload from "../middleware/uploadProductImage.js";

// upload image
router.post(
  "/:id/images",
  isSeller,
  upload.array("images", 5),
  async (req, res) => {

    const productId = req.params.id;

    for (const file of req.files) {
      await db.execute(
        `INSERT INTO product_images (product_id, image_url)
         VALUES (?, ?)`,
        [productId, `/uploads/products/${file.filename}`]
      );
    }

    res.json({ message: "Gambar produk berhasil diupload" });
  }
);


router.get("/:id", async (req, res) => {
  const [product] = await db.execute(
    `SELECT * FROM products WHERE product_id = ?`,
    [req.params.id]
  );

  const [images] = await db.execute(
    `SELECT image_url, is_primary
     FROM product_images
     WHERE product_id = ?`,
    [req.params.id]
  );

  res.json({
    ...product[0],
    images
  });
});

router.put("/:productId/images/:imageId/primary", isSeller, async (req, res) => {

  await db.execute(
    `UPDATE product_images SET is_primary = FALSE
     WHERE product_id = ?`,
    [req.params.productId]
  );

  await db.execute(
    `UPDATE product_images SET is_primary = TRUE
     WHERE image_id = ?`,
    [req.params.imageId]
  );

  res.json({ message: "Primary image updated" });
});
