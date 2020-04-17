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

const {google} = require('googleapis');
const refreshClient = require('../refreshClient');

const calendar = google.calendar({
  version: 'v3',
  auth: refreshClient.oAuth2Client,
});

async function runSample() {
  try {
    calendar.calendarList.list().then((res) => {
      console.log(res.data);
      return res.data;
    });
  } catch (e) {
    console.error(e.message);
  }
}
const runSampleExternal = async () => {
  return new Promise((resolve, reject) => {
    try {
      // when this first part of the promise chain was outside the new promise it wasn't working bec auth happening after then/resolve in final call
      refreshClient.authenticate()
      .then(() => {
          try {
            calendar.calendarList.list().then((res) => {
              // console.log(res.data)
              resolve(res.data);
            });
          } catch(e) {
            reject(e.message)
          }
      });
    } catch (e) {
      console.error(e.message);
    }
  });
}

if (module === require.main) {
  refreshClient
    .authenticate()
    .then(runSample)
    .catch(console.error);
}

module.exports = {
  runSample,
  runSampleExternal,
  client: refreshClient.oAuth2Client,
};
