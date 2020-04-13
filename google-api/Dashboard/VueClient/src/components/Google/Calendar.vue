<template>
  <div class="item-container" v-if="items">
    <pre v-html="items"></pre>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'Calendar',
  data () {
    return {
      items: null,
      sample: require('./sample_calendar.js').default
    }
  },
  props: {
    // items: {
    //   type: Array
    // }
  },
  computed: {
    ...mapGetters('google', ['getGapiClient']),
  },
  methods: {
    ...mapActions('google', ['initClient']),
    getData(gapiClient) {
      let vm = this;
      console.log('getting calendar data')
      console.log(gapiClient)
      console.log(vm.getGapiClient)

      gapiClient.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
      })
      // gapiClient.client.calendar.calendarList.list({
      // })
      .then(response => {
        console.log(response)
        vm.items = this.syntaxHighlight(response.result.items);
        console.log(vm.items);
      })
      .catch(err => {
          if (err.error) {
            const error = err.error
            console.error(
              'Failed to initialize gapi: %s (status=%s, code=%s)', error.message, error.status, error.code, err)
          }      
        });
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
    }
  },
  mounted() {
    this.initClient({scope: 'calendar', discoveryDocs: 'calendar'}).then((gapiClient) => {
      this.getData(gapiClient);
    })
    // console.log(this.sample)
    // this.items = this.syntaxHighlight(this.sample)
    // console.log(this.items)
  }
}
</script>

<style>
body {
  font-family: "Open Sans", sans-serif;
  font-size: 14px;
  font-weight: 300;
  line-height: 1em;
}

.authentification {
  margin: 20px;
  text-align: center;
}

hr {
  border: 1px solid black;
  margin: 30px;
}

pre {
  outline: 1px solid #ccc;
  padding: 5px;
  margin: 5px;
  overflow-x: auto;
}

.string {
  color: green;
}

.number {
  color: purple;
}

.boolean {
  color: blue;
}

.null {
  color: magenta;
}

.key {
  color: black;
}

</style>