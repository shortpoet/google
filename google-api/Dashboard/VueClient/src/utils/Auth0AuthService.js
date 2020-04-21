import Oidc from 'oidc-client'

const oidcSettings = JSON.parse(process.env.VUE_APP_AUTH0_OIDC_CONFIG)

var a0mgr = new Oidc.UserManager({
  ...oidcSettings,
  filterProtocolClaims: true,
  userStore: new Oidc.WebStorageStateStore({ store: window.localStorage })
})

// disable loggin in production
Oidc.Log.logger = console
Oidc.Log.level = Oidc.Log.INFO

console.log(a0mgr)

export default a0mgr
