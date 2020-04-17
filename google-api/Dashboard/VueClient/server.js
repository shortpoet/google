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

var cors = require('cors');
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
  refreshClient.authenticate()
})


app.get('/calendar', async (req, res) => {
  try {
    const data = await calendar.runSampleExternal();
    res.json(data);
  } catch (e) {
    console.log(e)
  }
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
