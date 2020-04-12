// import axios from 'axios'
import {
  SET_APIs,
  SET_APIs_LOADED,
  SET_GOOGLE_USER,
  SET_GOOGLE_AUTH,
  SET_GAPI_CLIENT_LOADED
} from '@/store/mutation-types'

// import {
//   endpoints
// } from '@/store/api-endpoints'


export const state = {
  queriedAPIs: [],
  queriedAPIsLoaded: false,
  client_id: require('H:/source/repos/google/google-api/js/config/oauth2.keys.json').web.client_id,
  discoveryDocs: {
    urlShortener: ['https://www.googleapis.com/discovery/v1/apis/urlshortener/v1/rest'],
    apis: ['https://discovery.googleapis.com/$discovery/rest'],
    calendar: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
  },
  scopes: {
    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    calendar: 'https://www.googleapis.com/auth/calendar.readonly'
  },
  googleUser: null,
  isAuth: false,
  gapi: null,
  gapiClientLoaded: false
}

export const getters = {
  getAPIs: (state) => state.queriedAPIs,
  getAPIsLoaded: (state) => state.queriedAPIsLoaded,
  getgoogleUser: (state) => state.googleUser,
  getisAuth: (state) => state.isAuth,
}

export const mutations = {
  [SET_APIs] (state, newState) { state.queriedAPIs = newState },
  [SET_APIs_LOADED] (state, newState) { state.queriedAPIsLoaded = newState },
  [SET_GOOGLE_USER] (state, newState) { state.googleUser = newState },
  [SET_GOOGLE_AUTH] (state, newState) { state.isAuth = newState },
  [SET_GAPI_CLIENT_LOADED] (state, newState) { window.gapiClientLoaded = newState }
}

// https://jsfiddle.net/andrisv/nqwdymee/

export const actions = {
  async loadGoogleClient ({ state, commit }, payload) {
    console.log('loading google client')
    // can load the auth2 and client apis from the cdn at once in colon-separated list
    window.gapi.load('auth2:client', () => {
      const auth2 = window.gapi.client.init({
        client_id: state.client_id,
        cookiepolicy: 'single_host_origin'
      })
      auth2.attachClickHandler(payload, {}, googleUser => {
        // this.$emit('done', googleUser)
        commit(SET_GOOGLE_USER, googleUser)
        commit(SET_GOOGLE_AUTH, true)
        console.log(state.googleUser)
      }, error => console.log(error));
    })
  },
  handleSignOut({ state, commit }, event) {
    Promise.resolve(window.gapi.auth2.getAuthInstance().signOut())
      .then(() => {
        commit(SET_GOOGLE_USER, null)
        commit(SET_GOOGLE_AUTH, false)
      })
  },
  async handleClientLoad ({ commit, dispatch, state }, payload) {
    console.log(payload)
    console.log(state.discoveryDocs[`${payload.dDocs}`])
    console.log(window.gapi)
    window.gapi.load('client', dispatch('initClient', payload)).then(() => {
      console.log(window.gapi.client)
      console.log(window.gapi.auth2.getAuthInstance())
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(state.isAuth);
      commit(SET_GAPI_CLIENT_LOADED, true);
      dispatch(payload.action)
    })
  },
  async initClient ({ commit, dispatch, state }, payload) {
    await window.gapi.client.init({
      dicoveryDocs: state.discoveryDocs[`${payload.dDocs}`],
      scope: payload.scope ? state.discoveryDocs[`${payload.scope}`] : null
    })
  },
  async queryAPIs ({ commit, state }) {
    try {
      // 3. Make the API request.
      const apiRequest = await window.gapi.client.discovery.apis.list();
      const result = JSON.parse(apiRequest.body);
      commit(SET_APIs, result);
    } catch (err) {
      console.error(err)
      commit(SET_APIs_LOADED, false);
      throw err;
    } finally {
      // commit(SET_APIs_LOADED, true);
    }
},
  async queryURLs ({ commit }, event) {
    try {
      console.log(event)
      // 3. Make the API request.
      console.log(window.gapi)
      const apiRequest = await window.gapi.client.discovery.apis.list();
      const result = JSON.parse(apiRequest.body);
      commit(SET_APIs, result);
      commit(SET_APIs_LOADED, true);
  } catch (err) {
      console.error(err)
      commit(SET_APIs_LOADED, false);
    }
  }
}

export default {
  namespaced: true,
  state: state,
  getters: getters,
  mutations: mutations,
  actions: actions
}
