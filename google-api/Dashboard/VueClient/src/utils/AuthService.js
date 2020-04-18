// import { Log, UserManager, WebStorageStateStore } from 'oidc-client'
import { UserManager, WebStorageStateStore } from 'oidc-client'
import AuthUser from './AuthUser'

/**
 * Auth Service. A simpler interface to the Authentication Service and a place to apply an Authorization Service.
 */
export class AuthService {
  /**
     * AuthService constructor
     * @param router React-router-dom instance from props.history
     */
  constructor (tokenExpiredCallback, callbackUrl) {
    this._authentication = new AuthenticationService(
      tokenExpiredCallback,
      callbackUrl
    )
  }

  /**
     * The starting place for a login
     *
     * Danger: This will return an AuthUser or a Promise that redirects. You've been warned!
     *
     * @param {string} [returnPath="/"] URL that the login attempt is coming from, relative to the domain, e.g. `/admin`
     * @returns if not authenticated, redirect to SSO login
     * @returns {AuthUser} if already authenticated, a populated AuthUser
     */
  async login (returnPath) {
    let user = await this.getUser(returnPath)
    // debugger
    if (!user.isAuthenticated) {
      let ssoUser = await this._authentication.login(returnPath)
      if (ssoUser && ssoUser.profile && ssoUser.profile.user_name) {
        // debugger
        user = this.getAuthUserFromSsoUser(ssoUser)
      } else {
        // debugger
        user = new AuthUser()
      }
    }
    return user
  }
  async logout (returnPath) {
    console.log(returnPath)
    console.log('deleting local storage')
    // localStorage.removeItem("oidc.user")
    // this.$router.push(returnPath)
  }
  /**
     * Get a logged in user without the possibility of a forward
     * @returns { AuthUser } An AuthUser, check if isAuthenticated
     */
  async getUser (returnPath) {
    if (await this._authentication.isAuthenticated()) {
      const ssoUser = await this._authentication.getAuthenticatedUser(
        returnPath
      )
      return this.getAuthUserFromSsoUser(ssoUser)
    } else {
      return new AuthUser()
    }
  }

  /**
     * Process the HTTP callback and finish the authentication trip as well as authorization for this app
     * @returns { AuthUser } An AuthUser, likely to be populated if authentication was successful
     */
  async signInCallback () {
    const ssoUser = await this._authentication.signinRedirectCallback()
    return this.getAuthUserFromSsoUser(ssoUser)
  }

  /**
     *
     * @returns { AuthUser } A populated AuthUser
     */
  getAuthUserFromSsoUser (ssoUser) {
    var user = new AuthUser()
    user.id = ssoUser.profile.user_name
    user.email = ssoUser.profile.email
    user.token = ssoUser.id_token
    user.isAuthenticated = !!user.id
    return user
  }

  async getToken () {
    let out = await this._authentication.getExistingToken()
    return out
  }
}
export default AuthService

export class AuthenticationService {
  /**
     * Authentication Service constructor
     * @param {function} tokenExpiredCallback Method to call when the token expires
     */
  constructor (tokenExpiredCallback, callbackUrl) {
    this._tokenExpiredCallback = tokenExpiredCallback
    this._callbackUrl = callbackUrl
  }

  async getUserManager (returnPath) {
    let returnTo = returnPath || '/'
    let clientRoot = window.location.protocol + '//' + window.location.host

    if (!this._oidcSettings) {
      let ssoData = this.getSsoEnvironment()
      console.log(this._callbackUrl)
      let settings = {
        authority: ssoData.clientUrl,
        client_id: ssoData.clientId,
        // redirect_uri: `${clientRoot}${
        //   this._callbackUrl
        // }?returnTo=${encodeURIComponent(returnTo)}`,
        // redirect_uri: `${clientRoot}/`,
        redirect_uri: `${this._callbackUrl}/`,
        post_logout_redirect_uri: `${clientRoot}/`,
        // silent_redirect_uri: `${clientRoot}/`,
        response_type: 'token id_token',
        scope: 'openid profile email',
        userStore: new WebStorageStateStore({ store: window.localStorage }),
        filterProtocolClaims: true,
        audience: ssoData.clientId,
        metadata: {
          issuer: ssoData.clientUrl + '/',
          authorization_endpoint: ssoData.clientUrl + '/authorize',
          userinfo_endpoint: ssoData.clientUrl + '/userinfo',
          end_session_endpoint: ssoData.clientUrl + '/v2/logout',
          jwks_uri: ssoData.clientUrl + '/.well-known/jwks.json'
        }      
      }
      this._oidcSettings = settings
    }

    // reset the returnTo attribute because if it gets cached, we get redirected incorrectly
    this._oidcSettings.redirect_uri = `${clientRoot}${
      this._callbackUrl
    }?returnTo=${encodeURIComponent(returnTo)}`
    // this._oidcSettings.redirect_uri = `${clientRoot}/`

    let userManager = new UserManager(this._oidcSettings)
    if (this._tokenExpiredCallback) {
      userManager.events.addAccessTokenExpired(
        this._tokenExpiredCallback
      )
    }
    return userManager
  }

  /**
     * Looks for an existing user (however OIDC-Connect stores it).
     * @returns bool, true if the token exists and is valid
     */
  async isAuthenticated () {
    let oidcUser = await this.getAuthenticatedUser()
    return oidcUser !== null && oidcUser.expired === false
  }

  /**
     * Gets an existing authenticated user, or else a null
     */
  async getAuthenticatedUser (returnPath = '/') {
    console.log('get authenticated user')
    let userManager = await this.getUserManager(returnPath)
    return userManager.getUser()
  }

  /**
     * @returns {object} in the format: `{"clientId":"36-char-uuid","clientUrl":"auth url"}`
     */
  getSsoEnvironment () {
    const AUTH0_CLIENT_ID = require('H:/source/repos/google/google-api/js/config/auth0.config.json').CLIENT_ID
    const AUTH0_DOMAIN  = require('H:/source/repos/google/google-api/js/config/auth0.config.json').AUTH0_DOMAIN
    const GOOGLE_CLIENT_ID = require('H:/source/repos/google/google-api/js/config/oauth2.keys.json').web.auth_uri
    const GOOGLE_DOMAIN  = require('H:/source/repos/google/google-api/js/config/oauth2.keys.json').web.client_id

    return {
      // clientId: GOOGLE_CLIENT_ID,
      // clientUrl: GOOGLE_DOMAIN
      clientId: AUTH0_CLIENT_ID,
      clientUrl: AUTH0_DOMAIN
    }
    
  }

  /**
     * @param returnTo URL that the login attempt is coming returnTo, relative to the domain
     * @returns a Promise, but redirects the browser to the SSO login page.
     */
  async login (returnTo) {
    console.log('login')
    let userManager = await this.getUserManager(returnTo)
    return userManager.signinRedirect()
  }

  /**
     * The OIDC-Client sign-in, in this case "callback" was at the http level as the user is returned from their sign-in
     * @returns {Promise<OidcUser>} a UserManager().getUser() object with tokens and all
     */
  async signinRedirectCallback (returnTo) {
    console.log('sign in redirect call back')
    let userManager = await this.getUserManager(returnTo)
    return userManager.signinRedirectCallback()
  }

  async getExistingToken () {
    let userManager = await this.getUserManager()
    let user = await userManager.getUser()
    return user.id_token
  }
}

window.as = new AuthService()
