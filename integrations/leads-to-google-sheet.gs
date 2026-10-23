/**
 * Main Stage · website leads → a Google Sheet, plus an email for each lead.
 *
 * Every time someone sends the pop-up form on the website, this adds a row
 * to the "Leads" tab of the sheet it lives in and emails getmainstage@gmail.com.
 *
 * One-time setup, signed in to Google as getmainstage@gmail.com:
 *  1. Create a new Google Sheet (name it e.g. "Main Stage leads").
 *  2. Extensions → Apps Script. Delete what's there and paste this whole file. Save.
 *  3. Pick "testLead" in the function menu and press Run. Google asks you to
 *     allow access to the sheet and to send email: allow it. A test row and a
 *     test email should arrive.
 *  4. Deploy → New deployment → type "Web app".
 *     Execute as: Me · Who has access: Anyone → Deploy.
 *  5. Copy the Web app URL (ends in /exec) and send it over. It goes into the
 *     website as VITE_LEAD_ENDPOINT.
 * If you edit this script later: Deploy → Manage deployments → edit → "New version",
 * so the same URL keeps working.
 */

const NOTIFY = 'getmainstage@gmail.com'
const SHEET_NAME = 'Leads'
const HEADERS = ['Received', 'Name', 'Email', 'LinkedIn', 'Button clicked', 'Page']

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}')

    // Bots fill in the hidden "website" field; people never see it
    if (d.website) return reply({ ok: true })

    const name = clean(d.name, 120)
    const email = clean(d.email, 200)
    const linkedin = clean(d.linkedin, 300)
    const source = clean(d.source, 120)
    const page = clean(d.page, 300)
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/linkedin\.com\//i.test(linkedin)) {
      return reply({ ok: false, error: 'invalid' })
    }

    const lock = LockService.getScriptLock()
    lock.waitLock(10000)
    try {
      sheet().appendRow([new Date(), safe(name), safe(email), safe(linkedin), safe(source), safe(page)])
    } finally {
      lock.releaseLock()
    }

    MailApp.sendEmail({
      to: NOTIFY,
      replyTo: email,
      subject: 'New lead: ' + name,
      body: [
        'Name: ' + name,
        'Email: ' + email,
        'LinkedIn: ' + linkedin,
        'Button clicked: ' + source,
        'Page: ' + page,
        '',
        'All leads: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
      ].join('\n'),
    })

    return reply({ ok: true })
  } catch (err) {
    return reply({ ok: false, error: String(err) })
  }
}

/** Run once from the editor to grant access and check it all works. */
function testLead() {
  const out = doPost({
    postData: {
      contents: JSON.stringify({
        name: 'Test lead',
        email: NOTIFY,
        linkedin: 'https://www.linkedin.com/in/test',
        source: 'Setup test',
        page: 'Apps Script editor',
      }),
    },
  })
  Logger.log(out.getContent())
}

/** The "Leads" tab, created with a header row the first time. */
function sheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet()
  let s = book.getSheetByName(SHEET_NAME)
  if (!s) {
    s = book.insertSheet(SHEET_NAME)
    s.appendRow(HEADERS)
    s.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    s.setFrozenRows(1)
  }
  return s
}

const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max)

// Stops a value like "=HYPERLINK(...)" from running as a formula in the sheet
const safe = (v) => (/^[=+\-@]/.test(v) ? "'" + v : v)

const reply = (obj) => ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
