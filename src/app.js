import express from 'express'
import XlsxPopulate  from 'xlsx-populate'
import fs from 'fs'
import  { google } from 'googleapis';

const app = express()
const port = 3001

const baseUrl = 'https://api.publicapis.org/entries'

const outputFleExtension = 'xls'
const outputFileName = 'output'

const outputFileNameWithExt = `${outputFileName}.${outputFleExtension}`

const data = await fetch(baseUrl)
const jsonData = await data.json()

const filteredSortedData = jsonData.entries
  .filter(entry=>entry.HTTPS)
  .sort((firstEntry, secondEntry)=>{
    if (firstEntry.API < secondEntry.API) return -1
    if (firstEntry.API > secondEntry.API) return 1
    return 0
  })


XlsxPopulate.fromBlankAsync()
.then(workbook => {
    const headerNames = Object.keys(filteredSortedData[0])

    const headerColumns = workbook.sheet(0).range("A1:G1");
    headerColumns.value([headerNames]).style({fontColor:'66ff00', bold: true, fill:'000000'});

    filteredSortedData.forEach((dataItem, i)=>{
      const columns = workbook.sheet(0).range(`A${i+2}:G${i+2}`);
      columns.value([Object.values(dataItem)])
    })

    try {
      if (fs.existsSync(outputFileNameWithExt)) {
        fs.truncate(outputFileNameWithExt, err => {
          if(err) throw err; // не удалось очистить файл
        });
      }
    } catch(err) {
      console.error(err)
    }

    return workbook.toFileAsync(`./${outputFileNameWithExt}`);
});


/////// google sheets
const serviceAccountKeyFile = "./credetionals.json";

const auth = new google.auth.GoogleAuth({
  keyFile: `${serviceAccountKeyFile}`,
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const client = await auth.getClient();

const googleSheets = google.sheets({
  version: "v4",
  auth: client,
});

const spreadsheetId = "1bNyqPaMgz0LrY441McYz2j-VlFPheAYYe48m6umLk-w";

const sheetId = 77

try {
  await googleSheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    requestBody: {
      requests: [{
        addSheet: {
          properties: {
            title: outputFileName,
            sheetId
          }
        }
      }]
    }
  })
} catch(e){
  console.log('e:', e)
  console.log('скорее всего таблица уже создана')
}

const dataForGSC = filteredSortedData.map(dataItemObj=>Object.values(dataItemObj))
dataForGSC.unshift(Object.keys(filteredSortedData[0]))

googleSheets.spreadsheets.values.append({
  auth,
  spreadsheetId,
  range: outputFileName,
  valueInputOption: "USER_ENTERED",
  resource: {
    values: dataForGSC,
  },
});

googleSheets.spreadsheets.batchUpdate({
  spreadsheetId,
  resource: {
    requests: [
      {
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: Object.keys(filteredSortedData[0]).length,
          },
          top: {
            style: "SOLID",
            width: 3,
            color: {
              green: 2.0,
            },
          },
          bottom: {
            style: "SOLID",
            width: 3,
            color: {
              green: 2.0,
            },
          },
          right: {
            style: "SOLID",
            width: 3,
            color: {
              green: 3.0,
            },
          },
          left: {
            style: "SOLID",
            width: 3,
            color: {
              green: 2.0,
            },
          },
        },
      },
    ],
  },
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})