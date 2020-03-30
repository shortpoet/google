const messagePart = (sequelize, DataTypes) => {
	const MessagePart = sequelize.define('messagePart', 
		{
			id: {type: DataTypes.STRING(32), allowNull: false, primaryKey: true},
			messageId: {type: DataTypes.STRING(32), allowNull: false},
			mimeType: {type: DataTypes.STRING, allowNull: true},
			contentType: {type: DataTypes.STRING, allowNull: true},
			contentTransferEncoding: {type: DataTypes.STRING, allowNull: true},
			bodySize: {type: DataTypes.INTEGER, allowNull: true},
			bodyData: {type: DataTypes.TEXT, allowNull: true},
		}, {
			schema: 'gmail',
			tableName: 'MessageParts',
			classMethods: {
				associate (models) {
					// if this is unquoted 2 fks are created 
					// if only this is unquoted an error is thrown
					// MessagePart.belongsTo(models.messagePart);
				}
			}
		});
  return MessagePart;
}

module.exports = messagePart;