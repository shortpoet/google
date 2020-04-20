import axios from 'axios'
import AuthService from '@/utils/AuthService'

import {
  SET_OIDC_AUTH,
  SET_OIDC_AUTH_USER,
  SET_USER,
  RESET_USER,
  CHANGE_USER_LOADED_STATE,
  CHANGE_USER_ERRORED_STATE
} from '@/store/mutation-types'

// import {
//   endpoints
// } from '@/store/api-endpoints'
var parseJwt = function parseJwt(token) {
  try {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    return {};
  }
};
var tokenExp = function tokenExp(token) {
  if (token) {
    var parsed = parseJwt(token);
    return parsed.exp ? parsed.exp * 1000 : null;
  }

  return null;
};
var tokenIsExpired = function tokenIsExpired(token) {
  var tokenExpiryTime = tokenExp(token);

  if (tokenExpiryTime) {
    return tokenExpiryTime < new Date().getTime();
  }

  return false;
};


export default {
  namespaced: true,
  state: {
    callbackRoute: '/callback',
    auth0: {
      auth: null,
      user: {
        access_token: null,
        id_token: null,
        user: null,
        scopes: null,
        error: null  
      }
    },
    google: {
      auth: null,
      user: {
        access_token: null,
        id_token: null,
        user: null,
        scopes: null,
        error: null  
      }
    }
  },
  getters: {
    getAuthService: (state) => (type) => {
      return state[`${type}`].auth
    },
    getIsAuth: (state) => (type) => {
      return !!(state[`${type}`].auth)
    },
    getOidcIdToken: (state) => (type) => {
      return tokenIsExpired(state[`${type}`].id_token) ? null : state[`${type}`].id_token;
    },
    getOidcIdTokenExp: (state) => (type) => {
      return tokenExp(state[`${type}`].id_token);
    },
    // getUser: (state) => (type) => {
    //   return state[`${type}`].user.user
    // },
    isAuthenticated (state) {
      return state.isAuthenticated
    }
  },
  mutations: {
    [SET_OIDC_AUTH] (state, {type, provider}) {
      state[`${type}`].auth = provider
    },
    [SET_OIDC_AUTH_USER] (state, {provider, user}) {
      state[`${provider}`].id_token = user.id_token
      state[`${provider}`].access_token = user.access_token
      state[`${provider}`].user = user.profile
      state[`${provider}`].scopes = user.scopes
      state[`${provider}`].error = null
    },
    [SET_USER] (state, newUser) {
      state.user = newUser
    },
    [RESET_USER] (state) {
      state.user = null
    },
    [CHANGE_USER_LOADED_STATE] (state, loaded) {
      state.userLoaded = loaded
    },
    [CHANGE_USER_ERRORED_STATE] (state, errored) {
      state.userErrored = errored
    }
  },
  actions: {
    createOidcAuthService ({state}, options) {
      return new AuthService(options).mgr
    },
    loadOidcAuthService ({ commit, getters }, {type, provider}) {
      commit(SET_OIDC_AUTH, {type, provider})
    },
    checkAuth ({ state, dispatch }, {route, provider}) {
      return new Promise((resolve) => {
        var hasAccess = true
        // this is when installing checkAuth as global route guard
        if (route === state.callbackRoute) {
          resolve(true)
          return
        }
        const getUserPromise = new Promise((resolve, reject) => {
          state[`${provider}`].getUser.then((user) => {
            resolve(user)
          }).catch(err => {
            console.error(err)
            console.info(`no user in auth service: ${provider}`)
            resolve(null)
          })
        })
        getUserPromise.then((user) => {
          if (user) {
            dispatch('wasAuthenticated', {provider, user})
          }
          else {
            hasAccess = false
            if (route.meta.protected) {
              dispatch('authenticate', {route, provider})
            }
          }
        })
        resolve(hasAccess)
      })
    },
    wasAuthenticated ({commit}, {provider, user}) {
      commit(SET_OIDC_AUTH, {provider, user})
    },
    authenticate ({ state, getters, commit, dispatch }, {route, provider}) {
      provider = provider.toLowerCase()
      const mgr = getters.getAuthService(`${provider}`)
      return mgr.signinRedirect(route).catch(function (err) {
        console.error('error from authenticate action')
        console.error(err)
      });
    },
    getUser ({getters, dispatch}, provider) {
      const mgr = getters.getAuthService(`${provider}`)
      if(mgr.user) {
        return mgr.user
      } else {
        dispatch('setUser', provider).then((user) => {
          return user
        })
      }
    },
    async setUser ({getters, commit}, provider) {
      const mgr = getters.getAuthService(`${provider}`)
      console.log(mgr)
      const user = await mgr.getUser()
      console.log(user)
      commit(SET_OIDC_AUTH_USER, {provider: provider, user: user})
      return user
    },
    callApi ({ commit, state, getters, rootGetters }, url) {
      console.log('#### loading API data from action ####')
      axios
        .get(url)
        .then(function (response) {
          console.log(response)
          // commit(SET_USER, user)
        })
        .catch(function (error) {
          console.log(error)
          // commit(CHANGE_USER_ERRORED_STATE, true)
        })
        .finally(function () {
          console.log('user data finally')
          console.log(getters.getUser)
          // commit(CHANGE_USER_LOADED_STATE, true)
          // commit(SET_AUTH_STATE, getters.getUser.isAuthenticated)
        })
    }
  }
}
