// https://codedialogue.com/accessing-linkedin-api-with-react-and-node-98932f5c58a2
// https://github.com/imjuoy/SignIn-With-LinkedIn/blob/master/server.js
// https://github.com/matthewshoup/linkedin-oauth2-nodejs-example/blob/master/server.js
// https://github.com/request/request#oauth-signing

// linked in methods (poss)
// https://github.com/auth0/passport-linkedin-oauth2/blob/master/lib/oauth2.js

const axios = require('axios');
const querystring = require('querystring');
const crypto = require("crypto");
const https = require('https');
const request = require('request')

const LinkinClient = require('H:/source/repos/google/google-api/js/LinkedinClient')
class LinkedInAuthService {

  constructor(options) {

    this.config = {
      base_url: 'https://www.linkedin.com/oauth/v2',
      client_id: require('H:/source/repos/google/google-api/js/config/linkedin.config.json').client_id,
      client_secret: require('H:/source/repos/google/google-api/js/config/linkedin.config.json').client_secret,
      redirect_uri: 'http://localhost:3030/linkedin/callback',
      state: crypto.randomBytes(16).toString('hex'),
      scope: 'r_emailaddress r_liteprofile w_member_social'
    }

    this.endpoints = {
      me: '/v2/me'
    }
    
    this.linkedinLoaded = false
    this.access_code = null
    this.authToken = null
    this.authTokenExpiry = null
    this.isAuth = false

    const qsCode = querystring.stringify({
      response_type: "code",
      client_id: this.config.client_id,
      redirect_uri: this.config.redirect_uri,
      state: this.config.state,
      scope: this.config.scope,
      // response_mode: 'form_post'
      // response_mode: 'fragment',
      response_mode: 'web_message',
      prompt: 'none'

    })
    this.authUrl = `${this.config.base_url}/authorization?${qsCode}`

    this.tokenUrl = null
  }

  checkAuth = () => {
    return this.linkedinLoaded
  }

  signIn = (req, res) => {
    return new Promise((resolve, reject) => {
      try {

        console.log(this.authUrl)

        req.get({url: this.authUrl})

        // this is basically same as axios
        // request({
        //   uri: this.authUrl,
        //   method: 'GET',
        //   maxRedirects:3
        // }, function(error, response, body) {
        //     if (!error) {
        //       // console.log(response)
        //       // console.log(response.statusCode)
        //       res.write(`${response.statusCode}`);
        //     } else {
        //       //response.end(error);
        //       res.write(error);
        //     }
        // });

        // req.get({url: this.authUrl, headers: req.headers})
        // req.get(this.authUrl)

      } catch (e) {
        reject(e);
      }
    });    
  }

  signInClient = () => {
    return new Promise((resolve, reject) => {
      try {
        axios
        .get(this.authUrl)
        .then(response => {
          resolve(response);
        }).catch(e => {
          console.error(e)
        });

      } catch (e) {
        reject(e);
      }
    });    
  }

  handshakeAxios = (query) => {
    return new Promise((resolve, reject) => {
      try {
        const error = query.error;
        const error_description = query.error_description;
        const state = query.state;
        const code = query.code;
    
        // handle error
        if (error) {
          console.error(error, error_description)
          next(new Error(error));
        }
    
        // validate state
    
        if (this.config.state !== state) {
          return
        }
  
        this.access_code = code
        console.log(code)
      
        const qsToken = querystring.stringify({
          grant_type: "authorization_code",
          code: this.access_code,
          redirect_uri: this.config.redirect_uri,
          client_id: this.config.client_id,
          client_secret: this.config.client_secret
        })
    
        this.tokenUrl = `${this.config.base_url}/accessToken?${qsToken}`

        console.log(this.tokenUrl)
        // a different way to set access token based on url of callback page
        // https://github.com/auth0-blog/vuejs2-authentication-tutorial/blob/master/utils/auth.js
        axios
          .post(this.tokenUrl)
          .then(response => {
            const status = response.status
            const config = response.config
            const headers = response.headers
            const resRequest = response.request
            const data = response.data
            // console.log(resRequest)
            // console.log(response)
            console.log(data)
            this.authToken = data.access_token
            this.authTokenExpiry = data.expires_in
            this.isAuth = true
            resolve(this.authToken)
          })
      
      } catch (e) {
        reject(e);
      }
    });    
  }

  signOut = () => {
    this.auth.logout()
  }

  queryApi(endpoint){
    return new Promise((resolve, reject) => {
      try {
        const url = `https://api.linkedin.com${endpoint}`
        console.log(url)
        axios.get(url, {
          headers: {
          'x-Requested-With': 'XMLHttpRequest',
          Authorization: 'Bearer ' + this.authToken,
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Expose-Headers': 'Content-Disposition',
          'Connection': 'Keep-Alive'
        },
        responseType:'json',
        withCredentials: true,
        }).then((res) => {
          // console.log(res);
          resolve(res);
        })
      } catch (error) {
        console.error(error); 
        reject(error);
      }
    })
  }

}

module.exports = LinkedInAuthService