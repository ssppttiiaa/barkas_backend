export default function emailVerified(req, res, next) {
  if (!req.user.email_verified) {
    return res.status(403).json({
      message: "Email belum diverifikasi"
    });
  }
  next();
}
