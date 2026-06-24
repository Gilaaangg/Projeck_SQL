const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    npm: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      comment: "Dipakai sebagai username login",
    },
    nama: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    tanggal_lahir: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Sumber password sebelum di-hash, format asli DDMMYYYY",
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Hash bcrypt dari tanggal lahir format DDMMYYYY",
    },
    role: {
      type: DataTypes.ENUM("uploader", "admin"),
      allowNull: false,
      defaultValue: "uploader",
    },
    prodi: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    jurusan: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    updatedAt: false, // sesuai spek: hanya created_at
  }
);

module.exports = User;
