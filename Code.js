// Google Apps Script - Deploy as Web App (Execute as: Me, Who has access: Anyone)
// After deploying, paste the Web App URL into index.html where indicated.

var SHEET_NAME = "LoginAttempts";

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Create the sheet with headers if it doesn't exist yet
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["Attempt #", "Timestamp"]);
      sheet.getRange(1, 1, 1, 2).setFontWeight("bold");
    }

    var timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });

    // Count = last row minus 1 header row, then +1 for this new entry
    var lastRow = sheet.getLastRow();
    var attemptNumber = lastRow; // header is row 1, so lastRow already accounts for it

    sheet.appendRow([attemptNumber, timestamp]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, attempt: attemptNumber }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
