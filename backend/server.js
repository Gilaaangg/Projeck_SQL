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
app.use(cors({
  origin: '*', // Izinkan semua origin untuk testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve folder uploads agar file bisa diakses langsung (preview/download)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===================== ROUTES ===================== */
// Health check untuk Railway
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

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
  let retries = 5;
  
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log("✓ Koneksi database berhasil.");
      
      await sequelize.sync({ alter: true });
      console.log("✓ Model sinkron dengan database.");
      
      // 🔥 PERUBAHAN: Bind ke 0.0.0.0
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`✓ Server berjalan di http://0.0.0.0:${PORT}`);
        console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      });
      
      return; // Success
    } catch (err) {
      console.error(`✗ Gagal koneksi database (${retries} attempts left):`, err.message);
      retries--;
      
      if (retries === 0) {
        console.error('✗ Semua percobaan gagal. Server tetap berjalan tanpa database.');
        // Tetap jalankan server meskipun database gagal
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`✓ Server berjalan di http://0.0.0.0:${PORT} (mode: tanpa database)`);
        });
        return;
      }
      
      // Tunggu 5 detik sebelum retry
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

startServer();

// Graceful shutdown untuk Railway
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  process.exit(0);
});

// Error handling untuk uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Jangan exit, biarkan server tetap jalan
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});