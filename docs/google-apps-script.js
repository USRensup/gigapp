/**
 * Google Apps Script backend for GigBoard.
 *
 * Setup:
 * 1) Create a Google Sheet with tab name: gigs
 * 2) Add header row in A1:H1:
 *    id | title | company | location | type | pay | description | applications
 * 3) Paste this script into Extensions -> Apps Script
 * 4) Update SHEET_NAME if needed
 * 5) Deploy as Web App (Anyone with the link)
 * 6) Use deployment URL as GOOGLE_SHEETS_WEBHOOK_URL
 */

const SHEET_NAME = 'gigs';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const action = payload.action;

    if (action === 'list') {
      return jsonResponse({ gigs: listGigs_() });
    }

    if (action === 'create') {
      const gig = createGig_(payload.payload || {});
      return jsonResponse({ gig });
    }

    if (action === 'apply') {
      const result = applyToGig_(payload.id);
      return jsonResponse(result || { error: 'Gig not found' });
    }

    return jsonResponse({ error: 'Unsupported action' });
  } catch (err) {
    return jsonResponse({ error: 'Server error', detail: String(err) });
  }
}

function listGigs_() {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const body = rows.slice(1).filter(r => r[0]);
  return body.map((r) => ({
    id: String(r[0]),
    title: String(r[1] || ''),
    company: String(r[2] || ''),
    location: String(r[3] || ''),
    type: String(r[4] || ''),
    pay: String(r[5] || ''),
    description: String(r[6] || ''),
    applications: Number(r[7] || 0)
  }));
}

function createGig_(payload) {
  const required = ['title', 'company', 'location', 'type', 'pay', 'description'];
  for (var i = 0; i < required.length; i++) {
    if (!payload[required[i]]) throw new Error('Missing field: ' + required[i]);
  }

  const sheet = getSheet_();
  const id = 'g' + new Date().getTime();
  const gig = {
    id,
    title: String(payload.title),
    company: String(payload.company),
    location: String(payload.location),
    type: String(payload.type),
    pay: String(payload.pay),
    description: String(payload.description),
    applications: 0
  };

  sheet.appendRow([
    gig.id,
    gig.title,
    gig.company,
    gig.location,
    gig.type,
    gig.pay,
    gig.description,
    gig.applications
  ]);

  return gig;
}

function applyToGig_(id) {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      const current = Number(rows[i][7] || 0);
      const nextVal = current + 1;
      sheet.getRange(i + 1, 8).setValue(nextVal);
      return { success: true, applications: nextVal };
    }
  }

  return null;
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['id', 'title', 'company', 'location', 'type', 'pay', 'description', 'applications']);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
