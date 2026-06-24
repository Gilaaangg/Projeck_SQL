const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

/**
 * POST /api/auth/login
 * Body: { npm, password }
 * password = tanggal lahir format DDMMYYYY (akan dicocokkan dengan hash)
 */
async function login(req, res, next) {
  try {
    const { npm, password } = req.body;

    if (!npm || !password) {
      return res.status(400).json({
        success: false,
        message: "NPM dan password wajib diisi.",
      });
    }

    const user = await User.findOne({ where: { npm } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "NPM atau password salah.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "NPM atau password salah.",
      });
    }

    const payload = {
      id: user.id,
      npm: user.npm,
      nama: user.nama,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    res.json({
      success: true,
      message: "Login berhasil.",
      data: {
        token,
        user: payload,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Mengembalikan data user yang sedang login (dari token).
 */
async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "npm", "nama", "role", "prodi", "jurusan", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me };
