// import axios from 'axios'
import {
  SET_APIs,
  SET_APIs_LOADED,
  SET_GOOGLE_USER,
  SET_GOOGLE_AUTH,
  SET_GAPI_CLIENT,
  SET_GAPI_CLIENT_LOADED
} from '@/store/mutation-types'

// import {
//   endpoints
// } from '@/store/api-endpoints'


export const state = {
  queriedAPIs: [],
  queriedAPIsLoaded: false,
  client_id: require('H:/source/repos/google/google-api/js/config/oauth2.keys.json').web.client_id,
  api_key: require('H:/source/repos/google/google-api/js/config/oauth2.keys.json').web.api_key,
  discoveryDocs: {
    urlShortener: ['https://www.googleapis.com/discovery/v1/apis/urlshortener/v1/rest'],
    apis: ['https://discovery.googleapis.com/$discovery/rest'],
    calendar: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    gmail: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"]
  },
  scopes: {
    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    calendar: 'https://www.googleapis.com/auth/calendar.readonly',
    basic: 'profile email',
    gmail: 'https://www.googleapis.com/auth/gmail.readonly'
  },
  googleUser: null,
  isAuth: false,
  gapiClient: null,
  gapiClientLoaded: false
}

export const getters = {
  getGapiClient: (state) => state.gapiClient,
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
  [SET_GAPI_CLIENT] (state, newState) { state.gapiClient = newState },
  [SET_GAPI_CLIENT_LOADED] (state, newState) { state.gapiClientLoaded = newState }
}

// https://jsfiddle.net/andrisv/nqwdymee/

export const actions = {
  async initClient ({ state, commit }, options) {
    return new Promise((resolve, reject) => {
      console.log(options)
      // TODO map state to local storage to persist on refresh
      // if (!state.gapiClientLoaded) {
      // had to add this to scope the variable througout the 
      // function otherwise it was lost in client.init() call
      this._options = {
        client_id: state.client_id,
        api_key: state.api_key,
        cookiepolicy: 'single_host_origin',
        discoveryDocs: state.discoveryDocs.apis,
        scope: state.scopes.calendar
      }
      if (typeof options === 'object') {
        this._options = Object.assign(this._options, options)
        if (options.scope) this._options.scope = state.scopes[`${options.scope}`]
        if (options.discoveryDocs) this._options.discoveryDocs = state.discoveryDocs[`${options.discoveryDocs}`]
        // if (options.prompt) prompt = options.prompt
        // if (!options.clientId) {
        //   console.warn('clientId is required')
        // }
      } else {
        console.warn('invalid option type. Object type accepted only')
      }    
      console.log('initializing google client')
      // can load the auth2 and client apis from the cdn at once in colon-separated list
      setTimeout(() => {
        window.gapi.load('auth2:client', () => {
          console.log(this._options)
          console.log(this._options.discoveryDocs)
          const auth2 = window.gapi.client.init(this._options).then(() => {
            console.log('client loaded')
            // this.$emit('done', googleUser)
            commit(SET_GAPI_CLIENT, window.gapi)
            console.log(state.gapiClient)
            commit(SET_GAPI_CLIENT_LOADED, true);
            commit(SET_GOOGLE_AUTH, true)
            resolve(state.gapiClient);
          }).catch(err => {
            if (err.error) {
              const error = err.error
              console.error(
                'Failed to initialize gapi: %s (status=%s, code=%s)', error.message, error.status, error.code, err)
              reject(err)
            }      
          })
        })  
      }, 1000);
      // resolve(state.gapiClient);
    // }
    })
  },
  handleSignIn({ state, commit }, event) {
    Promise.resolve(state.gapiClient.auth2.getAuthInstance().signIn())
      .then(googleUser => {
        commit(SET_GOOGLE_USER, googleUser)
        console.log('user signed in')
        console.log(state.googleUser)
        commit(SET_GOOGLE_AUTH, state.gapiClient.auth2.getAuthInstance().isSignedIn.get())
      })
  },
  handleSignOut({ state, commit }, event) {
    Promise.resolve(state.gapiClient.auth2.getAuthInstance().signOut())
      .then(() => {
        console.log('user signed out')
        commit(SET_GOOGLE_AUTH, state.gapiClient.auth2.getAuthInstance().isSignedIn.get())
        commit(SET_GOOGLE_USER, null)
      })
  },
  async queryAPIs ({ commit, dispatch }) {
    dispatch('initClient', {}).then( async() => {
      try {
        // 3. Make the API request.
        const apiRequest = await window.gapi.client.discovery.apis.list();
        const result = JSON.parse(apiRequest.body);
        console.log(result)
        commit(SET_APIs, result.items);
      } catch (err) {
        console.error(err)
        commit(SET_APIs_LOADED, false);
        throw err;
      } finally {
        commit(SET_APIs_LOADED, true);
      }          
    })
  }
}

export default {
  namespaced: true,
  state: state,
  getters: getters,
  mutations: mutations,
  actions: actions
}
