import Oidc from 'oidc-client'

// const CLIENT_ID = require('H:/source/repos/google/google-api/js/config/linkedin.config.jsonjson').client_id
// const CLIENT_SECRET = require('H:/source/repos/google/google-api/js/config/linkedin.config.jsonjson').client_secret
// const CLIENT_DOMAIN = 'GET https://www.linkedin.com/oauth/v2/authorization'


const CLIENT_ID = "612547936959-rq3b6srota57qgb04lqiq836huuuipkv.apps.googleusercontent.com"
// const CLIENT_DOMAIN = "https://accounts.google.com/o/oauth2/auth" // this domain works with node oauth client but not with the general api i guess says cors  doesn't work for the well-known
const CLIENT_DOMAIN = "https://accounts.google.com/"

const REDIRECT = 'http://localhost:8080/callback'

// https://developers.google.com/identity/protocols/oauth2/openid-connect#discovery

var gomgr = new Oidc.UserManager({
  authority: CLIENT_DOMAIN,
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT,
  post_logout_redirect_uri: 'http://localhost:8080/',
  userStore: new Oidc.WebStorageStateStore({ store: window.localStorage }),
  response_type: 'id_token token',
  scope: 'openid profile email',
  filterProtocolClaims: true,  
  metadata: {
    issuer: "https://accounts.google.com",
    authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    end_session_endpoint: 'http://localhost:8080/auth',
    jwks_uri: 'https://www.googleapis.com/oauth2/v3/cert',
    device_authorization_endpoint: "https://oauth2.googleapis.com/device/code",
    token_endpoint: "https://oauth2.googleapis.com/token",
    userinfo_endpoint: "https://openidconnect.googleapis.com/v1/userinfo",
    revocation_endpoint: "https://oauth2.googleapis.com/revoke",
  }

})

// disable loggin in production
Oidc.Log.logger = console
Oidc.Log.level = Oidc.Log.INFO

console.log(gomgr)

export default gomgr
