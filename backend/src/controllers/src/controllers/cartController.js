const Cart = require("../models/Cart");

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    const cart = await Cart.create({
      user_id: req.user.id,
      product_id,
      quantity,
    });

    res.status(201).json({
      message: "Produk berhasil ditambahkan ke cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const carts = await Cart.findAll({
      where: { user_id: req.user.id },
    });

    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
