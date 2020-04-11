// import axios from 'axios'
import {
  SET_APIs,
  SET_APIs_LOADED,
  SET_GAPI_CLIENT,
  SET_GAPI_CLIENT_LOADED
} from '@/store/mutation-types'

// import {
//   endpoints
// } from '@/store/api-endpoints'

export const state = {
  queriedAPIs: [],
  queriedAPIsLoaded: false,
  discoveryDocs: {
    urlShortener: ['https://www.googleapis.com/discovery/v1/apis/urlshortener/v1/rest'],
    apis: ['https://discovery.googleapis.com/$discovery/rest']
  },
  gapiClient: null,
  gapiClientLoaded: false
}

export const getters = {
  getAPIs: (state) => state.queriedAPIs,
  getAPIsLoaded: (state) => state.queriedAPIsLoaded
}

export const mutations = {
  [SET_APIs] (state, newState) { state.queriedAPIs = newState },
  [SET_APIs_LOADED] (state, newState) { state.queriedAPIsLoaded = newState },
  [SET_GAPI_CLIENT] (state, newState) { state.gapiClient = newState },
  [SET_GAPI_CLIENT_LOADED] (state, newState) { state.gapiClientLoaded = newState }
}


export const actions = {
  async initClient ({ commit, dispatch, state }, payload) {
    console.log(payload)
    console.log(state.discoveryDocs[`${payload.dDocs}`])
    payload.gapi.load(('client', () => {
      payload.gapi.client.init({
        dicoveryDocs: state.discoveryDocs[`${payload.dDocs}`]
      }).then(response => {
        console.log(response);
        commit(SET_GAPI_CLIENT, payload.gapi.client);
        commit(SET_GAPI_CLIENT_LOADED, true);
        dispatch(this.queryAPIs)
      })
    }))
  },
  async queryURLs ({ commit, state }) {
    try {
      // 3. Make the API request.
      const apiRequest = await state.gapiClient.client.discovery.apis.list();
      const result = JSON.parse(apiRequest.body);
      commit(SET_APIs, result);
      commit(SET_APIs_LOADED, true);
  } catch (err) {
      console.error(err)
      commit(SET_APIs_LOADED, false);
    }
  },
  async queryAPIs ({ commit }, gapi) {
    try {
      console.log(gapi)
      // 3. Make the API request.
      const apiRequest = await state.gapiClient.client.discovery.apis.list();
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
