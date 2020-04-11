// Copyright 2018 Google LLC
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
const util = require('util');
const {writeJson} = require('../../util/index');
const {google} = require('googleapis');
// const sampleClient = require('../sampleclient');
const refreshClient = require('../../_refreshClient');
const gmail = google.gmail({
  version: 'v1',
  auth:  refreshClient.oAuth2Client,
});  


async function getMessageList() {
  const res = await gmail.users.messages.list({userId: 'me'});
  console.log(res.data);
  return res.data;
}

async function getMessage(messageId) {
  const res = await gmail.users.messages.get({userId: 'me', id: messageId});
  console.log(util.inspect(res, false, null, true));
  writeJson(res.data, 'message.data.json', 2)
  return res.data;
}
// Extract message ID, sender, attachment filename and attachment ID
// from the message.
const extractInfoFromMessage = (message) => {
  const messageId = message.id;
  let from;
  let filename;
  let attachmentId;

  const headers = message.payload.headers;
  for (var i in headers) {
    if (headers[i].name === 'From') {
      from = headers[i].value;
    }
  }

  const payloadParts = message.payload.parts;
  for (var j in payloadParts) {
    if (payloadParts[j].body.attachmentId) {
      filename = payloadParts[j].filename;
      attachmentId = payloadParts[j].body.attachmentId;
    }
  }

  return {
    messageId: messageId,
    from: from,
    attachmentFilename: filename,
    attachmentId: attachmentId
  };
};

// Get attachment of a message.
const extractAttachmentFromMessage = async (email, messageId, attachmentId) => {
  return gmail.users.messages.attachments.get({
    id: attachmentId,
    messageId: messageId,
    userId: email
  });
};

const runSample = async () => {
  const messageListRes = await getMessageList()
  const messages = messageListRes.messages;
  const nextPageToken = messageListRes.nextPageToken;
  const resultSizeEstimate = messageListRes.resultSizeEstimate;
  const i = 0;
  const message = messages[i];
  const messageRes = await getMessage(message.id);
  const messageThread = message.threadId;
  const messageInfo = extractInfoFromMessage(messageRes);
  console.log(util.inspect(messageInfo, false, null, true));
  return messageInfo
}

if (module === require.main) {
  refreshClient
    .authenticate()
    .then(() => {
      runSample()
    })
    .catch(console.error);
}

module.exports = {
  runSample,
  client: refreshClient.oAuth2Client,
};
