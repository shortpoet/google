const express = require('express');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
const bodyParser = require('body-parser');
// const fs = require('fs');
// const events = require('./db/events.json');
// const unsubscribe = require('./../../js/unsubscribe/unsubscribe');
const refreshClient = require('./../../js/refreshClient');
const app = express();
const calendar = require('./../../js/samples/calendar');
const LinkedInAuthService = require('./src/utils/LinkedinAuthService')
const util = require('util');
const request = require('request');
const querystring = require('querystring');
const axios = require('axios')

var cors = require('cors');
const opn = require('open');

app.use(cors());

/*
* log override for stack trace
* https://stackoverflow.com/questions/45395369/how-to-get-console-log-line-numbers-shown-in-nodejs
*/

['log', 'warn', 'error'].forEach((methodName) => {
  const originalMethod = console[methodName];
  console[methodName] = (...args) => {
    let initiator = 'unknown place';
    try {
      throw new Error();
    } catch (e) {
      if (typeof e.stack === 'string') {
        let isFirst = true;
        for (const line of e.stack.split('\n')) {
          const matches = line.match(/^\s+at\s+(.*)/);
          if (matches) {
            if (!isFirst) { // first line - current function
                            // second line - caller (what we are looking for)
              initiator = matches[1];
              break;
            }
            isFirst = false;
          }
        }
      }
    }
    originalMethod.apply(console, [...args, '\n', `  at ${initiator}`]);
  };
});


// app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API.'
  })
})

// app.get('/dashboard', verifyToken, (req, res) => {
//   jwt.verify(req.token, 'the_secret_key', err => {
//     if (err) {
//       res.sendStatus(401)
//     } else {
//       res.json({
//         events: events
//       })
//     }
//   })
// })

app.get('/login', (req, res) => {
  refreshClient.authenticate();
})


app.get('/calendar', async (req, res) => {
  try {
    const data = await calendar.runSampleExternal();
    res.json(data);
  } catch (e) {
    console.log(e);
  }
})

const linkedInAuthService = new LinkedInAuthService();

app.get('/linkedin/login', (req, res) => {

  console.log(`about to login at:  ${linkedInAuthService.authUrl}`)

  // this has cors failure
  // res.redirect(linkedInAuthService.authUrl)

  // this seems to just be a basic get
  res.writeHead(301, {"Location": linkedInAuthService.authUrl})


  // linkedInAuthService.signIn(req, res).then(x => {
  //   console.log(x)
  // })

  // this seems to trigger itself automatically
  // req.get({url: `${this.authUrl}`, headers: req.headers})
  // request.get(`${linkedInAuthService.authUrl}`)

  // this works just once // not anymore after req.get started failing WTF lol
  opn(linkedInAuthService.authUrl, {wait: false})

  // this gets the html with a button to login
  // linkedInAuthService.signInClient()
  //   .then(loginRes => {
  //     const headers = loginRes.headers
  //     const data = loginRes.data
  //     const query = loginRes.query
  //     const payload = { query: query, headers: headers, data: data }
  //     console.log(payload)
  //     res.json(payload)
  //   })

})
app.get('/linkedin/callback', (req, res) => {
  // res.json({
  //   query: req.query
  // })
  linkedInAuthService.handshakeAxios(req.query).then(code => {
    console.log(code)
    res.json(code)
  })
})

app.get('/linkedin/me', (req, res) => {
  linkedInAuthService.queryApi(linkedInAuthService.endpoints.me)
  .then(response => {
    // console.log(response)
    res.json(response.data)
  })
})

// MIDDLEWARE
function verifyToken (req, res, next) {
  const bearerHeader = req.headers['authorization']

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    const bearerToken = bearer[1]
    req.token = bearerToken
    next()
  } else {
    res.sendStatus(401)
  }
}

app.listen(3030, () => {
  console.log('Server started on port 3030')
})
