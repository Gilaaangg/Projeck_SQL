# Database — Repository Karya Ilmiah

Skema database MySQL untuk aplikasi. File ini sinkron 1:1 dengan model
Sequelize di `backend/models/`, jadi bisa dipakai dua cara:

1. **Otomatis** — jalankan `npm run dev` di backend, Sequelize akan
   membuat tabel sendiri (`sequelize.sync({ alter: true })`).
2. **Manual** — import file `.sql` di folder ini lewat phpMyAdmin /
   MySQL CLI (cocok untuk lampiran DDL di laporan RND Bab II).

## Cara Import Manual

```bash
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
```

Atau lewat phpMyAdmin: buka tab **Import**, pilih `schema.sql` dulu,
lalu `seed.sql`.

## ERD (Entity Relationship Diagram)

```
┌───────────────────────────┐         ┌──────────────────────────────────┐
│           users            │         │             documents              │
├───────────────────────────┤         ├──────────────────────────────────┤
│ PK  id              INT    │         │ PK  id                  INT       │
│     npm             VARCHAR│◄───┐    │     judul                VARCHAR  │
│     nama            VARCHAR│    │    │     penulis               VARCHAR  │
│     tanggal_lahir   DATE   │    │    │     npm_penulis          VARCHAR  │
│     password        VARCHAR│    │    │     prodi                VARCHAR  │
│     role             ENUM  │    │    │     jurusan               VARCHAR  │
│     prodi            VARCHAR│    │    │     tahun_terbit          INT     │
│     jurusan          VARCHAR│    │    │     jenis_karya           ENUM    │
│     created_at      DATETIME│    │    │     abstrak               TEXT    │
└───────────────────────────┘    │    │     kata_kunci            VARCHAR  │
                                  │    │     dosen_pembimbing      VARCHAR  │
                                  │    │     file_path             VARCHAR  │
                                  │    │     file_name             VARCHAR  │
                                  │    │     file_size             INT      │
                                  │    │     download_count        INT      │
                                  └────┼─FK  uploaded_by           INT      │
                                       │     created_at            DATETIME │
                                       │     updated_at            DATETIME │
                                       └──────────────────────────────────┘
```

**Relasi:** `documents.uploaded_by` → `users.id` (One-to-Many).
Satu user (uploader) bisa mengunggah banyak dokumen. Jika user dihapus,
dokumen miliknya ikut terhapus (`ON DELETE CASCADE`).

Catatan: kolom `npm_penulis` di `documents` adalah **field metadata bebas**
(boleh diisi NPM/NIDN siapa saja, termasuk dosen pembimbing atau penulis
yang bukan pengunggah) — bukan foreign key, karena penulis karya ilmiah
belum tentu punya akun di sistem. Relasi sesungguhnya tetap lewat
`uploaded_by`.

## Kredensial Login (3 User Seed)

| NPM/NIDN     | Nama                     | Password (DDMMYYYY) | Role     |
|--------------|--------------------------|----------------------|----------|
| 2154231001   | Andi Saputra             | 14052003             | uploader |
| 2154231002   | Siti Rahmawati           | 23112002             | uploader |
| 0012345678   | Dr. Budi Hartono, M.Kom. | 09021985             | uploader |

Password di database sudah dalam bentuk **hash bcrypt** — yang diketik
di form login tetap angka tanggal lahir biasa (DDMMYYYY) seperti tabel
di atas.
