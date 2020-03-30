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

const gmail = google.gmail({
  version: 'v1',
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
      // if there is more than one part with bodySize property
      if (message.parts.length > 1) {
        message.size = message.parts.reduce((a, b) => a.bodySize + b.bodySize);
      }
      else {
        message.size = message.parts[0].bodySize
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

const gmailClient = {
  getMessageList,
  getMessage,
  extractInfoFromMessage,
  parseData,
  buildMessage,
  sendMessage,
  client: refreshClient
};
module.exports = gmailClient;