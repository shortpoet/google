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
const fs = require('fs');
const path = require('path');
const eachOf = require('async/eachOf');
const { google } = require('googleapis');
const util = require('util');
const btoa= require('btoa')
const atob= require('atob')

const { writeJson, appendSeparatorFile } = require('../../util/index');

const recase = require('../../util/recase');
// const sampleClient = require('../sampleclient');
const refreshClient = require('../../refreshClient');
const Message = require('./message');
const MessagePart = require('./messagePart');
const UnsubscribeClient = require('./unsubscribeClient')

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
  // console.log(res.data);
  return res.data;
}

async function getMessage(messageId) {
  const res = await gmail.users.messages.get({userId: 'me', id: messageId});
  // console.log(util.inspect(res, false, null, true));
  return res.data;
}
// Extract message ID, sender, attachment filename and attachment ID
// from the message.
const extractInfoFromMessage = async (message) => {
  return new Promise((resolve, reject) => {
    try {
      let _date;
      let _from;
      let _subject;
      let _received;
      let _receivedSPF;
      let _listUnsubscribe;
    
      const headers = message.payload.headers;
      if (!headers) console.info(`no headers for ${message.id}`)
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
      if (payloadParts) {
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
        // console.log('no body', message.id, message.payload.body.size)
      } else if (message.payload.body.size > 0) {
        // console.log(message.id, message.payload.body.size)
        // sometimes the body and data are directly in the payload
        _parts.push(new MessagePart({
          bodySize: message.payload.body.size,
          bodyData: message.payload.body.data,
          contentType: '',
          contentTransferEncoding: ''
        }))
      } else {
        console.info(`no parts or body for ${message.id}`)
      }

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
      resolve(data);
    } catch(e) {
      console.error(e);
      reject(e);
    }
  });
};

async function createSheet(title) {
  const resource = {
    properties: {
      title: title.title
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
  const response = (await sheets.spreadsheets.create({
    // fields indicates which are included in response, default is all
    // fields:'spreadsheetId',
    resource
  })
  ).data
  writeJson(response, `../data/${title.field}.create.data.json`, 2)
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

function buildDeleteRequest(sheetId) {
  return {
    deleteSheet: {
      sheetId: sheetId,
    }
  };
}

async function updateSheet(spreadsheetId, command) {
  let requests;
  switch (command.command) {
    case 'delete':
      requests = [
        buildDeleteRequest(command.dataSheetId)
      ];
    case 'header':
      requests = [
        buildHeaderRowRequest(command.dataSheetId),
      ];
    break;
  }
  const resource = {
    requests: requests
  };
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

const titler = title => {
  let d = new Date();
  let h = d.getHours();
  let m = d.getMinutes();
  return {
    field: `${title}_${h}_${m}`,
    title: `${recase(title)}-${h}-${m}`
  }
}

const previousIds = async () => {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(__dirname + '/../data/dataSheetIds.txt', 'utf8', (err, ids) => {
        ids = ids.split(',')
        console.log(ids)
        console.log(ids.length)
        this.out = [ids[ids.length - 2], ids[ids.length - 1]]
        console.log('pidsFunc', this.out)
        resolve(this.out)
      })
    }
    catch(e) {
      resolve(e)
    }
  })
};  

const parseData = async (message) => {
  return new Promise((resolve, reject) => {
    try {
      let urls = [];
      // console.log(util.inspect(message, false, null, true));
      if (message.listUnsubscribe) {
        console.log(message.listUnsubscribe)
      } else {
        console.log(`no unsub for ${message.messageId}`)
        message.parts.forEach(p => {
          let url;
          try {
            console.log(atob(p.bodyData))
            url = atob(p.bodyData).match(/^list\-unsubscribe:(.|\r\n\s)+<(https?:\/\/[^>]+)>/im);
            console.log(url)
          } catch (e) {
            console.error(e)
          }
          urls.push(url);
        });
      // console.log(util.inspect(urls, false, null, true));
      resolve(urls);
    }
    } catch(e) {
      console.error(e);
      reject(e);
    }
  });
}

const runSample = async () => {
  const account = 'shortpoet'
  const messageListRes = await getMessageList()
  var messages = messageListRes.messages;
  const nextPageToken = messageListRes.nextPageToken;
  const resultSizeEstimate = messageListRes.resultSizeEstimate;
  // https://caolan.github.io/async/v3/docs.html#eachOf
  messages = messages.slice(0, 4);
  eachOf(messages, (message, i) => {
    // console.log(message)
    console.log(i, message.id)
    // console.log(message.id)
    try {
      getMessage(message.id).then((messageRes => {
        // console.log(i, message.id, message.listUnsubscribe)
        // let messageThread = message.threadId;
        extractInfoFromMessage(messageRes).then((messageInfo) => {
          parseData(messageInfo).then((urls) =>{
            console.log(util.inspect(message.id, urls, false, null, true));
          });
        });
      }));
      } catch (e) {
      console.error(e);
      return callback(e);
    }


  }, (err) => {
    if (err) console.error(err.message);
  });
  const i = 0;
  const message = messages[i];
  // writeJson(messageRes, `../${account}_data/${message.id}.message.data.json`, 2)
  // console.log(util.inspect(messageInfo, false, null, true));

  // var unsuBC = new UnsubscribeClient();
  // unsuBC.getData().then((data) => {
  //   console.log(data)
  // });
  
  // leading / allows to skip using path.join
  // createSheet(titler('shortpoetSheet')).then((spreadSheet) => {
  //   // console.log(spreadSheet)
  //   const spreadsheetId = spreadSheet.spreadsheetId
  //   const dataSheetId = spreadSheet.sheets[0].properties.sheetId
  //   appendSeparatorFile(spreadsheetId, '../data/dataSheetIds.txt').then(() => {
  //     appendSeparatorFile(dataSheetId, '../data/dataSheetIds.txt').then(() => {
  //       console.log('currIds', [spreadsheetId, dataSheetId])
  //       previousIds().then((pIds) => {
  //         console.log('pIdsPromise', pIds)
  //         updateSheet(pIds[0], {command: 'delete', dataSheetId: pIds[1]})  
  //         updateSheet(spreadsheetId, {command: 'header', dataSheetId: dataSheetId})  
  //       })
  //     });
  //   });
  // })
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
