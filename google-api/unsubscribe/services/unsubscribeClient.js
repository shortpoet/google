'use strict';

const axios = require('axios');

class UnsubscribeClient {
  constructor(options) {
    this._options = options || {url: 'en.wikipedia.com'};
  }
  async getData() {
    try {
      const response = await axios.get(this._options.url);
      const data = response.data;
      return data
    } catch (e) {
      console.log(e);
    }
  }
}
module.exports = UnsubscribeClient;
