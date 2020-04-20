<template>
  <!-- <div v-if="getGapiClientLoaded" class="google-container"> -->
  <div v-if="gapiClient" class="google-container">
    <div class="button-drawer">
      <button ref="signinBtn" class="btn btn-google" @click="gapiClient.signIn()">
        Gapi Sign In
      </button>  
      <button ref="signoutBtn" class="btn btn-google" @click="gapiClient.signOut()">
        Gapi Sign Out
      </button>
      <BaseSelect
        :options="displayOptions"
        v-model="selectedDisplay"
      />
      <BaseSelect
        :options="queryOptions"
        v-model="selectedQuery"
      />
      <button ref="queryBtn" class="btn btn-google" @click="queryAPIs">
        Gapi Query
      </button>
    </div>
    <div v-if="selectedDisplay === 'table'" class="api-table-container">
      <TableComp v-if="items" :items="displayItems" :filter-fields="filterFields" />
    </div>
    <div v-else-if="selectedDisplay === 'json' && items" class="api-json-container">
      <pre v-html="displayItems"></pre>
    </div>
  </div>
</template>

<script>
import TableComp from '@/components/Utils/TableComp'
import { mapGetters, mapActions, mapState } from 'vuex'
import BaseSelect from '@/components/Utils/BaseSelect'
import axios from 'axios'
import GapiClient from '@/utils/GapiClient'

export default {
  name: 'GoogleIn',
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
        {name: 'Calendar List', value: 'calendarList'},
        {name: 'Other Methods', value: 'otherMethods'},
      ],
      selectedQuery: null,
      displayOptions: [
        {name: 'Select Display Type', value: '', disabled: true},
        {name: 'JSON', value: 'json'},
        {name: 'Table', value: 'table'},
      ],
      selectedDisplay: null
    }
  },
  computed: {
    // ...mapState('gapi', ['gapiClient']),
    ...mapGetters('gapi', ['getGapiClient', 'getGapiClientLoaded']),
    displayItems () {
      return this.selectedDisplay === 'table' ?
      this.items
      :
      this.syntaxHighlight(this.items)
    }
  },
  methods: {
    ...mapActions('gapi', ['initClient', 'handleSignOut', 'handleClientLoad']),
    initGoogleAuth () {
      const gapiClient = new GapiClient({})
      console.log(gapiClient)
      gapiClient.initClient().then((gapi) => {
        this.gapiClient = gapiClient
        console.log(this.gapiClient)
      })

      // can load the auth2 and client apis from the cdn at once in colon-separated list
      // window.gapi.load('auth2:client', () => {
      //   const auth2 = this.gapi.auth2.init({
      //     client_id: client_id,
      //     cookiepolicy: 'single_host_origin'
      //   })
      //   auth2.attachClickHandler(this.$refs.signinBtn, {}, googleUser => {
      //     this.$emit('done', googleUser)
      //   }, error => console.log(error))
      // })
    },
    queryAPIs () {
      let func = this[`${this.selectedQuery}`]
      func()
    },
    updateQuery (event) {
      this.selectedQuery = event.target.value
    },
    async getApis () {
      console.log(this.gapiClient)
      const payload = {scope: 'basic', discoveryDocs: 'apis'}
      await this.gapiClient.initQuery(payload) 
      console.log('getting api results')
      const apiRequest = await this.gapiClient.gapi.client.discovery.apis.list()
      this.items = apiRequest.result.items;
    },
    async gmailLabels () {
      console.log(this.gapiClient)
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
    async calendarList () {
      axios.get('http://localhost:3030/calendar').then(res => {
        this.items = res.data.items
        console.log(res)
      })
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
    },
    syntaxHighlight(json) {
      if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
      }
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
        var cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    },
    async doQuery() {
      const token = await window.gapi.auth2.getAuthInstance().grantOfflineAccess()
      console.log(token)
      let mailurl = 'https://www.googleapis.com/gmail/v1/users/me/messages'
      let driveurl = 'https://www.googleapis.com/drive/v3/files'
      axios.get(mailurl, {
        headers: {
        'x-Requested-With': 'XMLHttpRequest',
        Authorization: 'Bearer ' + token.code,
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Expose-Headers': 'Content-Disposition'
      },
      responseType:'json',
      withCredentials: true,
      }).then((res) => {
        console.log(res)
      })
    },
  },
  mounted () {
    this.initGoogleAuth()
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
