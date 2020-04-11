// class MessagePart {
	// constructor ( {mimeType, contentType, contentTransferEncoding, bodySize, bodyData} ) {
	// 	this.mimeType = mimeType
	// 	this.contentType = contentType
	// 	this.contentTransferEncoding = contentTransferEncoding
	// 	this.bodySize = bodySize
	// 	this.bodyData = bodyData
	// }
// }

class MessagePart {
	constructor (data = {}) {
		Object.assign(this,
		{
			messageId: '',
			mimeType: '',
			contentType: '',
			contentTransferEncoding: '',
			bodySize: '',
			bodyData: '',
		}, data);
	}
}

module.exports = MessagePart;