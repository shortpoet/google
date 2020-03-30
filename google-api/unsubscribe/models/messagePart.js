const messagePart = (sequelize, DataTypes) => {
  const MessagePart = sequelize.define('messagePart', {
    id: {type: DataType.STRING(30), allowNull: false, primaryKey: true},
		mimeType: {type: DataType.STRING(255), allowNull: true},
		contentType: {type: DataType.STRING(255), allowNull: true},
		contentTransferEncoding: {type: DataType.STRING(255), allowNull: true},
		bodySize: {type: DataType.STRING(255), allowNull: true},
		bodyData: {type: DataType.STRING(255), allowNull: true},
			}, {
    associate (models) {
      MessagePart.belongsTo(models.message, {as: 'parts'});
    }
  });
  return MessagePart;
}

module.exports = messagePart;