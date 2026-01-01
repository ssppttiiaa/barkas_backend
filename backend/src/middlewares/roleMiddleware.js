export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: "Role tidak ditemukan"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Akses ditolak"
      });
    }

    next();
  };
};
