const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const auth = require("../middlewares/authMiddleware");

router.post("/", auth, cartController.addToCart);
router.get("/", auth, cartController.getCart);

module.exports = router;
