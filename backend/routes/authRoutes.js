const express = require("express");
const router = express.Router();
const { login, me } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me  (perlu token)
router.get("/me", authMiddleware, me);

module.exports = router;
