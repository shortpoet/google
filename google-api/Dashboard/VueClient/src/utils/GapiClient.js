
class GapiClient {

  constructor(options) {

    this._options = {}
    this.gapi = null
    this.gapiLoaded = false

    if (typeof options === 'object') {
      this._options = Object.assign(this._options, options)
      // if (options.scope) this._options.scope = state.scopes[`${options.scope}`]
      // if (options.discoveryDocs) this._options.discoveryDocs = state.discoveryDocs[`${options.discoveryDocs}`]
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

  // initClient = () => {
  //   if (this.gapiLoaded) {
  //     return this.gapi
  //   } else {
  //     this.loadScript().then((gapi) => {
  //       this.gapi = gapi
  //       this.gapiLoaded = true
  //       console.log(this.gapi)
  //     })
  //     return this.gapi
  //   }
  // }
}

export default GapiClient