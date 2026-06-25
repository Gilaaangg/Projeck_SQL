-- =========================================================
-- SEED DATA: 3 user uploader contoh untuk testing login
--
-- Aturan login: username = npm, password = tanggal lahir (DDMMYYYY)
-- Password di bawah sudah di-hash dengan bcrypt (cost 10),
-- jadi aman langsung di-import lewat phpMyAdmin / MySQL CLI.
--
-- Kredensial untuk login (plaintext, dipakai di form login saja):
--   NPM: 2154231001  | Password: 14052003 | Andi Saputra
--   NPM: 2154231002  | Password: 23112002 | Siti Rahmawati
--   NPM: 0012345678  | Password: 09021985 | Dr. Budi Hartono, M.Kom.
-- =========================================================



INSERT INTO users (npm, nama, tanggal_lahir, password, role, prodi, jurusan, created_at)
VALUES
  ('2154231001', 'Andi Saputra', '2003-05-14',
   '$2a$10$.9ByE.R/LI.ece/k1meTse8lSt0x0rvagfaKEsFjI29nzIdnFBvmK',
   'uploader', 'Manajemen Informatika', 'Teknologi Informasi', NOW()),

  ('2154231002', 'Siti Rahmawati', '2002-11-23',
   '$2a$10$5AH8ZHGkTd3tFNlHWXqeR.anseTmcGtOogys4JfAlJ9fpnLfAuBjG',
   'uploader', 'Manajemen Informatika', 'Teknologi Informasi', NOW()),

  ('0012345678', 'Dr. Budi Hartono, M.Kom.', '1985-02-09',
   '$2a$10$QpiEzaq3sgHe5oKSseddH.bxxw4/lP.qSP8yZDJIMY0UsSsdz4sNu',
   'uploader', 'Manajemen Informatika', 'Teknologi Informasi', NOW())

ON DUPLICATE KEY UPDATE npm = npm; -- hindari error jika dijalankan ulang
