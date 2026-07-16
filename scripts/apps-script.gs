/**
 * Unevalem Apps Script Web App — the only backend.
 *
 * THIS FILE IS A MIRROR, NOT THE RUNNING CODE. The live version lives in the
 * Unevalem Google account (spreadsheet → Extensions → Apps Script). Edit here,
 * paste there, redeploy. Kept in the repo so the backend is reviewable and so
 * client/server payload contracts can be checked in one place.
 *
 * GET  ?sheet=<name>  → JSON array of that tab's rows (see SHEET_MAP)
 * POST {action:...}   → routed by action; see doPost
 */

// Tabs exposed over GET. A tab absent here returns an error even if it exists
// in the spreadsheet — this list is the allowlist.
var SHEET_MAP = {
  posts:          'posts',
  notifications:  'notifications',
  stats:          'stats',
  inventory:      'inventory',
  tips:           'tips',
  quizzes:        'quizzes',
  quiz_questions: 'quiz_questions',
  quiz_results:   'quiz_results',
  post_stats:     'post_stats',
  sources:        'sources',
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}

function doGet(e) {
  var sheet = e.parameter.sheet
  var ss = SpreadsheetApp.getActiveSpreadsheet()

  var tabName = SHEET_MAP[sheet]
  if (!tabName) return json({ error: 'Unknown sheet: ' + sheet })

  var tab = ss.getSheetByName(tabName)
  if (!tab) return json({ error: 'Tab not found: ' + tabName })

  var values = tab.getDataRange().getValues()
  var headers = values[0]
  var rows = values.slice(1)

  var data = rows
    .filter(function (row) { return row.some(function (cell) { return cell !== '' }) })
    .map(function (row) {
      var obj = {}
      headers.forEach(function (h, i) { obj[h] = row[i] })
      return obj
    })

  return json(data)
}

/**
 * Routed strictly on payload.action. Do not reintroduce a default branch: an
 * unrecognised payload must never fall through to the calculator handler, which
 * appends a response row and bumps the public calculatorCompletions counter.
 * That is exactly how post_view pings were inflating that number.
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet()
    var payload = JSON.parse(e.postData.contents)
    var action = payload.action

    if (action === 'post_view')   return handlePostView(ss, payload)
    if (action === 'submit_calc') return handleCalcSubmit(ss, payload)

    return json({ ok: false, error: 'Unknown action: ' + String(action) })
  } catch (err) {
    return json({ ok: false, error: err.message })
  }
}

/** Anonymous per-article view tally → post_stats (slug, views). */
function handlePostView(ss, payload) {
  var slug = String(payload.slug || '').trim()
  if (!slug) return json({ ok: false, error: 'post_view without slug' })

  // Views arrive concurrently and fire-and-forget; without a lock two pings can
  // read the same count and both write n+1, losing one.
  var lock = LockService.getScriptLock()
  try {
    lock.waitLock(10000)
  } catch (err) {
    return json({ ok: false, error: 'busy' })
  }

  try {
    var sheet = ss.getSheetByName('post_stats')
    if (!sheet) sheet = ss.insertSheet('post_stats')
    // Covers a hand-created empty tab: without headers, doGet would key every
    // column as '' and fetch-content would read no slugs.
    if (sheet.getLastRow() === 0) sheet.appendRow(['slug', 'views'])

    var data = sheet.getDataRange().getValues()
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === slug) {
        var current = parseInt(String(data[i][1]).replace(/\s/g, ''), 10) || 0
        sheet.getRange(i + 1, 2).setValue(current + 1)
        return json({ ok: true, slug: slug, views: current + 1 })
      }
    }
    sheet.appendRow([slug, 1])
    return json({ ok: true, slug: slug, views: 1 })
  } finally {
    lock.releaseLock()
  }
}

/** Calculator submission → <calcType>_responses, plus the completions counter. */
function handleCalcSubmit(ss, payload) {
  var calcType = payload.calcType || 'pillow'
  var sheetName = calcType + '_responses'

  var responseSheet = ss.getSheetByName(sheetName)
  if (!responseSheet) {
    responseSheet = ss.insertSheet(sheetName)
    responseSheet.appendRow([
      'completedAt', 'sessionId', 'variant', 'calcType',
      'position', 'bodyType', 'neckPain', 'sweating', 'temp',
      'blanketWeight', 'partner', 'allergies', 'pillowAge',
      'backPain', 'mattressAge', 'rec0', 'currentScore', 'improvedScore'
    ])
  }

  responseSheet.appendRow([
    payload.completedAt   || '',
    payload.sessionId     || '',
    payload.variant       || '',
    payload.calcType      || '',
    payload.position      || '',
    payload.bodyType      || '',
    payload.neckPain      || '',
    payload.sweating      || '',
    payload.temp          || '',
    payload.blanketWeight || '',
    payload.partner       || '',
    payload.allergies     || '',
    payload.pillowAge     || '',
    payload.backPain      || '',
    payload.mattressAge   || '',
    payload.rec0          || '',
    payload.currentScore  || '',
    payload.improvedScore || ''
  ])

  var lock = LockService.getScriptLock()
  try {
    lock.waitLock(10000)
  } catch (err) {
    return json({ ok: true, counted: false })
  }

  try {
    var statsSheet = ss.getSheetByName('stats')
    if (statsSheet) {
      var data = statsSheet.getDataRange().getValues()
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === 'calculatorCompletions') {
          var current = parseInt(String(data[i][1]).replace(/\s/g, ''), 10) || 0
          statsSheet.getRange(i + 1, 2).setValue(current + 1)
          break
        }
      }
    }
  } finally {
    lock.releaseLock()
  }

  return json({ ok: true })
}
