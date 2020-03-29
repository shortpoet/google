const sheets = google.sheets({
  version: 'v4',
  auth:  refreshClient.oAuth2Client,
});  


const titler = title => {
  let d = new Date();
  let h = d.getHours();
  let m = d.getMinutes();
  return {
    field: `${title}_${h}_${m}`,
    title: `${recase(title)}-${h}-${m}`
  }
}

const previousIds = async () => {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(__dirname + '/../data/dataSheetIds.txt', 'utf8', (err, ids) => {
        ids = ids.split(',')
        console.log(ids)
        console.log(ids.length)
        this.out = [ids[ids.length - 2], ids[ids.length - 1]]
        console.log('pidsFunc', this.out)
        resolve(this.out)
      })
    }
    catch(e) {
      resolve(e)
    }
  })
};  



async function createSheet(title) {
  const resource = {
    properties: {
      title: title.title
    },
    sheets: [
      {
        properties: {
          title: "Unsubscriber",
          tabColor: {
            alpha: 0,
            blue: 0,
            green: 0,
            red: 0
          },
          index: 0,
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 100000,
            columnCount: 9
          }
        }
      }
    ],
  }
  const response = (await sheets.spreadsheets.create({
    // fields indicates which are included in response, default is all
    // fields:'spreadsheetId',
    resource
  })
  ).data
  writeJson(response, `../data/${title.field}.create.data.json`, 2)
  // console.log(JSON.stringify(response, null, 2))
  return response
}

var COLUMNS = [
  { type: 'string', field: 'messageId', header: 'ID' },
  { type: 'string', field: 'subject', header: 'Subject' },
  { type: 'string', field: 'labelIds', header: 'Labels'},
  { type: 'string', field: 'status', header: 'Status'},
  { type: 'string', field: 'date', header: 'Date Recieved' },
  { type: 'string', field: 'listUnsubscribe', header: 'Unsubscribe Link / Email' },
  { type: 'link', field: 'link', header: 'Link' },
  { type: 'string', field: 'from', header: 'Message Sender' },
  { type: 'integer', field: 'size', header: 'Message Size' }
];

/**
 * Builds a request that sets the header row.
 * @param  {string} sheetId The ID of the sheet.
 * @return {Object}         The reqeuest.
 */
function buildHeaderRowRequest(sheetId) {
  var cells = COLUMNS.map(function(column) {
    return {
      userEnteredValue: {
        stringValue: column.header
      },
      userEnteredFormat: {
        textFormat: {
          bold: true
        }
      }
    }
  });
  return {
    updateCells: {
      start: {
        sheetId: sheetId,
        rowIndex: 0,
        columnIndex: 0
      },
      rows: [
        {
          values: cells
        }
      ],
      fields: 'userEnteredValue,userEnteredFormat.textFormat.bold'
    }
  };
}

/**
 * Builds a request that sets the header row.
 * @param  {string} sheetId The ID of the sheet.
 * @return {Object}         The reqeuest.
 */
function buildMessageRowRequest(sheetId, message, rowIndex) {
  var cells = COLUMNS.map(function(column) {
    switch (column.type) {
      case 'integer':
        return {
          userEnteredValue: {
            numberValue: message[`${column.field}`]
          },
          userEnteredFormat: {
            numberFormat: {
              type: 'NUMBER',
            }
          }
        };
        break;
      case 'link':
        return {
          userEnteredValue: {
            formulaValue: message[column.field]
          }
        };
        break;
      case 'string':
        return {
          userEnteredValue: {
            stringValue: message[column.field]
          }
        };
        break;
      default:
        return {
          userEnteredValue: {
            stringValue: order[column.field].toString()
          }
        };
    }
  });
  return {
    updateCells: {
      start: {
        sheetId: sheetId,
        rowIndex: rowIndex,
        columnIndex: 0
      },
      rows: [
        {
          values: cells
        }
      ],
      fields: '*'
    }
  };
}

function buildDeleteRequest(sheetId) {
  return {
    deleteSheet: {
      sheetId: sheetId,
    }
  };
}


async function updateSheet({spreadsheetId, command, dataSheetId, rowIndex, message}) {
  let requests;
  switch (command) {
    case 'delete':
      requests = [
        buildDeleteRequest(dataSheetId)
      ];
    case 'header':
      requests = [
        buildHeaderRowRequest(dataSheetId),
      ];
    case 'message':
      requests = [
        buildMessageRowRequest(dataSheetId, message, rowIndex),
      ];
    break;
  }
  const resource = {
    requests: requests
  };
  const response = (await sheets.spreadsheets.batchUpdate({
    // fields indicates which are included in response, default is all
    // fields:'spreadSheetId',
    spreadsheetId,
    resource
  })
  ).data
  // writeJson(response, `../data/sheet.update.data.json`, 2)
  console.log(JSON.stringify(response, null, 2))
  return response
}
  // leading / allows to skip using path.join
  // createSheet(titler('shortpoetSheet')).then((spreadsheet) => {
  //   console.log(spreadsheet)
  //   const spreadsheetId = spreadsheet.spreadsheetId
  //   const dataSheetId = spreadsheet.sheets[0].properties.sheetId
  //   updateSheet({spreadsheetId: spreadsheetId , command: 'header', dataSheetId: dataSheetId})

  //   // appendSeparatorFile(spreadsheetId, '../data/dataSheetIds.txt').then(() => {
  //   //   appendSeparatorFile(dataSheetId, '../data/dataSheetIds.txt').then(() => {
  //   //     console.log('currIds', [spreadsheetId, dataSheetId])
  //   //     previousIds().then((pIds) => {
  //   //       console.log('pIdsPromise', pIds)
  //   //       // updateSheet(pIds[0], {command: 'delete', dataSheetId: pIds[1]})  
  //   //       // updateSheet(spreadsheetId, {command: 'header', dataSheetId: dataSheetId})  
  //   //     })
  //   //   });
  //   // });
  // })
