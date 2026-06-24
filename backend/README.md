# Backend — Repository Karya Ilmiah

API backend untuk Web Aplikasi Repository Karya Ilmiah (Skripsi/Tesis/Jurnal/Makalah).
Express.js + Sequelize (MySQL) + JWT + Multer.

## 1. Persiapan

```bash
cd backend
npm install
```

Buat database MySQL terlebih dahulu (lewat phpMyAdmin / MySQL CLI):

```sql
CREATE DATABASE repo_karya_ilmiah;
```

Salin `.env.example` menjadi `.env` lalu sesuaikan kredensial database:

```bash
cp .env.example .env
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=repo_karya_ilmiah
DB_USER=root
DB_PASSWORD=isi_password_mysql_kamu
JWT_SECRET=ganti_dengan_string_acak_yang_panjang
```

## 2. Jalankan Server

```bash
npm run dev
```

Saat pertama kali jalan, Sequelize akan otomatis membuat tabel `users` dan `documents`
(`sequelize.sync({ alter: true })` di `server.js`).

## 3. Seed Data User (3 akun contoh)

```bash
npm run seed
```

Akan membuat 3 user uploader. **Aturan login:**
- **Username = NPM**
- **Password = Tanggal lahir format DDMMYYYY**

| NPM/NIDN     | Nama                     | Password   |
|--------------|--------------------------|------------|
| 2154231001   | Andi Saputra             | 14052003   |
| 2154231002   | Siti Rahmawati           | 23112002   |
| 0012345678   | Dr. Budi Hartono, M.Kom. | 09021985   |

## 4. Struktur Folder

```
backend/
├── config/
│   └── database.js        # Koneksi Sequelize ke MySQL
├── controllers/
│   ├── authController.js
│   └── documentController.js
├── middleware/
│   ├── auth.js             # Verifikasi JWT
│   ├── checkOwnership.js   # Pastikan hanya pemilik dokumen yg bisa edit/hapus
│   ├── upload.js           # Multer config (PDF/DOC/DOCX, max 20MB)
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Document.js
│   └── index.js            # Relasi antar model
├── routes/
│   ├── authRoutes.js
│   └── documentRoutes.js
├── seeders/
│   └── seed.js
├── uploads/                 # File hasil upload disimpan di sini
├── .env
├── server.js
└── package.json
```

## 5. API Endpoints

### Auth
| Method | Endpoint          | Akses    | Keterangan                  |
|--------|--------------------|----------|------------------------------|
| POST   | `/api/auth/login`  | Publik   | Body: `{ npm, password }`    |
| GET    | `/api/auth/me`     | Login    | Data user yang sedang login  |

### Dokumen
| Method | Endpoint                          | Akses           | Keterangan                                   |
|--------|-------------------------------------|-----------------|-----------------------------------------------|
| GET    | `/api/documents`                   | Publik          | List + search + filter + sort + pagination    |
| GET    | `/api/documents/:id`               | Publik          | Detail satu dokumen                            |
| GET    | `/api/documents/:id/download`      | Publik          | Download file + increment counter              |
| GET    | `/api/documents/stats/summary`     | Publik          | Data dashboard statistik                        |
| GET    | `/api/documents/filters/options`   | Publik          | Opsi unik untuk dropdown filter                 |
| POST   | `/api/documents`                   | Login (uploader)| Upload dokumen baru (multipart, field `file`)   |
| PUT    | `/api/documents/:id`               | Pemilik dokumen | Edit metadata (& opsional ganti file)           |
| DELETE | `/api/documents/:id`               | Pemilik dokumen | Hapus dokumen + file fisik                       |

### Query params untuk `GET /api/documents`
```
?search=judul-atau-penulis
&tahun_terbit=2024
&prodi=Manajemen Informatika
&jurusan=Teknologi Informasi
&jenis_karya=Skripsi
&sort=terbaru|terlama|terpopuler
&page=1
&limit=10
```

### Format Response
Semua response konsisten:
```json
{ "success": true, "data": ..., "message": "..." }
```
atau saat error:
```json
{ "success": false, "message": "..." }
```

## 6. Contoh Request (cURL)

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"npm":"2154231001","password":"14052003"}'
```

**Upload dokumen (pakai token dari login):**
```bash
curl -X POST http://localhost:5000/api/documents \
  -H "Authorization: Bearer <TOKEN>" \
  -F "judul=Sistem Informasi Akademik" \
  -F "penulis=Andi Saputra" \
  -F "npm_penulis=2154231001" \
  -F "prodi=Manajemen Informatika" \
  -F "jurusan=Teknologi Informasi" \
  -F "tahun_terbit=2024" \
  -F "jenis_karya=Skripsi" \
  -F "abstrak=Penelitian ini membahas..." \
  -F "kata_kunci=sistem informasi,akademik,web" \
  -F "dosen_pembimbing=Dr. Budi Hartono" \
  -F "file=@/path/ke/skripsi.pdf"
```

## Catatan Keamanan
- Password tidak pernah disimpan plaintext — selalu di-hash dengan bcrypt.
- File yang diizinkan diupload hanya PDF, DOC, DOCX (divalidasi via MIME type).
- Hanya pemilik dokumen (`uploaded_by === user.id`) yang bisa edit/hapus.
- Untuk production: ganti `JWT_SECRET`, set `sequelize.sync()` jadi migration-based, dan jangan expose stack trace error ke client.
