const multer = require("multer");

/**
 * Penanganan error terpusat. Diletakkan paling akhir di server.js.
 */
function errorHandler(err, req, res, next) {
  // Error spesifik dari Multer (ukuran file, dll)
  if (err instanceof multer.MulterError) {
    let message = "Terjadi kesalahan saat upload file.";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Ukuran file melebihi batas maksimum yang diizinkan.";
    }
    return res.status(400).json({ success: false, message });
  }

  // Error custom dari fileFilter multer (format file salah)
  if (err.message && err.message.includes("Format file tidak didukung")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Error validasi Sequelize
  if (err.name === "SequelizeValidationError") {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Data sudah ada (duplikat). NPM mungkin sudah terdaftar.",
    });
  }

  console.error("[ERROR]", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server.",
  });
}

module.exports = errorHandler;
