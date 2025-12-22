export default function isSeller(req, res, next) {
  const user = req.user;

  if (
    !user.email_verified ||
    user.role !== "seller" ||
    user.seller_status !== "verified"
  ) {
    return res.status(403).json({
      message: "Akun belum terverifikasi sebagai penjual"
    });
  }

  next();
}
