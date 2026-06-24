const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Memverifikasi token JWT dari header Authorization: Bearer <token>
 * Jika valid, req.user akan berisi payload token { id, npm, role }
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token tidak ditemukan. Silakan login terlebih dahulu.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, npm, nama, role }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Sesi login telah berakhir. Silakan login kembali.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token tidak valid.",
    });
  }
}

module.exports = authMiddleware;
