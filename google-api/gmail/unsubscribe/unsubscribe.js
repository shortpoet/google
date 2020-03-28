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
const { writeJson } = require('../../util/index');
const recase = require('../../util/recase');
const { google } = require('googleapis');

const util = require('util');
// const sampleClient = require('../sampleclient');
const refreshClient = require('../../refreshClient');
const Message = require('./message.js');
const MessagePart = require('./messagePart.js');

const gmail = google.gmail({
  version: 'v1',
  auth:  refreshClient.oAuth2Client,
});  
const sheets = google.sheets({
  version: 'v4',
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
  return res.data;
}
// Extract message ID, sender, attachment filename and attachment ID
// from the message.
const extractInfoFromMessage = (message) => {
  let _date;
  let _from;
  let _subject;
  let _received;
  let _receivedSPF;
  let _listUnsubscribe;

  const headers = message.payload.headers;
  headers.forEach(h => {
    if (h.name === 'Date') { _date = h.value; }
    if (h.name === 'From') { _from = h.value; }
    if (h.name === 'Subject') { _subject = h.value; }
    if (h.name === 'Received') { _received = h.value; }
    if (h.name === 'Received-SPF') { _receivedSPF = h.value; }
    if (h.name === 'List-Unsubscribe') { _listUnsubscribe = h.value; }
  })

  const payloadParts = message.payload.parts;
  let _parts = []
  payloadParts.forEach(p => {
    let _contentType;
    let _contentTransferEncoding;
    const partHeaders = p.headers;
    partHeaders.forEach(ph => {
      if (ph.name === 'Content-Type') { _contentType = ph.value; }
      if (ph.name === 'Content-Transfer-Encoding') { _contentTransferEncoding = ph.value; }
    })
    let _part  = new MessagePart({
      mimeType: p.mimeType,
      bodySize: p.body.size,
      bodyData: p.body.data,
      contentType: _contentType,
      contentTransferEncoding: _contentTransferEncoding
    })
    _parts.push(_part)
  })

  let data = new Message({
    messageId: message.id,
    threadId: message.threadId,
    labelIds: message.labelIds,
    date: _date,
    from: _from,
    received: _received,
    receivedSPF: _receivedSPF,
    subject: _subject,
    listUnsubscribe: _listUnsubscribe,
    historyId: message.historyId,
    internalDate: message.internalDate,
    parts: _parts
    })
  return data
};

async function createSheet() {
  const resource = {
    properties: {
      title: "Shortpoet Sheet"
    },
    sheets: [
      {
        properties: {
          title: "Unsubscriber",
          tabColor: {
            alpha: 0,
            blue: 0,
            green: 0,
            red: 0
          },
          index: 0,
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 100000,
            columnCount: 8
          }
        }
      }
    ],
  }
  // const _title = recase(JSON.parse(JSON.stringify(resource.properties.title)))
  const _title = "shortpoetSheet"
  const response = (await sheets.spreadsheets.create({
    // fields indicates which are included in response, default is all
    // fields:'spreadsheetId',
    resource
  })
  ).data
  writeJson(response, `../data/${_title}.create.data.json`, 2)
  // console.log(JSON.stringify(response, null, 2))
  return response
}

var COLUMNS = [
  { field: 'id', header: 'ID' },
  { field: 'status', header: 'Status'},
  { field: 'link', header: 'Link' },
  { field: 'date', header: 'Date Recieved' },
  { field: 'messageSender', header: 'Message Sender' },
  { field: 'messageSize', header: 'Message Size' },
  { field: 'unsubscribeInfo', header: 'Unsubscribe Link / Email' },
  { field: 'status', header: 'Status'}
];

/**
 * Builds a request that sets the header row.
 * @param  {string} sheetId The ID of the sheet.
 * @return {Object}         The reqeuest.
 */
function buildHeaderRowRequest(sheetId) {
  var cells = COLUMNS.map(function(column) {
    return {
      userEnteredValue: {
        stringValue: column.header
      },
      userEnteredFormat: {
        textFormat: {
          bold: true
        }
      }
    }
  });
  return {
    updateCells: {
      start: {
        sheetId: sheetId,
        rowIndex: 0,
        columnIndex: 0
      },
      rows: [
        {
          values: cells
        }
      ],
      fields: 'userEnteredValue,userEnteredFormat.textFormat.bold'
    }
  };
}

async function updateSheet(spreadsheetId, dataSheetId) {
  const resource = {
    requests: [
      buildHeaderRowRequest(dataSheetId)
    ]
  }
  const response = (await sheets.spreadsheets.batchUpdate({
    // fields indicates which are included in response, default is all
    // fields:'spreadSheetId',
    spreadsheetId,
    resource
  })
  ).data
  writeJson(response, `../data/sheet.update.data.json`, 2)
  console.log(JSON.stringify(response, null, 2))
  return response
}



const runSample = async () => {
  // const account = 'shortpoet'
  // const messageListRes = await getMessageList()
  // const messages = messageListRes.messages;
  // const nextPageToken = messageListRes.nextPageToken;
  // const resultSizeEstimate = messageListRes.resultSizeEstimate;
  // const i = 0;
  // const message = messages[i];
  // const messageRes = await getMessage(message.id);
  // writeJson(messageRes, `../${account}_data/${message.id}.message.data.json`, 2)
  // const messageThread = message.threadId;
  // const messageInfo = extractInfoFromMessage(messageRes);
  // console.log(util.inspect(messageInfo, false, null, true));
  createSheet().then((spreadSheet) => {
    console.log(spreadSheet)
    const spreadsheetId = spreadSheet.spreadsheetId
    const dataSheetId = spreadSheet.sheets[0].properties.sheetId
    updateSheet(spreadsheetId, dataSheetId)  
  })
  // return messageInfo
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
