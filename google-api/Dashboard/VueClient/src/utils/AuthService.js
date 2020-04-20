import Oidc from 'oidc-client'

/*
**
*
*  options = {
*    authProvider: 'auth0'
*  }
*  options = {
*    authProvider: 'google'
*  }
*
**
*/

class AuthService {
  constructor (options) {

    this._options = {
      authProvider: 'AUTH0'
    }
    this.mgr = null
    this.mgrLoaded = false

    if (typeof options === 'object') {
      this._options = Object.assign(this._options, options)
      this._options.authProvider = options.authProvider.toUpperCase()
    } else {
      console.warn('invalid option type. Object type accepted only')
    }

    // console.log(this._options.authProvider)
    const oidcSettings = JSON.parse(process.env[`VUE_APP_${this._options.authProvider}_OIDC_CONFIG`])
    // console.log(oidcSettings)
    const mgr = new Oidc.UserManager({
      ...oidcSettings,
      filterProtocolClaims: true,
      loadUserInfo: true,
      // automaticSilentSignin: true,    
      userStore: new Oidc.WebStorageStateStore({ store: window.localStorage })
    })

    this.mgr = mgr
    
    // disable logging in production
    Oidc.Log.logger = console
    Oidc.Log.level = Oidc.Log.INFO

  }

  initManager = () => {
    return new Promise((resolve, reject) => {
      try {
        resolve()
      } catch(e) {
        console.error(e)
        console.error('failed to init oidc user manager')
        reject(e)
      }
    })
  }
}


export default AuthService;
