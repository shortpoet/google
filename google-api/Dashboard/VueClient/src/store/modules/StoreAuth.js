import axios from 'axios'
import AuthUser from '@/auth/AuthUser'

import {
  LOAD_HEADERS,
  CHANGE_HEADERS_LOADED_STATE,
  CHANGE_HEADERS_ERRORED_STATE,
  SET_USER,
  SET_AUTH_STATE,
  RESET_USER,
  CHANGE_USER_LOADED_STATE,
  CHANGE_USER_ERRORED_STATE
} from '@/store/mutation-types'

import {
  endpoints
} from '@/store/api-endpoints'

export default {
  namespaced: true,
  state: {
    headersLoaded: false,
    headersErrored: false,
    headers: [],
    headerModules: [],
    user: new AuthUser(),
    isAuthenticated: false,
    userLoaded: false,
    userErrored: false
  },
  getters: {
    getHeadersLoaded (state) {
      console.log(state.headersLoaded)
      return state.headersLoaded
    },
    getHeadersErrored (state) {
      return state.headersErrored
    },
    getHeaders (state) {
      return state.headers
    },
    getUser (state) {
      return state.user
    },
    isAuthenticated (state) {
      return state.isAuthenticated
    }
  },
  mutations: {
    [LOAD_HEADERS] (state, headers) {
      state.headers = headers
    },
    [CHANGE_HEADERS_LOADED_STATE] (state, loaded) {
      state.headersLoaded = loaded
    },
    [CHANGE_HEADERS_ERRORED_STATE] (state, errored) {
      state.headersErrored = errored
    },
    [SET_USER] (state, newUser) {
      state.user = newUser
    },
    [SET_AUTH_STATE] (state, newState) {
      state.isAuthenticated = newState
    },
    [RESET_USER] (state, newUser) {
      state.user = new AuthUser()
    },
    [CHANGE_USER_LOADED_STATE] (state, loaded) {
      state.userLoaded = loaded
    },
    [CHANGE_USER_ERRORED_STATE] (state, errored) {
      state.userErrored = errored
    }
  },
  actions: {
    loadUser ({ commit, state, getters, rootGetters }, user) {
      console.log('#### loading USER data from action ####')
      console.log(user)
      var url = endpoints.auth.BOEING_USER_API + user.bemsId
      console.log(url)
      axios
        .get(url)
        .then(function (response) {
          console.log(response)
          var profile = response.data.resultholder.profiles.profileholder.user
          user.name = profile.firstName + ' ' + profile.lastName
          user.insitepic = `https://insite.web.boeing.com/culture/i/me/${user.bemsId}`
          commit(SET_USER, user)
        })
        .catch(function (error) {
          console.log(error)
          commit(CHANGE_USER_ERRORED_STATE, true)
        })
        .finally(function () {
          console.log('user data finally')
          console.log(getters.getUser)
          commit(CHANGE_USER_LOADED_STATE, true)
          commit(SET_AUTH_STATE, getters.getUser.isAuthenticated)
        })
    },
    loadHeaderData ({ commit, state, getters, rootGetters }) {
      console.log('#### loading HEADER data from action ####')
      axios
        .get(rootGetters.getUrlPrefix + endpoints.auth.HEADERS_API)
        .then(function (response) {
          console.log(response)
          commit(LOAD_HEADERS, response.data)
        })
        .catch(function (error) {
          console.log(error)
          commit(CHANGE_HEADERS_ERRORED_STATE, true)
        })
        .finally(function () {
          console.log('headers finally')
          commit(CHANGE_HEADERS_LOADED_STATE, true)
          console.log(getters.getHeaders)
        })
    }
  }
}
