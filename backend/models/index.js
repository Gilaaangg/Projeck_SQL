const sequelize = require("../config/database");
const User = require("./User");
const Document = require("./Document");

// Relasi: 1 User (uploader) bisa punya banyak Document
User.hasMany(Document, {
  foreignKey: "uploaded_by",
  as: "documents",
  onDelete: "CASCADE",
});
Document.belongsTo(User, {
  foreignKey: "uploaded_by",
  as: "uploader",
});

module.exports = {
  sequelize,
  User,
  Document,
};
