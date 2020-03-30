const message = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    messageId: {type: DataType.STRING(30), allowNull: false, primaryKey: true},
    threadId: {type: DataType.STRING(30), allowNull: true},
    labelIds: {type: DataType.STRING(255), allowNull: true},
    date: {type: DataType.STRING(255), allowNull: true},
    from: {type: DataType.STRING(255), allowNull: true},
    received: {type: DataType.STRING(255), allowNull: true},
    receivedSPF: {type: DataType.STRING(255), allowNull: true},
    subject: {type: DataType.STRING(255), allowNull: true},
    listUnsubscribe: {type: DataType.STRING(255), allowNull: true},
    historyId: {type: DataType.STRING(255), allowNull: true},
    internalDate: {type: DataType.STRING(255), allowNull: true},
    parts: {type: DataType.STRING(255), allowNull: true}
  }, {
    associate (models) {
      Message.hasMany(models.messagePart);
    }
  });
  return Message;
}

module.exports = message;