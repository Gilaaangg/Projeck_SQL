-- =========================================================
-- DATABASE: repo_karya_ilmiah
-- Web Aplikasi Repository Karya Ilmiah
-- (Skripsi, Tesis, Jurnal, Makalah)
--
-- Skema ini identik dengan model Sequelize di backend.
-- Bisa dipakai untuk Bab II RND (DDL Lengkap) atau untuk
-- setup manual database tanpa menunggu sequelize.sync().
-- =========================================================

CREATE DATABASE IF NOT EXISTS repo_karya_ilmiah
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE repo_karya_ilmiah;

-- =========================================================
-- TABEL: users
-- Menyimpan data uploader (dosen/mahasiswa) yang bisa login.
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  npm             VARCHAR(30)  NOT NULL UNIQUE COMMENT 'Username login (NPM/NIDN)',
  nama            VARCHAR(150) NOT NULL,
  tanggal_lahir   DATE         NOT NULL COMMENT 'Sumber password sebelum hash, format asli DDMMYYYY',
  password        VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt dari tanggal lahir',
  role            ENUM('uploader','admin') NOT NULL DEFAULT 'uploader',
  prodi           VARCHAR(100) NULL,
  jurusan         VARCHAR(100) NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABEL: documents
-- Menyimpan metadata dan referensi file karya ilmiah.
-- Relasi: documents.uploaded_by -> users.id
-- =========================================================
CREATE TABLE IF NOT EXISTS documents (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  judul             VARCHAR(300)  NOT NULL,
  penulis           VARCHAR(150)  NOT NULL,
  npm_penulis       VARCHAR(30)   NOT NULL COMMENT 'NPM/NIDN penulis karya (boleh beda dari pengunggah)',
  prodi             VARCHAR(100)  NOT NULL,
  jurusan           VARCHAR(100)  NOT NULL,
  tahun_terbit      INT           NOT NULL,
  jenis_karya       ENUM('Skripsi','Tesis','Jurnal','Makalah') NOT NULL,
  abstrak           TEXT          NOT NULL,
  kata_kunci        VARCHAR(500)  NULL COMMENT 'Dipisah koma, mis: ai,sql,basis data',
  dosen_pembimbing  VARCHAR(150)  NULL,
  file_path         VARCHAR(500)  NOT NULL COMMENT 'Path relatif, mis: uploads/123-skripsi.pdf',
  file_name         VARCHAR(255)  NOT NULL COMMENT 'Nama file asli saat upload',
  file_size         INT           NULL COMMENT 'Ukuran file dalam bytes',
  download_count    INT           NOT NULL DEFAULT 0,
  uploaded_by       INT           NOT NULL COMMENT 'FK ke users.id, pemilik dokumen',
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_documents_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  INDEX idx_judul (judul),
  INDEX idx_penulis (penulis),
  INDEX idx_tahun_terbit (tahun_terbit),
  INDEX idx_prodi (prodi),
  INDEX idx_jurusan (jurusan),
  INDEX idx_jenis_karya (jenis_karya),
  INDEX idx_download_count (download_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
