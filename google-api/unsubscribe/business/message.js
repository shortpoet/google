class Message {
  constructor ( {messageId, threadId, labelIds, date, from, received, receivedSPF, subject, listUnsubscribe, historyId, internalDate, messageParts} ) {
    this.messageId = messageId
    this.labelIds = labelIds
    this.date = date
    this.from = from
    this.subject = subject
    this.status = ''
    this.listUnsubscribe = listUnsubscribe
    // this.link = `=HYPERLINK("https://mail.google.com/mail/u/0/#inbox/${this.messageId}#", "View")`;
    this.link = `https://mail.google.com/mail/u/0/#inbox/${this.messageId}`;
    this.threadId = threadId
    this.received = received
    this.receivedSPF = receivedSPF
    this.historyId = historyId
    this.internalDate = internalDate
    this.messageParts = messageParts
  }
}

module.exports = Message;