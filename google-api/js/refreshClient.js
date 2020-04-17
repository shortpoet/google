// Copyright 2016 Google LLC
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

/**
 * This is used by several samples to easily provide an oauth2 workflow.
 */

// [START auth_oauth2_workflow]
const {google} = require('googleapis');
const http = require('http');
const url = require('url');
const opn = require('open');
const destroyer = require('server-destroy');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, './config/oauth2.keys.json');
let keys = {
  redirect_uris: ['http://localhost:3000/oauth2callback'],
};


if (fs.existsSync(keyPath)) {
  const keyFile = require(keyPath);
  keys = keyFile.installed || keyFile.web;
}
const keyFile = require(keyPath);
keys = keyFile.installed || keyFile.web;


// console.log(keyPath)
// console.log(keyFile)
// console.log(keys)


const invalidRedirectUri = `The provided keyfile does not define a valid
redirect URI. There must be at least one redirect URI defined, and this sample
assumes it redirects to 'http://localhost:3000/oauth2callback'.  Please edit
your keyfile, and add a 'redirect_uris' section.  For example:

"redirect_uris": [
  "http://localhost:3000/oauth2callback"
]
`;
// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com/', 'https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/calendar'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'h:/source/repos/google/google-api/js/config/token.json';
const tokenPath = path.join(__dirname, TOKEN_PATH);
console.log(tokenPath)
class RefreshClient {
  constructor(options) {
    this._options = options || {scopes: []};

    // validate the redirectUri.  This is a frequent cause of confusion.
    if (!keys.redirect_uris || keys.redirect_uris.length === 0) {
      throw new Error(invalidRedirectUri);
    }
    const redirectUri = keys.redirect_uris[keys.redirect_uris.length - 1];
    console.log(redirectUri)
    const parts = new url.URL(redirectUri);
    // console.log(parts)
    if (
      redirectUri.length === 0 ||
      parts.port !== '3000' ||
      parts.hostname !== 'localhost' ||
      parts.pathname !== '/oauth2callback'
    ) {
      throw new Error(invalidRedirectUri);
    }

    // create an oAuth client to authorize the API call
    this.oAuth2Client = new google.auth.OAuth2(
      keys.client_id,
      keys.client_secret,
      redirectUri
    );
  }

  // Open an http server to accept the oauth callback. In this
  // simple example, the only request to our webserver is to
  // /oauth2callback?code=<code>
  async authenticate() {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(TOKEN_PATH)) {
        console.log(TOKEN_PATH)
        fs.readFile(TOKEN_PATH, (err, token) => {
          this.oAuth2Client.setCredentials(JSON.parse(token));
          resolve(this.oAuth2Client)
          console.log('Authenticated with token')
        });    
      } else {
        // grab the url that will be used for authorization
        this.authorizeUrl = this.oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES.join(' '),
        });
        const server = http
          .createServer(async (req, res) => {
            try {
              if (req.url.indexOf('/oauth2callback') > -1) {
                const qs = new url.URL(req.url, 'http://localhost:3000')
                  .searchParams;
                res.end(
                  'Authentication successful! Please return to the console.'
                );
                server.destroy();
                const {tokens} = await this.oAuth2Client.getToken(qs.get('code'));
                this.oAuth2Client.credentials = tokens;
                fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), (err) => {
                  if (err) return console.error(err);
                  console.log('Token stored to', TOKEN_PATH);
                });          
                resolve(this.oAuth2Client);
              }
            } catch (e) {
              reject(e);
            }
          })
          .listen(3000, () => {
            // open the browser to the authorize url to start the workflow
            opn(this.authorizeUrl, {wait: false}).then(cp => cp.unref());
          });
        destroyer(server);
      } 
    });
  }
}
// [END auth_oauth2_workflow]
module.exports = new RefreshClient();
