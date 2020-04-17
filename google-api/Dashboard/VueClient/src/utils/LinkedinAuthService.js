import Oidc from 'oidc-client'

// const CLIENT_ID = require('H:/source/repos/google/google-api/js/config/linkedin.config.jsonjson').client_id
// const CLIENT_SECRET = require('H:/source/repos/google/google-api/js/config/linkedin.config.jsonjson').client_secret
// const CLIENT_DOMAIN = 'GET https://www.linkedin.com/oauth/v2/authorization'


const CLIENT_ID = 'BaXDXqmp6XX6U9UuHSC5dmrnJt6gSlJh'
const CLIENT_DOMAIN = 'shortpoet.auth0.com/'

const REDIRECT = 'http://localhost:8080/callback.html'
// const SCOPE = 'openid profile email battles-api'
const AUDIENCE = 'http://localhost:3030'
const AUTH0_DOMAIN = 'https://shortpoet.auth0.com'

var mgr = new Oidc.UserManager({
  authority: AUTH0_DOMAIN,
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT,
  post_logout_redirect_uri: 'http://localhost:8080/',
  userStore: new Oidc.WebStorageStateStore({ store: window.localStorage }),
  response_type: 'id_token token',
  scope: 'openid profile email',
  filterProtocolClaims: true,
  audience: 'BaXDXqmp6XX6U9UuHSC5dmrnJt6gSlJh',
  metadata: {
    issuer: AUTH0_DOMAIN + '/',
    authorization_endpoint: AUTH0_DOMAIN + '/authorize',
    userinfo_endpoint: AUTH0_DOMAIN + '/userinfo',
    end_session_endpoint: AUTH0_DOMAIN + '/v2/logout',
    jwks_uri: AUTH0_DOMAIN + '/.well-known/jwks.json'
  }

})

// disable loggin in production
Oidc.Log.logger = console
Oidc.Log.level = Oidc.Log.INFO

console.log(mgr)

export default mgr
