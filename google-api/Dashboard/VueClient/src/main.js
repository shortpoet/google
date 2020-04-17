import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import jquery from 'jquery'

import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);
require('bootstrap')

require('bootstrap/dist/css/bootstrap.css')

Vue.config.productionTip = false

// Vue.prototype.gapi = window.gapi;

// import the plugin
// import VueGAPI from "vue-gapi";
// import GAuth from 'vue-google-oauth2'

// create the 'options' object

const options = {
  client_id: require('H:/source/repos/google/google-api/js/config/oauth2.keys.json').web.client_id,
  api_key: require('H:/source/repos/google/google-api/js/config/oauth2.keys.json').web.api_key,
  discoveryDocs: {
    urlShortener: ['https://www.googleapis.com/discovery/v1/apis/urlshortener/v1/rest'],
    apis: ['https://discovery.googleapis.com/$discovery/rest'],
    apisNew: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    calendar: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    gmail: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
    drive: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
  },
  scopes: {
    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    calendar: 'https://www.googleapis.com/auth/calendar.readonly',
    basic: 'profile email',
    gmail: 'https://www.googleapis.com/auth/gmail.readonly',
    sheets: "https://www.googleapis.com/auth/spreadsheets",
    drive: 'https://www.googleapis.com/auth/drive'
  }
}

const apiConfig = {
  // apiKey: options.api_key,
  clientId: options.client_id,
  discoveryDocs: options.discoveryDocs.apis,
  scope: options.scopes.basic
  // see all available scopes here: https://developers.google.com/identity/protocols/googlescopes'
};
const gauthOption = {
  clientId: options.client_id,
  scope: options.scopes.basic,
  prompt: 'select_account',
  // discoveryDocs: options.discoveryDocs.gmail
}
// Use the plugin and pass along the configuration
// Vue.use(VueGAPI, apiConfig);
// Vue.use(GAuth, gauthOption);

Vue.prototype.jquery = jquery;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

export default apiConfig;