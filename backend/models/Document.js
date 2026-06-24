const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Document = sequelize.define(
  "Document",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    judul: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    penulis: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    npm_penulis: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "FK logis ke users.npm (NPM/NIDN penulis karya)",
    },
    prodi: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    jurusan: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tahun_terbit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jenis_karya: {
      type: DataTypes.ENUM("Skripsi", "Tesis", "Jurnal", "Makalah"),
      allowNull: false,
    },
    abstrak: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    kata_kunci: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Disimpan sebagai string dipisah koma, mis: 'ai,sql,basis data'",
    },
    dosen_pembimbing: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Path relatif, mis: uploads/1718800000-skripsi.pdf",
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Nama file asli saat upload",
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Ukuran file dalam bytes",
    },
    download_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK ke users.id — pemilik/pengunggah dokumen",
    },
  },
  {
    tableName: "documents",
    timestamps: true, // created_at & updated_at
  }
);

module.exports = Document;
