<template>
  <div v-if="gapiClient" class="google-container">
    <div class="button-drawer">
      <button ref="signinBtn" class="btn btn-google">
        Sign In
      </button>  
      <button ref="signoutBtn" class="btn btn-google" @click="handleSignOut">
        Sign Out
      </button>
      <BaseSelect
        :options="queryOptions"
        v-model="selectedQuery"
      />
      <button ref="queryBtn" class="btn btn-google" @click="queryAPIs">
        Query
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
import BaseSelect from '@/components/Utils/BaseSelect'

const keyFile = require('H:/source/repos/google/google-api/js/config/oauth2.keys.json');
const client_id = keyFile.web.client_id;

export default {
  name: 'GoogleYn',
  components: {
    TableComp,
    BaseSelect
  },
  data () {
    return {
      items: null,
      filterFields: ['icons', 'kind'],
      gapiClient: null,
      queryOptions: [
        {name: 'Select Query Type', value: '', disabled: true},
        {name: 'Get APIs', value: 'getApis'},
        {name: 'Gmail Labels', value: 'gmailLabels'},
        {name: 'Gmail Messages', value: 'gmailMessages'},
        {name: 'Other Methods', value: 'otherMethods'},
      ],
      selectedQuery: null
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
    },
    queryAPIs () {
      let func = this[`${this.selectedQuery}`]
      func()
    },
    updateQuery (event) {
      this.selectedQuery = event.target.value
    },
    async getApis () {
      const payload = {scope: 'basic', discoveryDocs: 'apis'}
      await this.gapiClient.initQuery(payload) 
      console.log('getting api results')
      const apiRequest = await this.gapiClient.gapi.client.discovery.apis.list()
      this.items = apiRequest.result.items;
    },
    async gmailLabels () {
      const payload = {scope: 'gmail', discoveryDocs: 'gmail'}
      await this.gapiClient.initQuery(payload) 
      console.log('getting gmail results')
      const apiRequest = await this.gapiClient.gapi.client.gmail.users.labels.list({
        'userId': 'me'
      })
      this.items = apiRequest.result.labels;
      console.log(apiRequest)
    },
    async gmailMessages () {
      const payload = {scope: 'gmail', discoveryDocs: 'gmail'}
      await this.gapiClient.initQuery(payload) 
      console.log('getting gmail results')
      const apiRequest = await this.gapiClient.gapi.client.gmail.users.messages.list({
        'userId': 'me'
      })
      this.items = apiRequest.result.messages;
    },
    async otherMethods () {
      const payload = {scope: 'calendar', discoveryDocs: 'calendar'}
      await this.gapiClient.initQuery(payload) 
      console.log('getting other results')
      // const apiRequest = await this.gapiClient.gapi.client.calendar.events.list({
      //   'calendarId': 'primary',
      //   'timeMin': (new Date()).toISOString(),
      //   'showDeleted': false,
      //   'singleEvents': true,
      //   'maxResults': 10,
      //   'orderBy': 'startTime'
      // })
      const apiRequest = await this.gapiClient.gapi.client.calendar.calendarList.list({
      })

      // this.items = apiRequest.result.items;
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
      this.gapiClient = gapiClient

      console.log(this.gapiClient)
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
