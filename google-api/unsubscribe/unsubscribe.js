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
const util = require('util');
const gmailClient = require('./gmailClient');
const SqlClient = require('./models/sqlClient');
const { writeJson, appendSeparatorFile } = require('../util/index');
const Sequelize = require('sequelize');

const runSample = async () => {
  // const account = 'shortpoet'
  // const messageListRes = await gmailClient.getMessageList()
  // var messages = messageListRes.messages;
  // const nextPageToken = messageListRes.nextPageToken;
  // const resultSizeEstimate = messageListRes.resultSizeEstimate;
  // // https://caolan.github.io/async/v3/docs.html#eachOf
  // // messages = messages.slice(12, 13);
  // eachOf(messages, (message, i) => {
  //   // console.log(message)
  //   console.log(i, message.id)
  //   // console.log(message.id)
  //   try {
  //     gmailClient.getMessage(message.id).then((messageRes => {
  //       // console.log(i, message.id, message.listUnsubscribe)
  //       // let messageThread = message.threadId;
  //       gmailClient.extractInfoFromMessage(messageRes).then((messageInfo) => {
  //         if(messageInfo.listUnsubscribe){
  //           // console.log(util.inspect(`'middle loop', ${messageInfo.messageId}, ${messageInfo.listUnsubscribe}`, false, null, true));
  //         }
  //         gmailClient.parseData(messageInfo).then((message) =>{
  //           // only returns if resolved and assigned a listUnsubscribe
  //           // the below only executes in that case
  //           console.log(util.inspect(`'inner loop', ${message.messageId}, ${message.listUnsubscribe}`, false, null, true));
  //         });
  //       });
  //     }));
  //     } catch (e) {
  //     console.error(e);
  //   }
  // }, (err) => {
  //   if (err) console.error(err.message);
  // });

  // const i = 0;
  // const message = messages[i];

  // writeJson(messageRes, `../${account}_data/${message.id}.message.data.json`, 2)
  // console.log(util.inspect(messageInfo, false, null, true));

  var sqlIze = new SqlClient();
  
  sqlIze.authenticate();

  // var unsuBC = new UnsubscribeClient(options);
  // unsuBC.getData().then((data) => {
  //   console.log(data)
  // });
  try {
    } catch(e) {
    console.error(e)
  }
}

if (module === require.main) {
  gmailClient.client
    .authenticate()
    .then(() => {
      runSample()
    })
    .catch(console.error);
}

module.exports = {
  runSample,
  client: gmailClient.client.oAuth2Client,
};
