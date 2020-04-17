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

Vue.prototype.jquery = jquery;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
