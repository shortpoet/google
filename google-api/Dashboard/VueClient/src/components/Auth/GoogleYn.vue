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
import apiConfig from '@/main.js'
import TableComp from '@/components/Utils/TableComp'
import { mapGetters, mapActions } from 'vuex'
import store from '@/store'
import GapiClient from '@/utils/GapiClient'

const keyFile = require('H:/source/repos/google/google-api/js/config/oauth2.keys.json');
const client_id = keyFile.web.client_id;

export default {
  name: 'GoogleYn',
  components: {
    TableComp
  },
  data () {
    return {
      items: null,
      filterFields: ['icons', 'kind'],
      gapi: null
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
      this.gapi.load('client', this.clientInit);
    },
    async clientInit () {
      // await window.gapi.client.init({
      //   discoveryDocs: ['https://discovery.googleapis.com/$discovery/rest']
      // })
      console.log(apiConfig)
      // removed the awaitnd this now works (again) pfffff
      await this.gapi.client.init(apiConfig)
      this.getResults()
    },
    async getResults () {
      console.log('getting results')
      const apiRequest = await window.gapi.client.discovery.apis.list();
      // const apiRequest = await window.gapi.client.gmail.users.labels.list({
      //   'userId': 'me'
      // })
      // const apiRequest = await window.gapi.client.gmail.users.messages.list({
      //   'userId': 'me'
      // })
      // console.log(window.gapi)
      // const apiRequest = await window.gapi.client.calendar.events.list({
      //   'calendarId': 'primary',
      //   'timeMin': (new Date()).toISOString(),
      //   'showDeleted': false,
      //   'singleEvents': true,
      //   'maxResults': 10,
      //   'orderBy': 'startTime'
      // })
      // const apiRequest = await window.gapi.client.sheets.spreadsheets.values.get({
      //     spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      //     range: 'Class Data!A2:E',
      //   })
      // let query = "properties has {key='uds' and value='true'} and trashed=false" // and properties has {key='finished' and value='true'}
      // console.log(window.gapi)
      // const apiRequest = await window.gapi.client.drive.files.list({
      //   // q: query,
      //   pageSize: 20,
      //   // fields: 'nextPageToken, files(id, name, properties, mimeType, createdTime)'
      // })
      // const apiRequest = await window.gapi.client.request({
      //   'path': '/drive/v3/files',
      //   'method': 'GET'
      //   });

      // const result = JSON.parse(apiRequest.body);
      console.log(apiRequest);
      // this.items = result.items;
    },
    ...mapActions('google', ['initClient']),
    handleClientLoad() {
      window.gapi.load('client', this.clientInit);
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
    // this.$store.dispatch('google/loadGoogleClient', this.$refs.signinBtn).then(() => {
    //   console.log('sign in button inititated')
    // })
    // this.initGoogleAuth();
    const gapiClient = new GapiClient({})
    console.log(gapiClient)
    gapiClient.initClient().then((gapi) => {
      this.gapi = gapi
      console.log(this.gapi)
    })
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
