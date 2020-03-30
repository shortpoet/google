const message = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', 
  {
    messageId: {type: DataTypes.STRING(32), allowNull: false, primaryKey: true},
    threadId: {type: DataTypes.STRING(32), allowNull: true},
    labelIds: {type: DataTypes.STRING, allowNull: true},
    date: {type: DataTypes.DATE, allowNull: true},
    from: {type: DataTypes.STRING, allowNull: true},
    received: {type: DataTypes.STRING, allowNull: true},
    receivedSPF: {type: DataTypes.STRING, allowNull: true},
    subject: {type: DataTypes.STRING(512), allowNull: true},
    listUnsubscribe: {type: DataTypes.STRING, allowNull: true},
    historyId: {type: DataTypes.STRING(128), allowNull: true},
    internalDate: {type: DataTypes.STRING(32), allowNull: true},
  }, {
    schema: 'gmail',
    tableName: 'Messages',
    classMethods: {
      associate (models) {
        // if this is commented and messagePart is not it throws an error
        // both commented obvs no fk
        Message.hasMany(models.messagePart);
      }
    }
  });
  return Message;
}

module.exports = message;