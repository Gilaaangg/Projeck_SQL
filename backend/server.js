require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const sequelize = require("./config/database");
require("./models"); // memuat model & relasi

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

/* ===================== MIDDLEWARE GLOBAL ===================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve folder uploads agar file bisa diakses langsung (preview/download)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===================== ROUTES ===================== */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Repository Karya Ilmiah aktif.",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

// 404 handler untuk rute yang tidak ada
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." });
});

// Error handler global — harus paling akhir
app.use(errorHandler);

/* ===================== START SERVER ===================== */
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✓ Koneksi database berhasil.");

    // sync({ alter: true }) cocok untuk development; gunakan migration di production
    await sequelize.sync({ alter: true });
    console.log("✓ Model sinkron dengan database.");

    app.listen(PORT, () => {
      console.log(`✓ Server berjalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("✗ Gagal menjalankan server:", err.message);
    process.exit(1);
  }
}

startServer();
