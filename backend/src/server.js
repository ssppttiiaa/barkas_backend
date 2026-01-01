import express from "express";
import cors from "cors";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import forgotPasswordRoutes from "./routes/forgotpassword.js";
import userRoutes from "./routes/userRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productsRoutes from "./routes/products.js";

const app = express();

// koneksi DB
db.getConnection()
  .then(() => console.log("MySQL Connected"))
  .catch((err) => console.log("MySQL Error:", err));

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/products", productsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", forgotPasswordRoutes);
app.use("/api/user", userRoutes);

// server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

// seller routes
app.use ("/api/seller", sellerRoutes);

// admin routes
app.use ("/api/admin", adminRoutes);

// import express from "express";
// import cors from "cors";
// import authRoutes from "./routes/authRoutes.js";

// const app = express();

// app.use(cors());
// app.use(express.json());

// // INI PENTING
// app.use("/api/auth", authRoutes);

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });
