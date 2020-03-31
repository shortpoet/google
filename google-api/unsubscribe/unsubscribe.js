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
const gmailClient = require('./business/gmailClient');
// const SqlClient = require('./models/sqlClient');
const { writeJson, appendSeparatorFile } = require('../util/index');
const Sequelize = require('sequelize');
const db = require('./models/index')

const runSample = async () => {
  const account = 'shortpoet'
  const messageListRes = await gmailClient.getMessageList()
  var messages = messageListRes.data.messages;
  const nextPageToken = messageListRes.data.nextPageToken;

  const resultSizeEstimate = messageListRes.data.resultSizeEstimate;
  // var sqlIze = new SqlClient();
  
  // var db = sqlIze.load().sequelize;
  await db.sequelize.sync(
    // this will drop the table first and re-create it afterwards
    {force: true}
  );
  // db.drop();
  // db.authenticate();

  // https://caolan.github.io/async/v3/docs.html#eachOf
  // messages = messages.slice(0, 14);
  eachOf(messages, (message, i) => {
    // console.log(message)
    console.log(i, message.id);
    // console.log(message.id)
    try {
      gmailClient.getMessage(message.id).then((getMessageRes => {
        let messageData = getMessageRes.data
        // console.log(i, message.id, message.listUnsubscribe)
        // let messageThread = message.threadId;
        gmailClient.extractInfoFromMessage(messageData).then((messageInfo) => {
          if(messageInfo.listUnsubscribe){
            // console.log(util.inspect(`'middle loop', ${messageInfo.messageId}, ${messageInfo.listUnsubscribe}`, false, null, true));
          }
          gmailClient.parseData(messageInfo).then((message) =>{
            // only returns if resolved and assigned a listUnsubscribe
            // the below only executes in that case
            try {
              if (message.listUnsubscribe) {
                if (message.status === 'Needs_Mail') {
                  let toEmail = message.listUnsubscribe;
                  let toName = message.from;
                  if (message.from) {
                    gmailClient.sendMessage(gmailClient.buildMessage(toEmail, toName)).then((sendMessageRes) => {
                      if (sendMessageRes.status === 200) {
                        message.status = 'Mail_Sent';
                        try {
                          gmailClient.trashMessage(message.messageId).then((trashMessageRes) => {
                            // console.log(util.inspect(trashMessageRes, false, null, true));
                            if (trashMessageRes.status === 200) {
                              message.status = 'Mail_Sent_Original_Deleted';
                            }
                          })
                        } catch(e) {
                          message.status = 'Error_Deleting_Mail';
                          console.error(e);
                        }
                      }
                    });
                  } else {
                    message.status = 'Needs_Mail_No_From'
                  }
                }  
              }
            } catch(e) {
              message.status = 'Error_Sending_Mail';
              console.error(e);
            } finally {
              try {
                //                    was using associations: here instead of model: and it caused loooooong detour
                db.message.create(message, {include: [{model: db.messagePart}]}).then((response) => {
                // console.log(util.inspect(`'inner loop', ${message.messageId}, ${message.listUnsubscribe}`, false, null, true));
                // console.log(util.inspect(`'inner loop', ${response}`, false, null, true));
                });
              } catch(e) {
                console.error(e);
              }            }
          });
        });
      }));
      } catch (e) {
        console.log('error getting message');
        console.error(e);
    }
  }, (err) => {
    if (err) console.error(err.message);
  });

  // const i = 0;
  // const message = messages[i];

  // writeJson(messageRes, `./log/${account}_data/${message.id}.message.data.json`, 2)
  // console.log(util.inspect(messageInfo, false, null, true));

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
