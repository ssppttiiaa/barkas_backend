import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findByEmail, createUser } from "../models/User.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const [exist] = await findByEmail(email);
  if (exist.length) return res.status(400).json({ msg: "Email sudah digunakan" });

  const hashed = await bcrypt.hash(password, 10);
  await createUser(name, email, hashed);

  res.json({ msg: "Registrasi berhasil" });
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  const [user] = await findByEmail(email);
  if (!user.length) return res.status(404).json({ msg: "User tidak ditemukan" });

  const valid = await bcrypt.compare(password, user[0].password);
  if (!valid) return res.status(400).json({ msg: "Password salah" });

  const token = jwt.sign(
    {
      id: user[0].id,
      role: user[0].role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );

  res.json({ msg: "Login berhasil", token });
};
