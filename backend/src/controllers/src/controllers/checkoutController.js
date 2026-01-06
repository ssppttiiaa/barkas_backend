const Cart = require("../models/Cart");
const Order = require("../models/Order");

exports.checkout = async (req, res) => {
  try {
    const carts = await Cart.findAll({
      where: { user_id: req.user.id },
    });

    if (carts.length === 0) {
      return res.status(400).json({ message: "Cart masih kosong" });
    }

    const total_price = carts.reduce(
      (total, item) => total + item.quantity * 10000,
      0
    );

    const order = await Order.create({
      user_id: req.user.id,
      total_price,
    });

    await Cart.destroy({
      where: { user_id: req.user.id },
    });

    res.json({
      message: "Checkout berhasil",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
