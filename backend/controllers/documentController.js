const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { Document, User } = require("../models");

const PUBLIC_DOC_ATTRS = [
  "id",
  "judul",
  "penulis",
  "npm_penulis",
  "prodi",
  "jurusan",
  "tahun_terbit",
  "jenis_karya",
  "abstrak",
  "kata_kunci",
  "dosen_pembimbing",
  "file_name",
  "file_path",
  "file_size",
  "download_count",
  "uploaded_by",
  "createdAt",
  "updatedAt",
];

/**
 * GET /api/documents
 * Query params:
 *   search       -> cari di judul, penulis, kata_kunci
 *   tahun_terbit -> filter exact
 *   prodi        -> filter exact
 *   jurusan      -> filter exact
 *   jenis_karya  -> filter exact
 *   sort         -> terbaru | terlama | terpopuler (default: terbaru)
 *   page         -> default 1
 *   limit        -> default 10
 */
async function getAllDocuments(req, res, next) {
  try {
    const {
      search,
      tahun_terbit,
      prodi,
      jurusan,
      jenis_karya,
      sort = "terbaru",
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { penulis: { [Op.like]: `%${search}%` } },
        { kata_kunci: { [Op.like]: `%${search}%` } },
      ];
    }

    if (tahun_terbit) where.tahun_terbit = tahun_terbit;
    if (prodi) where.prodi = prodi;
    if (jurusan) where.jurusan = jurusan;
    if (jenis_karya) where.jenis_karya = jenis_karya;

    let order = [["createdAt", "DESC"]]; // terbaru (default)
    if (sort === "terlama") order = [["createdAt", "ASC"]];
    if (sort === "terpopuler") order = [["download_count", "DESC"]];

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const offset = (pageNum - 1) * limitNum;

    const { rows, count } = await Document.findAndCountAll({
      where,
      attributes: PUBLIC_DOC_ATTRS,
      include: [{ model: User, as: "uploader", attributes: ["id", "nama", "npm"] }],
      order,
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        totalData: count,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/documents/:id
 */
async function getDocumentById(req, res, next) {
  try {
    const document = await Document.findByPk(req.params.id, {
      attributes: PUBLIC_DOC_ATTRS,
      include: [{ model: User, as: "uploader", attributes: ["id", "nama", "npm"] }],
    });

    if (!document) {
      return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan." });
    }

    res.json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/documents
 * Hanya user login (uploader). Multipart form-data dengan field "file".
 */
async function createDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File dokumen (PDF/DOC/DOCX) wajib diunggah.",
      });
    }

    const {
      judul,
      penulis,
      npm_penulis,
      prodi,
      jurusan,
      tahun_terbit,
      jenis_karya,
      abstrak,
      kata_kunci,
      dosen_pembimbing,
    } = req.body;

    const requiredFields = { judul, penulis, npm_penulis, prodi, jurusan, tahun_terbit, jenis_karya, abstrak };
    const missing = Object.entries(requiredFields).filter(([, v]) => !v);

    if (missing.length > 0) {
      // Hapus file yang sudah terlanjur diupload karena validasi gagal
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: `Field wajib belum diisi: ${missing.map(([k]) => k).join(", ")}`,
      });
    }

    const document = await Document.create({
      judul,
      penulis,
      npm_penulis,
      prodi,
      jurusan,
      tahun_terbit,
      jenis_karya,
      abstrak,
      kata_kunci: kata_kunci || null,
      dosen_pembimbing: dosen_pembimbing || null,
      file_path: `uploads/${req.file.filename}`,
      file_name: req.file.originalname,
      file_size: req.file.size,
      download_count: 0,
      uploaded_by: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Dokumen berhasil diunggah.",
      data: document,
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
}

/**
 * PUT /api/documents/:id
 * Hanya pemilik dokumen. Bisa update metadata, dan opsional ganti file.
 */
async function updateDocument(req, res, next) {
  try {
    const document = req.document; // dari middleware checkDocumentOwnership

    const {
      judul,
      penulis,
      npm_penulis,
      prodi,
      jurusan,
      tahun_terbit,
      jenis_karya,
      abstrak,
      kata_kunci,
      dosen_pembimbing,
    } = req.body;

    const updateData = {
      judul: judul ?? document.judul,
      penulis: penulis ?? document.penulis,
      npm_penulis: npm_penulis ?? document.npm_penulis,
      prodi: prodi ?? document.prodi,
      jurusan: jurusan ?? document.jurusan,
      tahun_terbit: tahun_terbit ?? document.tahun_terbit,
      jenis_karya: jenis_karya ?? document.jenis_karya,
      abstrak: abstrak ?? document.abstrak,
      kata_kunci: kata_kunci ?? document.kata_kunci,
      dosen_pembimbing: dosen_pembimbing ?? document.dosen_pembimbing,
    };

    // Jika user upload file baru, ganti file lama
    if (req.file) {
      const oldFilePath = path.join(__dirname, "..", document.file_path);
      fs.unlink(oldFilePath, (err) => {
        if (err) console.warn("Gagal menghapus file lama:", err.message);
      });

      updateData.file_path = `uploads/${req.file.filename}`;
      updateData.file_name = req.file.originalname;
      updateData.file_size = req.file.size;
    }

    await document.update(updateData);

    res.json({
      success: true,
      message: "Dokumen berhasil diperbarui.",
      data: document,
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
}

/**
 * DELETE /api/documents/:id
 * Hanya pemilik dokumen. Menghapus record + file fisik.
 */
async function deleteDocument(req, res, next) {
  try {
    const document = req.document;
    const filePath = path.join(__dirname, "..", document.file_path);

    await document.destroy();

    fs.unlink(filePath, (err) => {
      if (err) console.warn("Gagal menghapus file fisik:", err.message);
    });

    res.json({
      success: true,
      message: "Dokumen berhasil dihapus.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/documents/:id/download
 * Publik (tanpa login). Menambah download_count lalu mengirim file.
 */
async function downloadDocument(req, res, next) {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan." });
    }

    const filePath = path.join(__dirname, "..", document.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File fisik tidak ditemukan di server.",
      });
    }

    await document.increment("download_count");

    res.download(filePath, document.file_name);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/documents/stats/summary
 * Publik. Data untuk dashboard statistik.
 */
async function getStatistics(req, res, next) {
  try {
    const totalDocuments = await Document.count();

    const totalDownloadsResult = await Document.sum("download_count");
    const totalDownloads = totalDownloadsResult || 0;

    // Grafik per tahun terbit
    const byYear = await Document.findAll({
      attributes: [
        "tahun_terbit",
        [Document.sequelize.fn("COUNT", Document.sequelize.col("id")), "jumlah"],
      ],
      group: ["tahun_terbit"],
      order: [["tahun_terbit", "ASC"]],
      raw: true,
    });

    // Persebaran per jurusan
    const byJurusan = await Document.findAll({
      attributes: [
        "jurusan",
        [Document.sequelize.fn("COUNT", Document.sequelize.col("id")), "jumlah"],
      ],
      group: ["jurusan"],
      raw: true,
    });

    // Persebaran per jenis karya
    const byJenis = await Document.findAll({
      attributes: [
        "jenis_karya",
        [Document.sequelize.fn("COUNT", Document.sequelize.col("id")), "jumlah"],
      ],
      group: ["jenis_karya"],
      raw: true,
    });

    // Trending: 5 dokumen terpopuler
    const trending = await Document.findAll({
      attributes: PUBLIC_DOC_ATTRS,
      order: [["download_count", "DESC"]],
      limit: 5,
    });

    res.json({
      success: true,
      data: {
        totalDocuments,
        totalDownloads,
        byYear,
        byJurusan,
        byJenis,
        trending,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/documents/filters/options
 * Publik. Mengembalikan opsi unik untuk dropdown filter di frontend.
 */
async function getFilterOptions(req, res, next) {
  try {
    const tahunList = await Document.findAll({
      attributes: [[Document.sequelize.fn("DISTINCT", Document.sequelize.col("tahun_terbit")), "tahun_terbit"]],
      order: [["tahun_terbit", "DESC"]],
      raw: true,
    });

    const prodiList = await Document.findAll({
      attributes: [[Document.sequelize.fn("DISTINCT", Document.sequelize.col("prodi")), "prodi"]],
      raw: true,
    });

    const jurusanList = await Document.findAll({
      attributes: [[Document.sequelize.fn("DISTINCT", Document.sequelize.col("jurusan")), "jurusan"]],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        tahun_terbit: tahunList.map((t) => t.tahun_terbit),
        prodi: prodiList.map((p) => p.prodi),
        jurusan: jurusanList.map((j) => j.jurusan),
        jenis_karya: ["Skripsi", "Tesis", "Jurnal", "Makalah"],
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getStatistics,
  getFilterOptions,
};
