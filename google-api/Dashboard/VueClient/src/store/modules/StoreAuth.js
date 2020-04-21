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
    getUserLoaded: (state) => (authProvider) => {
      return !!(state[`${authProvider}`].user.user)
    } ,
    getOidcIdToken: (state) => (authProvider) => {
      return tokenIsExpired(state[`${authProvider}`].id_token) ? null : state[`${authProvider}`].user.id_token;
    },
    getOidcIdTokenExp: (state) => (authProvider) => {
      return tokenExp(state[`${authProvider}`].user.id_token);
    },
    getUser: (state) => (authProvider) => {
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
    // TODO rename
    [RESET_USER] (state, authProvider) {
      state[`${authProvider}`].userManager = null
    },
    [CHANGE_USER_LOADED_STATE] (state, loaded) {
      state.userLoaded = loaded
    },
    [CHANGE_USER_ERRORED_STATE] (state, errored) {
      state.userErrored = errored
    }
  },
  actions: {
    logout({getters, dispatch}, {authProvider}) {
      console.log(authProvider)
      const mgr = getters.getUserManager(authProvider)
      mgr.signoutRedirect('/about').then(() => {
        dispatch('removeAuthService', authProvider)
      })
    },
    removeAuthService ({commit}, authProvider) {
      // commit(RESET_USER, authProvider)
    },
    createOidcAuthService ({state}, options) {
      return new AuthService(options).mgr
    },
    loadOidcAuthService ({ commit, dispatch }, {authProvider, userManager, route}) {
      commit(SET_OIDC_AUTH, {authProvider, userManager})
      dispatch('checkAuth', {authProvider, userManager, route})
    },
    checkAuth ({ state, dispatch }, {authProvider, userManager, route}) {
      return new Promise((resolve) => {
        var hasAccess = true
        // this is when installing checkAuth as global route guard
        // need to add beginnin to fullPath i think
        if (route.fullPath === state.callbackRoute) {
          resolve(true)
          return
        }
        const getUserPromise = new Promise((resolve, reject) => {
          userManager.getUser().then((user) => {
              if (user) {
                console.log('about to dispatch was authenticated')
                dispatch('wasAuthenticated', {authProvider, userManager, user})
              }
              else {
                hasAccess = false
                if (route.meta.protected) {
                  dispatch('authenticate', {route, authProvider})
                }
              }    
          }).catch(err => {
            console.error(err)
            console.info(`no user in auth service: ${authProvider}`)
            resolve(null)
          })
        })
        resolve(hasAccess)
      })
    },
    wasAuthenticated ({commit, dispatch}, {authProvider, userManager}) {
      commit(SET_OIDC_AUTH, {authProvider, userManager})
      dispatch('setUser', authProvider)
    },
    authenticate ({ getters }, {route, authProvider}) {
      authProvider = authProvider.toLowerCase()
      const mgr = getters.getUserManager(`${authProvider}`)
      console.log('manager from authenticate')
      // console.log(mgr)
      return mgr.signinRedirect({
        route: route.fullPath,
        // extraTokenParams: {
        //   authProvider: authProvider
        // },
        // extraQueryParams: {
        //   authProvider: authProvider
        // }
      }).catch(function (err) {
        console.error('error from authenticate action')
        console.error(err)
      });
    },
    async setUser ({getters, commit}, authProvider) {
      const mgr = getters.getUserManager(`${authProvider}`)
      // console.log(mgr)
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
