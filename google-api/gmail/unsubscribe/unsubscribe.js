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
      // let _status = 'Has Data';
    
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
        labelIds: message.labelIds.join(', '),
        date: _date,
        from: _from,
        received: _received,
        receivedSPF: _receivedSPF,
        subject: _subject,
        listUnsubscribe: _listUnsubscribe,
        historyId: message.historyId,
        internalDate: message.internalDate,
        // status: _status,
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
  { type: 'string', field: 'messageId', header: 'ID' },
  { type: 'string', field: 'labelIds', header: 'Labels'},
  { type: 'string', field: 'status', header: 'Status'},
  { type: 'string', field: 'date', header: 'Date Recieved' },
  { type: 'string', field: 'listUnsubscribe', header: 'Unsubscribe Link / Email' },
  { type: 'link', field: 'link', header: 'Link' },
  { type: 'string', field: 'from', header: 'Message Sender' },
  { type: 'integer', field: 'size', header: 'Message Size' }
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

/**
 * Builds a request that sets the header row.
 * @param  {string} sheetId The ID of the sheet.
 * @return {Object}         The reqeuest.
 */
function buildMessageRowRequest(sheetId, message, rowIndex) {
  var cells = COLUMNS.map(function(column) {
    switch (column.type) {
      case 'integer':
        return {
          userEnteredValue: {
            numberValue: message[`${column.field}`]
          },
          userEnteredFormat: {
            numberFormat: {
              type: 'NUMBER',
            }
          }
        };
        break;
      case 'link':
        return {
          userEnteredValue: {
            formulaValue: message[column.field]
          }
        };
        break;
      case 'string':
        return {
          userEnteredValue: {
            stringValue: message[column.field]
          }
        };
        break;
      default:
        return {
          userEnteredValue: {
            stringValue: order[column.field].toString()
          }
        };
    }
  });
  return {
    updateCells: {
      start: {
        sheetId: sheetId,
        rowIndex: rowIndex,
        columnIndex: 0
      },
      rows: [
        {
          values: cells
        }
      ],
      fields: '*'
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


async function updateSheet({spreadsheetId, command, dataSheetId, rowIndex, message}) {
  let requests;
  switch (command) {
    case 'delete':
      requests = [
        buildDeleteRequest(dataSheetId)
      ];
    case 'header':
      requests = [
        buildHeaderRowRequest(dataSheetId),
      ];
    case 'message':
      requests = [
        buildMessageRowRequest(dataSheetId, message, rowIndex),
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
  // writeJson(response, `../data/sheet.update.data.json`, 2)
  console.log(JSON.stringify(response, null, 2))
  return response
}

// https://www.labnol.org/code/19959-gmail-unsubscribe
const parseData = async (message) => {
  return new Promise((resolve, reject) => {
    try {
      let urls = [];
      // console.log(util.inspect(message, false, null, true));
      if (message.listUnsubscribe) {
        // console.log(message.listUnsubscribe)
      } else {
        // console.log(`no unsub for ${message.messageId}`)
        message.parts.forEach(p => {
          let url;
          try {
            var hrefs = new RegExp(/<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>(.*?)<\/a>/gi);
            var hrefs2 = new RegExp(/<a[^>]*href=.*?["'](https?:\/\/[^"']+).*>(.*?)<\/a.*\s*>/gi);
            // console.log(hrefs)
            let body = atob(p.bodyData)
            // console.log((urls = hrefs.exec(body)))
            // console.log(body)
            body.replace(/\s/g, "");
            while ( urls = hrefs.exec(body) ) {
              if (urls[1].match(/unsubscribe|click|optout|opt\-out|remove/i) || urls[2].match(/unsubscribe|click|optout|opt\-out|remove/i)) {
                url = urls[1];
                message.listUnsubscribe = url;
                // console.log(urls)
                // in this position it only resolves if it parses successfully
                // resolve(message);
              } else {
                while ( urls = hrefs2.exec(body) ) {
                  if (urls[1].match(/unsubscribe|click|optout|opt\-out|remove/i) || urls[2].match(/unsubscribe|click|optout|opt\-out|remove/i)) {
                    url = urls[1];
                    message.listUnsubscribe = url;
                    // console.log(urls)
                    // in this position it only resolves if it parses successfully
                    // resolve(message);
                  }
              }
            } 
          }   
          } catch (e) {
            console.error(e)
          }
        });
      // console.log(util.inspect(urls, false, null, true));
    }

    if (message.listUnsubscribe){
      if (message.listUnsubscribe.includes('mailto')) {
        message.status = 'mailed unsubscribe';
      } else if (message.listUnsubscribe.includes('href')) {
        message.status = 'has unsubscribe link';
    }
    } else {
      message.status = '';
    }

    if (message.parts){
      if (message.parts[0].bodySize) {
        message.size = message.parts.reduce((a, b) => a.bodySize + b.bodySize);
      }
    } else if (message.body.size) {
      message.size = message.body.size;
    } else {
      message.size = 0;
    }

    resolve(message);
    } catch(e) {
      console.error(e);
      reject(e);
    }
  });
}

const buildMessage = () => {
  // You can use UTF-8 encoding for the subject using the method below.
  // You can also just use a plain string if you don't need anything fancy.
  // const subject = '🤘 Hello 🤘';
  // const subject = 'unsubscribe';
  // const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    'From: Justin Beckwith <beckwith@google.com>',
    'To: Justin Beckwith <beckwith@google.com>',
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: unsubscribe`,
    '',
    'This is a message just to say unsubscribe me.',
    'So... <b>UNSUBSCRIBE!</b>  🤘❤️😎',
  ];
  const message = messageParts.join('\n');

  // The body needs to be base64url encoded.
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return encodedMessage
}

const sendMessage = async (encodedMessage) => {
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: encodedMessage
  });
  // console.log(util.inspect(res, false, null, true));
  return res.data;
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
          if(messageInfo.listUnsubscribe){
            // console.log(util.inspect(`'middle loop', ${messageInfo.messageId}, ${messageInfo.listUnsubscribe}`, false, null, true));
          }
          parseData(messageInfo).then((message) =>{
            // only returns if resolved and assigned a listUnsubscribe
            // the below only executes in that case
            console.log(util.inspect(`'inner loop', ${message.messageId}, ${message.listUnsubscribe}`, false, null, true));
            const spreadsheetId = '12U6Vw9LujwdL2aYMKmOGTWNReBl-NifKIq6Wy_QQ77w'
            const dataSheetId = '1233090604'
            updateSheet({spreadsheetId: spreadsheetId, dataSheetId: dataSheetId, command: 'header', rowIndex: (i + 1), message: message})
          });
        });
      }));
      } catch (e) {
      console.error(e);
    }
  }, (err) => {
    if (err) console.error(err.message);
  });

  // const i = 0;
  // const message = messages[i];

  // writeJson(messageRes, `../${account}_data/${message.id}.message.data.json`, 2)
  // console.log(util.inspect(messageInfo, false, null, true));

  // var unsuBC = new UnsubscribeClient(options);
  // unsuBC.getData().then((data) => {
  //   console.log(data)
  // });
  
  // leading / allows to skip using path.join
  // createSheet(titler('shortpoetSheet')).then((spreadsheet) => {
  //   console.log(spreadsheet)
  //   const spreadsheetId = spreadsheet.spreadsheetId
  //   const dataSheetId = spreadsheet.sheets[0].properties.sheetId
  //   updateSheet({spreadsheetId: spreadsheetId , command: 'header', dataSheetId: dataSheetId})

  //   // appendSeparatorFile(spreadsheetId, '../data/dataSheetIds.txt').then(() => {
  //   //   appendSeparatorFile(dataSheetId, '../data/dataSheetIds.txt').then(() => {
  //   //     console.log('currIds', [spreadsheetId, dataSheetId])
  //   //     previousIds().then((pIds) => {
  //   //       console.log('pIdsPromise', pIds)
  //   //       // updateSheet(pIds[0], {command: 'delete', dataSheetId: pIds[1]})  
  //   //       // updateSheet(spreadsheetId, {command: 'header', dataSheetId: dataSheetId})  
  //   //     })
  //   //   });
  //   // });
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
