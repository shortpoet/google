/**
 * An extension of the below
 * 
 * @license
 * Copyright Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// [START refreshClient.js]
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {google} = require('googleapis');
const http = require('http');
const url = require('url');
const opn = require('open');
const destroyer = require('server-destroy');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';


class RefreshClient {
  constructor(options) {
		this._options = options || {scopes: SCOPES};

		// LIKE A GENIUS I FORGOT THESE NEXT FEW LINES FOR HOURS LOL
		// create an oAuth client to authorize the API call
		// Load client secrets from a local file.
		const keyPath = path.join(__dirname, 'credentials.json');
		const credentials = require(keyPath);
		const {client_secret, client_id, redirect_uris} = credentials.installed;
		this.oAuth2Client = new google.auth.OAuth2(
				client_id, client_secret, redirect_uris[0]);
		// ... LIKE A GENIUS
	}
	/**
	 * Create an OAuth2 client with the given credentials, and then execute the
	 * given callback function.
	 * @param {Object} credentials The authorization client credentials.
	 * @param {function} callback The callback to call with the authorized client.
	 */
	async authenticate() {
		return new Promise((resolve, reject) => {
			try {
				if (fs.existsSync(TOKEN_PATH)) {
					console.log(TOKEN_PATH)
					fs.readFile(TOKEN_PATH, (err, token) => {
						this.oAuth2Client.setCredentials(JSON.parse(token));
						console.log(JSON.parse(token))
						resolve(this.oAuth2Client)
					});    
				} else {
					resolve(this.getNewToken())
				}
			} catch (e) {
				reject(e);
			}
		});
	}
	/**
	 * Get and store new token after prompting for user authorization, and then
	 * execute the given callback with the authorized OAuth2 client.
	 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
	 * @param {getEventsCallback} callback The callback for the authorized client.
	 */
	async getNewToken() {
		return new Promise((resolve, reject) => {
			try {
				const authUrl = this.oAuth2Client.generateAuthUrl({
					access_type: 'offline',
					// scope: this._options.scopes.join(' '),
					scope: SCOPES
				});
				console.log('Authorize this app by visiting this url:', authUrl);
				const rl = readline.createInterface({
					input: process.stdin,
					output: process.stdout,
				});
				rl.question('Enter the code from that page here: ', (code) => {
					rl.close();
					this.oAuth2Client.getToken(code, (err, token) => {
						if (err) return console.error('Error retrieving access token', err);
						console.log(token)
						this.oAuth2Client.setCredentials(token);
						// Store the token to disk for later program executions
						fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
							if (err) return console.error(err);
							console.log('Token stored to', TOKEN_PATH);
						});
						resolve(this.oAuth2Client)
					});
				});
			} catch (e) {
				reject(e);
			}
		});
	}
	async _getNewToken() {
		return new Promise((resolve, reject) => {
			try {
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
								this.oAuth2Client.setCredentials(tokens)
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
			} catch (e) {
				reject(e);
			}
		});
	}

// [END refreshClient]

}
module.exports = new RefreshClient();
	
