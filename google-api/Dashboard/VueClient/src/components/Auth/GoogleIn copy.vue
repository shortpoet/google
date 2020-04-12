<template>
  <div class="google-container">
    <div class="button-drawer">
      <button ref="signinBtn" class="btn btn-google">
        Sign In
      </button>  
      <button ref="signoutBtn" class="btn btn-google" @click="handleSignOut">
        Sign Out
      </button>  
      <button ref="queryBtn" class="btn btn-google" @click="handleClientLoad(payload)">
        Query
      </button>
      <button ref="queryBtn" class="btn btn-google" @click="_handleClientLoad">
        Query Orig
      </button>
    </div>
    <div class="api-table-container">
      <TableComp v-if="items" :items="items" :filter-fields="filterFields" />
    </div>
  </div>
</template>

<script>
import TableComp from '@/components/Utils/TableComp'
import { mapGetters, mapActions } from 'vuex'
import store from '@/store'

const keyFile = require('H:/source/repos/google/google-api/js/config/oauth2.keys.json');
const client_id = keyFile.web.client_id;

export default {
  name: 'GoogleIn',
  components: {
    TableComp
  },
  data () {
    return {
      items: null,
      filterFields: ['icons', 'kind']
    }
  },
  computed: {
    ...mapGetters('google', ['getAPIsLoaded', 'getAPIs']),
  },
  beforeRouteEnter (to, from, next) {
    // store.dispatch('google/loadGoogleClient', ).then(() => {
    //   next()
    // })
    next(vm => {
      // vm.$store.dispatch('google/loadGoogleClient', vm.$refs.signinBtn).then(() => {
      //   next()
      // })
    })
},
  methods: {
    ...mapActions('google', ['initClient', 'handleSignOut', 'handleClientLoad']),
    queryAPIs () {
      const payload = {
        dDocs: 'apis',
        action: 'queryAPIs'
      }
      this.initClient(payload)
    },
    _handleClientLoad() {
      window.gapi.load('client', this.clientInit);
    },
    async clientInit () {
      await window.gapi.client.init({
        discoveryDocs: ['https://discovery.googleapis.com/$discovery/rest']
      })
      this.getResults()
    },
    async getResults () {
      const apiRequest = await window.gapi.client.discovery.apis.list();
      const result = JSON.parse(apiRequest.body);
      console.log(result);
      this.items = result.items;
    },
    ...mapActions('google', ['initClient']),
    handleClientLoad() {
      window.gapi.load('client', this.clientInit);
    },
    async clientInit () {
      await window.gapi.client.init({
        discoveryDocs: ['https://discovery.googleapis.com/$discovery/rest']
      })
      this.getResults()
    },
    async getResults () {
      const apiRequest = await window.gapi.client.discovery.apis.list();
      const result = JSON.parse(apiRequest.body);
      console.log(result);
      this.items = result.items;
    },
    _initClient () {
      this.initClient({gapi: window.gapi, dDocs: 'apis'})
    },
    initGoogleAuth () {
      // can load the auth2 and client apis from the cdn at once in colon-separated list
      window.gapi.load('auth2:client', () => {
        const auth2 = this.gapi.auth2.init({
          client_id: client_id,
          cookiepolicy: 'single_host_origin'
        })
        auth2.attachClickHandler(this.$refs.signinBtn, {}, googleUser => {
          this.$emit('done', googleUser)
        }, error => console.log(error))
      })
    }
  },
  mounted () {
    this.$store.dispatch('google/loadGoogleClient', this.$refs.signinBtn).then(() => {
      console.log('sign in button inititated')
    })
    // this.initGoogleAuth();
    if (this.getAPIsLoaded) {
      console.log(this.getAPIs)
    }
  }  
}
</script>

<style lang="scss">

.google-container {
  display: flex;
  flex-direction: column;
}

.button-drawer {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: center;
}

.btn-google {
  background-color: #42b983 !important;
  // font: 16px/22px Roboto;
  margin: .5rem;
  // border: 1px solid #ccc;
  display: inline-block;
  cursor: pointer;
}

.api-table-container {
  margin: 1rem 1rem 1rem 1rem;
  // so that responsive container doesn't shift around too much
  min-height: 25rem;
  th {
    font-size: .70rem;
  }
  td {
    font-size: .65rem;
  }
}

</style>
