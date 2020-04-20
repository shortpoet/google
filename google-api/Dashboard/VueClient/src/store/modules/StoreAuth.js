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
      userManager: null,
      user: {
        access_token: null,
        id_token: null,
        user: null,
        scopes: null,
        error: null  
      }
    },
    google: {
      userManager: null,
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
    getUserManager: (state) => (authProvider) => {
      return state[`${authProvider}`].userManager
    },
    getIsAuth: (state) => (authProvider) => {
      return !!(state[`${authProvider}`].userManager)
    },
    getOidcIdToken: (state) => (authProvider) => {
      console.log()
      return tokenIsExpired(state[`${authProvider}`].id_token) ? null : state[`${authProvider}`].id_token;
    },
    getOidcIdTokenExp: (state) => (authProvider) => {
      return tokenExp(state[`${authProvider}`].id_token);
    },
    getUser: (state) => (authProvider) => {
      // console.log(state[`${authProvider}`].user.user)
      return state[`${authProvider}`].user.user
    },
    isAuthenticated (state) {
      return state.isAuthenticated
    }
  },
  mutations: {
    [SET_OIDC_AUTH] (state, {authProvider, userManager}) {
      state[`${authProvider}`].userManager = userManager
    },
    [SET_OIDC_AUTH_USER] (state, {authProvider, user}) {
      state[`${authProvider}`].user.id_token = user.id_token
      state[`${authProvider}`].user.access_token = user.access_token
      state[`${authProvider}`].user.user = user.profile
      state[`${authProvider}`].user.scopes = user.scopes
      state[`${authProvider}`].user.error = null
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
    loadOidcAuthService ({ dispatch }, {authProvider, userManager, route}) {
      // commit(SET_OIDC_AUTH, {authProvider, provider})
      dispatch('checkAuth', {authProvider, userManager, route})
    },
    checkAuth ({ state, dispatch }, {authProvider, userManager, route}) {
      // console.log(authProvider)
      // console.log(userManager)
      // console.log(route)
      return new Promise((resolve) => {
        var hasAccess = true
        // this is when installing checkAuth as global route guard
        if (route === state.callbackRoute) {
          resolve(true)
          return
        }
        const getUserPromise = new Promise((resolve, reject) => {
          // console.log(state[`${authProvider}`])
          userManager.getUser().then((user) => {
            console.log('this is the retrieved user')
            console.log(user)
            resolve(user)
          }).catch(err => {
            console.error(err)
            console.info(`no user in auth service: ${authProvider}`)
            resolve(null)
          })
        })
        getUserPromise.then((user) => {
          console.log('this would be the user')
          console.log(user)
          if (user) {
            dispatch('wasAuthenticated', {authProvider, userManager, user})
          }
          else {
            hasAccess = false
            // if (route.meta.protected) {
              dispatch('authenticate', {route, authProvider})
            // }
          }
        })
        resolve(hasAccess)
      })
    },
    wasAuthenticated ({commit, dispatch}, {authProvider, userManager, user}) {
      // console.log(authProvider)
      // console.log(user)
      commit(SET_OIDC_AUTH, {authProvider, userManager})
      dispatch('setUser', authProvider)
    },
    authenticate ({ state, getters, commit, dispatch }, {route, authProvider}) {
      authProvider = authProvider.toLowerCase()
      const mgr = getters.getUserManager(`${authProvider}`)
      return mgr.signinRedirect(route).catch(function (err) {
        console.error('error from authenticate action')
        console.error(err)
      });
    },
    // getUser ({state, dispatch}, provider) {
    //   if(state[`${provider}`].user) {
    //     return state[`${provider}`].user
    //   } else {
    //     dispatch('setUser', provider).then((user) => {
    //       return user
    //     })
    //   }
    // },
    async setUser ({getters, commit}, authProvider) {
      const mgr = getters.getUserManager(`${authProvider}`)
      console.log(mgr)
      const user = await mgr.getUser()
      if (user) {
        // console.log(user)
        commit(SET_OIDC_AUTH_USER, {authProvider: authProvider, user: user})
        return user  
      }
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
