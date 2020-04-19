import Oidc from 'oidc-client'

const oidcSettings = JSON.parse(process.env.VUE_APP_AUTH0_OIDC_CONFIG)

var limgr = new Oidc.UserManager({
  ...oidcSettings,
  filterProtocolClaims: true,
  userStore: new Oidc.WebStorageStateStore({ store: window.localStorage })
})

// disable loggin in production
Oidc.Log.logger = console
Oidc.Log.level = Oidc.Log.INFO

console.log(limgr)

export default limgr
