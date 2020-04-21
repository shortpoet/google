const querystring = require('querystring');
var crypto = require("crypto");
const http = require('http');
const url = require('url');
const opn = require('open');
const destroyer = require('server-destroy');

class LinkedinClient {

  constructor(options) {

    this.config = {
      base_url: 'https://www.linkedin.com/oauth/v2',
      client_id: require('H:/source/repos/google/google-api/js/config/linkedin.config.json').client_id,
      client_secret: require('H:/source/repos/google/google-api/js/config/linkedin.config.json').client_secret,
      redirect_uri: 'http://localhost:3030/linkedin/callback',
      state: crypto.randomBytes(16).toString('hex'),
      scope: 'r_emailaddress r_liteprofile w_member_social'
    }
    
    this.linkedinLoaded = false

    const qsCode = querystring.stringify({
      response_type: "code",
      client_id: this.config.client_id,
      redirect_uri: this.config.redirect_uri,
      state: this.config.state,
      scope: this.config.scope
    })
    this.authUrl = `${this.config.base_url}/authorization?${qsCode}`
  }

  signIn = () => {
    return new Promise((resolve, reject) => {
      try {
        const server = http
          .createServer(async (req, res) => {
            // try {
            //   if (req.url.indexOf('/oauth2callback') > -1) {
            //     const qs = new url.URL(req.url, 'http://localhost:3000')
            //       .searchParams;
            //     res.end(
            //       'Authentication successful! Please return to the console.'
            //     );
            //     server.destroy();
            //     const {tokens} = await this.oAuth2Client.getToken(qs.get('code'));
            //     this.oAuth2Client.credentials = tokens;
            //     fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), (err) => {
            //       if (err) return console.error(err);
            //       console.log('Token stored to', TOKEN_PATH);
            //     });          
            //     resolve(this.oAuth2Client);
            //   }
            // } catch (e) {
            //   reject(e);
            // }
          })
          .listen(3000, () => {
            // open the browser to the authorize url to start the workflow
            console.log(`about to login at:  ${this.authUrl}`)
            opn(this.authUrl, {wait: false}).then(cp => cp.unref());
          });
        destroyer(server);
      } catch (e) {
        reject(e);
      }
    });    
  }


}

module.exports = LinkedinClient