/**
 * Seeder: membuat 3 user uploader contoh untuk testing login.
 * Jalankan: npm run seed
 *
 * Aturan login:
 *   username = npm
 *   password = tanggal lahir format DDMMYYYY
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");
const { User } = require("../models");

const sampleUsers = [
  {
    npm: "2154231001",
    nama: "Andi Saputra",
    tanggal_lahir: "2003-05-14", // password: 14052003
    rawPassword: "14052003",
    role: "uploader",
    prodi: "Manajemen Informatika",
    jurusan: "Teknologi Informasi",
  },
  {
    npm: "2154231002",
    nama: "Siti Rahmawati",
    tanggal_lahir: "2002-11-23", // password: 23112002
    rawPassword: "23112002",
    role: "uploader",
    prodi: "Manajemen Informatika",
    jurusan: "Teknologi Informasi",
  },
  {
    npm: "0012345678", // contoh NIDN dosen
    nama: "Dr. Budi Hartono, M.Kom.",
    tanggal_lahir: "1985-02-09", // password: 09021985
    rawPassword: "09021985",
    role: "uploader",
    prodi: "Manajemen Informatika",
    jurusan: "Teknologi Informasi",
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database OK. Mulai seeding...");

    await sequelize.sync(); // pastikan tabel ada

    for (const u of sampleUsers) {
      const hashedPassword = await bcrypt.hash(u.rawPassword, 10);

      const [user, created] = await User.findOrCreate({
        where: { npm: u.npm },
        defaults: {
          nama: u.nama,
          tanggal_lahir: u.tanggal_lahir,
          password: hashedPassword,
          role: u.role,
          prodi: u.prodi,
          jurusan: u.jurusan,
        },
      });

      if (created) {
        console.log(`✓ User dibuat: ${u.nama} (NPM/NIDN: ${u.npm}, password: ${u.rawPassword})`);
      } else {
        console.log(`- User sudah ada, dilewati: ${u.npm}`);
      }
    }

    console.log("\nSeeding selesai. Kredensial login untuk testing:");
    sampleUsers.forEach((u) => {
      console.log(`  NPM: ${u.npm}  |  Password: ${u.rawPassword}  |  Nama: ${u.nama}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Seeding gagal:", err);
    process.exit(1);
  }
}

seed();
