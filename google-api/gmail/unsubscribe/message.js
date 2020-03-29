class Message {
  constructor ( {messageId, threadId, labelIds, date, from, received, receivedSPF, subject, listUnsubscribe, historyId, internalDate, parts, status} ) {
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
    this.parts = parts
    this.status = status
    this.link = link
  }
  get size() {
    var size;
    if (this.parts){
      size = this.parts.reduce((a, b) => { a.bodySize + b.bodySize }, 0);
    } else if (this.body.size) {
      size = this.body.size;
    } else {
      size = 0;
    }
    return size;
  }
  get link() {
    return `https://mail.google.com/mail/u/0/#inbox/${this.messageId}`;
  }
  get status(){
    var status;
    if (this.listUnsubscribe.contains('mailto')) {
      status = 'mailed unsubscribe';
    } else if (this.listUnsubscribe.contains('href')) {
      status = 'has unsubscribe link';
    } else {
      status = '';
    }
    return status;
  }
}

module.exports = Message;