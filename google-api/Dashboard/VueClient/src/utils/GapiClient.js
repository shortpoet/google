


class GapiClient {

  constructor(options) {

    this.optionTypes = {
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
    
    this._options = {}
    this.gapi = null
    this.gapiLoaded = false

    if (typeof options === 'object') {
      this._options = Object.assign(this._options, options)
      this._options.client_id = this.optionTypes.client_id
      this._options.scope = this.optionTypes.scopes.basic      
      this._options.discoveryDocs = this.optionTypes.discoveryDocs.apis      
      if (options.scope) this._options.scope = this.optionTypes.scopes[`${options.scope}`]
      if (options.discoveryDocs) this._options.discoveryDocs = this.optionTypes.discoveryDocs[`${options.discoveryDocs}`]
      // if (options.prompt) prompt = options.prompt
      // if (!options.clientId) {
      //   console.warn('clientId is required')
      // }
    } else {
      console.warn('invalid option type. Object type accepted only')
    }
    
  }

  loadScript = () => {
    return new Promise((resolve, reject) => {  
      try {
        const gapiUrl = 'https://apis.google.com/js/client:plusone:api.js'
        const script = document.createElement('script')
        script.src = gapiUrl
        script.onreadystatechange = script.onload = function () {
          const interval = setInterval(function () {
            if (!script.readyState || /loaded|complete/.test(script.readyState)) {
              clearInterval(interval)
              console.log('gapi.js loaded.')
              resolve(window.gapi)
            }
          }, 500)
        }
        document.getElementsByTagName('head')[0].appendChild(script)  
      } catch(err) {
        console.error(err.message)
        console.error('gapi.js failed to load')
        reject(err.message)
      }
    })
  }

  initClient = () => {
    return new Promise((resolve, reject) => {  
      try {
        if (this.gapiLoaded) {
          resolve(this.gapi) 
        } else {
          this.loadScript().then((gapi) => {
            this.gapi = gapi
            this.gapiLoaded = true
            resolve(this.gapi)
          })
        } 
      }
      catch(err) {
        console.error(err.message)
        console.error('gapi.js failed to load')
        reject(err.message)
      }
    })
  }

  initQuery = ({discoveryDocs, scope}) => {
    return new Promise((resolve, reject) => {  
      try {
        this.gapi.load('client', async ()=>{
          await this.gapi.client.init({
            discoveryDocs: this.optionTypes.discoveryDocs[`${discoveryDocs}`],
            scope: this.optionTypes.scopes[`${scope}`],
            client_id: this.optionTypes.client_id
          })
          // this wasn't working when I was resolving outside the load block
          resolve(this.gapi)
        })
      }
      catch(err) {
        console.error(err.message)
        console.error('gapi.js failed to load')
        reject(err.message)
      }
    })
  }
}

export default GapiClient