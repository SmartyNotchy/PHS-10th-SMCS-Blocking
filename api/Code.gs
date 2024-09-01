// Hi Mr. Estep!
// I apologize for the poorly written code in advance.
// - Pilliam W



// Undefineds make my webserver spontaneously implode. That's kinda not fun, so hopefully this function solves that issue.
function parseCell(x) {
  if (x == undefined || x == null) {
    return "";
  } else {
    return x.toString().trim();
  }
}

// What it sounds like
function parseRow(row) {
  res = [parseCell(row[0]), parseCell(row[1]), parseCell(row[2]), parseCell(row[3])];
  return res;
}

// Packages each "block" of schedule into a nice, easy-to-read JSON object for my webserver.
function format_vals(id, startCell, endCell, n) {
  // id is a # from 1-10 that identifies the day associated with the schedule
  // startCell & endCell are the "corners" of the 4x4 square that contains the actual schedule
  // n is the cell that contains the "notes" for that day

  // My personal debug sheet ID 
  const sheetID = "1qxSR4DcvS3ylTaoiTVMYQ-GrkJVrpHshXLm8rgqwD_4";
  
  // The actual schedule sheet ID
  // const sheetID = "10DcVKnTMYVIs0pqYI4vKvZNNIQE5IYuuSIaLjlDjz3k";

  // Fetches the cell values from the spreadsheet.
  // Yes, this fetches from PublishedWeek, I'm too lazy to get it to work from Source (and besides, PublishedWeek works just fine).
  let values = Sheets.Spreadsheets.Values.get(sheetID, `PublishedWeek!${startCell}:${endCell}`).values;
  let notes = Sheets.Spreadsheets.Values.get(sheetID, `PublishedWeek!${n}`).values;


  if (values == undefined || values.length == 0) {
    values = [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]];
  }
  if (notes == undefined) {
    notes = [[""]];
  }

  let res = {};
  res[`${id}_Pd2`] = parseRow(values[0]);
  res[`${id}_Pd3`] = parseRow(values[1]);
  res[`${id}_Pd4`] = parseRow(values[2]);
  res[`${id}_Pd5`] = parseRow(values[3]);
  res[`${id}Notes`] = notes[0][0];

  return res;
}

function send_data() {
  // My webserver URL. Thanks PythonAnywhere!
  const url = 'https://smartynotchy.pythonanywhere.com/';
  
  // Is this secure? Not at all lmfao.
  // But let's be real, who's going to spend their time hacking into a funny little blocking schedule?
  const headers = { 
    "username": "pilliam", // hey, that's me :D
    "password": "Str@wberry Jam Collab 2021" // best celeste mod
  };
  
  // The schedule data that we'll be sending over to my webserver.
  const payload = Object.assign({},
    format_vals("1", "C4", "F7", "B8"),
    format_vals("2", "I4", "L7", "H8"),
    format_vals("3", "O4", "R7", "N8"),
    format_vals("4", "U4", "X7", "T8"),
    format_vals("5", "AA4", "AD7", "Z8")
  );

  const options = { 
    'method': 'post',
    'contentType': 'application/json',
    'headers': headers,
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': false
  };

  console.log(payload); // Debug
  
  const response = UrlFetchApp.fetch(url, options);
}
