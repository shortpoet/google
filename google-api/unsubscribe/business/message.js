class Message {
  constructor ( {messageId, threadId, labelIds, date, from, received, receivedSPF, subject, listUnsubscribe, historyId, internalDate, messageParts} ) {
    this.messageId = messageId
    this.threadId = threadId
    this.labelIds = labelIds
    this.date = date
    this.from = from
    this.received = received
    this.receivedSPF = receivedSPF
    this.subject = subject
    this.listUnsubscribe = listUnsubscribe
    this.historyId = historyId
    this.internalDate = internalDate
    this.messageParts = messageParts
    this.link = `=HYPERLINK("https://mail.google.com/mail/u/0/#inbox/${this.messageId}#", "View")`;
  }
}

module.exports = Message;