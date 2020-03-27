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
const {writeJson} = require('../util/index');
const {google} = require('googleapis');
// const sampleClient = require('../sampleclient');
const refreshClient = require('../_refreshClient');

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    writeJson(res.data, 'labels.data.json', 2)
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}

const runSample = async () => {
  const labelListRes = await listLabels(refreshClient.oAuth2Client)
  const labels = labelListRes.labels;
  console.log(util.inspect(labelListRes, false, null, true));
  return labels
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
