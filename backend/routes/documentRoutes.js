const express = require("express");
const router = express.Router();

const {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getStatistics,
  getFilterOptions,
} = require("../controllers/documentController");

const authMiddleware = require("../middleware/auth");
const checkDocumentOwnership = require("../middleware/checkOwnership");
const upload = require("../middleware/upload");

/* ===================== RUTE PUBLIK (tanpa login) ===================== */

// Statistik & filter options harus didefinisikan SEBELUM /:id agar tidak bentrok
router.get("/stats/summary", getStatistics);
router.get("/filters/options", getFilterOptions);

router.get("/", getAllDocuments);
router.get("/:id", getDocumentById);
router.get("/:id/download", downloadDocument);

/* ===================== RUTE PRIVAT (wajib login / uploader) ===================== */

router.post("/", authMiddleware, upload.single("file"), createDocument);

router.put(
  "/:id",
  authMiddleware,
  checkDocumentOwnership,
  upload.single("file"),
  updateDocument
);

router.delete("/:id", authMiddleware, checkDocumentOwnership, deleteDocument);

module.exports = router;
