// Google Apps Script - Deploy as Web App (Execute as: Me, Who has access: Anyone)
// After deploying, paste the Web App URL into index.html where indicated.
//
// Sheet setup required:
//   Sheet 1 named "Teachers"     — columns: Token | Name | (any extras you want)
//   Sheet 2 named "LoginAttempts" — created automatically
//   Sheet 3 named "LinkClicks"    — created automatically

var TEACHERS_SHEET = "Teachers";
var ATTEMPTS_SHEET = "LoginAttempts";
var CLICKS_SHEET   = "LinkClicks";

function doPost(e) { return handleRequest(e); }
function doGet(e)  { return handleRequest(e); }

function handleRequest(e) {
  try {
    var ss     = SpreadsheetApp.getActiveSpreadsheet();
    var token  = (e.parameter && e.parameter.token)  ? e.parameter.token.trim()  : "unknown";
    var action = (e.parameter && e.parameter.action) ? e.parameter.action.trim() : "login";

    // ── Look up teacher name from token ───────────────────────────────────
    var teacherName = "Unknown";
    var tSheet = ss.getSheetByName(TEACHERS_SHEET);
    if (tSheet) {
      var data = tSheet.getDataRange().getValues(); // [[token, name, ...], ...]
      for (var i = 1; i < data.length; i++) {       // skip header row
        if (String(data[i][0]).trim() === token) {
          teacherName = data[i][1];
          break;
        }
      }
    }

    var timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });

    // ── Route by action ───────────────────────────────────────────────────
    if (action === "click") {
      // Track link click (page visit)
      var cSheet = ss.getSheetByName(CLICKS_SHEET);
      if (!cSheet) {
        cSheet = ss.insertSheet(CLICKS_SHEET);
        cSheet.appendRow(["Click #", "Teacher Name", "Token", "Timestamp"]);
        cSheet.getRange(1, 1, 1, 4).setFontWeight("bold");
      }
      var clickNumber = cSheet.getDataRange().getValues().length;
      cSheet.appendRow([clickNumber, teacherName, token, timestamp]);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, click: clickNumber }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ── Default: log login attempt ─────────────────────────────────────────
    var aSheet = ss.getSheetByName(ATTEMPTS_SHEET);
    if (!aSheet) {
      aSheet = ss.insertSheet(ATTEMPTS_SHEET);
      aSheet.appendRow(["Attempt #", "Teacher Name", "Token", "Timestamp"]);
      aSheet.getRange(1, 1, 1, 4).setFontWeight("bold");
    }
    var attemptNumber = aSheet.getDataRange().getValues().length;
    aSheet.appendRow([attemptNumber, teacherName, token, timestamp]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, attempt: attemptNumber }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
