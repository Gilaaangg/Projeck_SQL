const { Document } = require("../models");

/**
 * Memastikan hanya pemilik dokumen (uploader asli) yang bisa
 * mengedit/menghapus dokumen tersebut. Harus dipakai SETELAH authMiddleware.
 */
async function checkDocumentOwnership(req, res, next) {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Dokumen tidak ditemukan.",
      });
    }

    if (document.uploaded_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki izin untuk mengubah dokumen ini.",
      });
    }

    req.document = document; // simpan supaya controller tidak query ulang
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = checkDocumentOwnership;
