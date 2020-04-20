import Vue from 'vue';
import GapiClient from '@/utils/GapiClient'

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
  googleUser: null,
  isAuth: false,
  gapiClient: null,
  gapiClientLoaded: false
}

export const getters = {
  getGapiClient: (state) => state.gapiClient,
  getGapiClientLoaded: (state) => state.gapiClientLoaded,
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
    console.log('about to init client in storeS')
    const gapiClient = new GapiClient({})
    console.log(gapiClient)
    gapiClient.initClient().then((gapi) => {
      commit(SET_GAPI_CLIENT, gapiClient)
      commit(SET_GAPI_CLIENT_LOADED, gapi.client)
    })  
    // return new Promise((resolve, reject) => {
    // })
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
