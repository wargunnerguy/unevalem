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

// ── Shop configuration ──────────────────────────────────────────────────────
// Order alert recipient. Keep as a constant so it's visible at the top.
var OWNER_EMAIL = 'unevalem@gmail.com'
// Public site origin for payment return redirects.
var SITE_URL = 'https://unevalem.ee'
// Estimated delivery shown in the customer confirmation email. Must match the
// promise in müügitingimused (§4) and on /aitah.
var DELIVERY_DAYS = '2–5'

function doGet(e) {
  // Order status for the /aitah page: server-verified state only, no PII.
  if (e.parameter.action === 'order_status') return handleOrderStatus(e)

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

    // Payment provider callback: Maksekeskus posts form-encoded `json` + `mac`
    // fields (not a JSON body), so it is routed before the JSON parse below.
    if (e.parameter && e.parameter.json && e.parameter.mac) {
      return handlePaymentCallback(ss, e.parameter.json, e.parameter.mac)
    }

    var payload = JSON.parse(e.postData.contents)
    var action = payload.action

    if (action === 'post_view')    return handlePostView(ss, payload)
    if (action === 'submit_calc')  return handleCalcSubmit(ss, payload)
    if (action === 'waitlist')     return handleWaitlist(ss, payload)
    if (action === 'create_order') return handleCreateOrder(ss, payload)

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

// ═══════════════════════════════════════════════════════════════════════════
// SHOP: waitlist, orders, payment
//
// The `orders` and `waitlist` tabs hold PII and are deliberately NOT in
// SHEET_MAP — they must never be readable over GET.
//
// Payment provider credentials live in Script Properties (File → Project
// properties → Script properties), NOT in this file:
//   MK_SHOP_ID     — Maksekeskus shop UUID
//   MK_SECRET_KEY  — Maksekeskus secret key (used for both API auth and MAC)
//   MK_ENV         — 'test' or 'live' (start with test!)
// Test credentials & docs: https://developer.makecommerce.net/
// ═══════════════════════════════════════════════════════════════════════════

/** "Notify me when available" → waitlist tab (ts, email, productId). */
function handleWaitlist(ss, payload) {
  var email = String(payload.email || '').trim().slice(0, 200)
  var productId = String(payload.productId || '').trim().slice(0, 100)
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: 'invalid email' })
  if (!productId) return json({ ok: false, error: 'missing productId' })

  var sheet = ss.getSheetByName('waitlist')
  if (!sheet) sheet = ss.insertSheet('waitlist')
  if (sheet.getLastRow() === 0) sheet.appendRow(['createdAt', 'email', 'productId'])
  sheet.appendRow([new Date().toISOString(), email, productId])
  return json({ ok: true })
}

/**
 * Create an order. The client sends ONLY item ids + quantities — prices are
 * looked up from the inventory sheet here, so a tampered client cannot set
 * its own prices. Unknown, inactive or unavailable products reject the order.
 */
function handleCreateOrder(ss, payload) {
  var items = payload.items
  var customer = payload.customer || {}
  var shipping = payload.shipping || {}

  if (!Array.isArray(items) || !items.length || items.length > 20) {
    return json({ ok: false, error: 'invalid items' })
  }
  var name = String(customer.name || '').trim().slice(0, 200)
  var email = String(customer.email || '').trim().slice(0, 200)
  var phone = String(customer.phone || '').trim().slice(0, 50)
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || phone.length < 5) {
    return json({ ok: false, error: 'invalid customer' })
  }
  var shipMethod = String(shipping.method || '').trim()
  var terminalId = String(shipping.terminalId || '').trim().slice(0, 50)
  var terminalName = String(shipping.terminalName || '').trim().slice(0, 200)
  if ((shipMethod !== 'omniva' && shipMethod !== 'smartpost') || !terminalId) {
    return json({ ok: false, error: 'invalid shipping' })
  }

  // Server-side price lookup from the inventory tab
  var inv = ss.getSheetByName('inventory')
  if (!inv) return json({ ok: false, error: 'no inventory' })
  var data = inv.getDataRange().getValues()
  var headers = data[0]
  var col = {}
  headers.forEach(function (h, i) { col[h] = i })
  if (!('id' in col) || !('price' in col)) return json({ ok: false, error: 'inventory missing columns' })

  var byId = {}
  for (var i = 1; i < data.length; i++) {
    byId[String(data[i][col.id]).trim()] = data[i]
  }

  var isTrue = function (v) { return v === true || String(v).trim().toUpperCase() === 'TRUE' }
  var total = 0
  var lines = []
  for (var j = 0; j < items.length; j++) {
    var id = String(items[j].id || '').trim()
    var qty = Math.floor(Number(items[j].qty))
    if (!id || !(qty >= 1 && qty <= 99)) return json({ ok: false, error: 'invalid item ' + id })
    var row = byId[id]
    if (!row) return json({ ok: false, error: 'unknown product ' + id })
    if (!isTrue(row[col.active]) || !('available' in col) || !isTrue(row[col.available])) {
      return json({ ok: false, error: 'unavailable product ' + id })
    }
    var price = Number(String(row[col.price]).replace(',', '.'))
    if (!(price > 0)) return json({ ok: false, error: 'unpriced product ' + id })
    total += price * qty
    lines.push({ id: id, qty: qty, price: price, name: 'name' in col ? String(row[col.name]) : id })
  }
  total = Math.round(total * 100) / 100

  var orderRef = Utilities.getUuid()
  var orders = ss.getSheetByName('orders')
  if (!orders) orders = ss.insertSheet('orders')
  if (orders.getLastRow() === 0) {
    orders.appendRow(['orderRef', 'createdAt', 'status', 'itemsJson', 'total',
      'name', 'email', 'phone', 'shipMethod', 'terminalId', 'terminalName',
      'note', 'transactionId', 'paidAt'])
  }
  orders.appendRow([
    orderRef, new Date().toISOString(), 'PENDING', JSON.stringify(lines), total,
    name, email, phone, shipMethod, terminalId, terminalName,
    String(payload.note || '').slice(0, 500), '', ''
  ])

  try {
    var paymentUrl = createPayment_(orderRef, total, email)
    return json({ ok: true, orderRef: orderRef, paymentUrl: paymentUrl })
  } catch (err) {
    setOrderStatus_(ss, orderRef, 'FAILED', '', '')
    return json({ ok: false, error: 'payment init failed: ' + err.message })
  }
}

/** /aitah polls this: returns only the status string for a given order ref. */
function handleOrderStatus(e) {
  var ref = String(e.parameter.ref || '').trim()
  if (!ref) return json({ error: 'missing ref' })
  var orders = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders')
  if (!orders) return json({ error: 'not found' })
  var data = orders.getDataRange().getValues()
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === ref) return json({ status: String(data[i][2]) })
  }
  return json({ error: 'not found' })
}

// ── Payment provider adapter (Maksekeskus / MakeCommerce) ──────────────────
// Swappable: to move to Montonio, reimplement createPayment_() and
// handlePaymentCallback() with the same order-side effects; nothing else in
// this file knows which provider is behind them.

function mkConfig_() {
  var props = PropertiesService.getScriptProperties()
  var env = (props.getProperty('MK_ENV') || 'test').toLowerCase()
  return {
    shopId: props.getProperty('MK_SHOP_ID'),
    secret: props.getProperty('MK_SECRET_KEY'),
    apiBase: env === 'live' ? 'https://api.maksekeskus.ee' : 'https://api.test.maksekeskus.ee',
  }
}

/**
 * POST /v1/transactions → customer redirect URL (the universal gateway page
 * under payment_methods.other[name=redirect]).
 * Docs: developer.makecommerce.net → Custom API → Regular Payment Flow.
 */
function createPayment_(orderRef, total, email) {
  var cfg = mkConfig_()
  if (!cfg.shopId || !cfg.secret) throw new Error('MK credentials not set in Script Properties')

  var selfUrl = ScriptApp.getService().getUrl() // this web app's /exec URL
  var body = {
    transaction: {
      amount: total.toFixed(2),
      currency: 'EUR',
      reference: orderRef,
      merchant_data: orderRef,
      transaction_url: {
        // Success: /aitah verifies the order server-side before thanking.
        return_url:        { url: SITE_URL + '/aitah?ref=' + orderRef, method: 'GET' },
        // Cancel: back to checkout with a notice — the cart is still intact.
        cancel_url:        { url: SITE_URL + '/kassa?makse=katkes', method: 'GET' },
        // Authoritative server-to-server result, independent of the user's
        // journey — must hit this web app (the only backend we have).
        notifications_url: { url: selfUrl, method: 'POST' },
      },
    },
    customer: {
      email: email,
      country: 'ee',
      locale: 'et',
      // Apps Script cannot see the buyer's IP; MK accepts a placeholder here.
      ip: '0.0.0.0',
    },
  }

  var res = UrlFetchApp.fetch(cfg.apiBase + '/v1/transactions', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(cfg.shopId + ':' + cfg.secret),
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  })
  if (res.getResponseCode() >= 300) {
    throw new Error('MK ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 300))
  }
  var tx = JSON.parse(res.getContentText())

  // Universal gateway link: payment_methods.other[] entry named 'redirect'
  var others = (tx.payment_methods && tx.payment_methods.other) || []
  for (var i = 0; i < others.length; i++) {
    if (others[i].name === 'redirect' && others[i].url) return others[i].url
  }
  // Fallback: first available method URL of any kind
  var groups = ['banklinks', 'cards', 'other']
  for (var g = 0; g < groups.length; g++) {
    var arr = (tx.payment_methods && tx.payment_methods[groups[g]]) || []
    if (arr.length && arr[0].url) return arr[0].url
  }
  throw new Error('no payment url in MK response')
}

/**
 * Maksekeskus callback (both customer return POSTs and the async
 * notifications_url hit this). MAC is verified BEFORE anything else; a bad
 * MAC is rejected. Idempotent: a repeated COMPLETED for an already-PAID
 * order does nothing (MK explicitly warns duplicates happen).
 */
function handlePaymentCallback(ss, jsonStr, mac) {
  var cfg = mkConfig_()
  if (!cfg.secret) return json({ ok: false, error: 'not configured' })

  var expected = bytesToHex_(Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_512, jsonStr + cfg.secret, Utilities.Charset.UTF_8,
  )).toUpperCase()
  if (expected !== String(mac).toUpperCase()) {
    return json({ ok: false, error: 'bad mac' })
  }

  var msg = JSON.parse(jsonStr)
  var orderRef = String(msg.reference || msg.merchant_data || '').trim()
  var status = String(msg.status || '').toUpperCase()
  var txId = String(msg.transaction || '')
  if (!orderRef) return json({ ok: false, error: 'no reference' })

  var lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    var orders = ss.getSheetByName('orders')
    if (!orders) return json({ ok: false, error: 'no orders tab' })
    var data = orders.getDataRange().getValues()
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) !== orderRef) continue

      var current = String(data[i][2])
      if (status === 'COMPLETED') {
        if (current === 'PAID') return json({ ok: true }) // duplicate — ignore
        orders.getRange(i + 1, 3).setValue('PAID')
        orders.getRange(i + 1, 13).setValue(txId)
        orders.getRange(i + 1, 14).setValue(new Date().toISOString())
        sendOrderEmails_(data[i], orderRef)
      } else if ((status === 'CANCELLED' || status === 'EXPIRED') && current === 'PENDING') {
        orders.getRange(i + 1, 3).setValue(status)
      }
      return json({ ok: true })
    }
    return json({ ok: false, error: 'order not found' })
  } finally {
    lock.releaseLock()
  }
}

function setOrderStatus_(ss, orderRef, status, txId, paidAt) {
  var orders = ss.getSheetByName('orders')
  if (!orders) return
  var data = orders.getDataRange().getValues()
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === orderRef) {
      orders.getRange(i + 1, 3).setValue(status)
      if (txId) orders.getRange(i + 1, 13).setValue(txId)
      if (paidAt) orders.getRange(i + 1, 14).setValue(paidAt)
      return
    }
  }
}

/** On PAID: alert the owner + Estonian confirmation scaffold to the customer. */
function sendOrderEmails_(orderRow, orderRef) {
  var itemsJson = String(orderRow[3])
  var total = orderRow[4]
  var name = String(orderRow[5])
  var email = String(orderRow[6])
  var phone = String(orderRow[7])
  var shipMethod = String(orderRow[8])
  var terminalName = String(orderRow[10])

  var lines = []
  try {
    JSON.parse(itemsJson).forEach(function (l) {
      lines.push('  ' + l.name + ' × ' + l.qty + ' — ' + (l.price * l.qty).toFixed(2) + ' €')
    })
  } catch (err) { lines.push('  ' + itemsJson) }

  try {
    MailApp.sendEmail(OWNER_EMAIL,
      '💰 Uus tellimus — ' + total + ' € (' + orderRef.slice(0, 8) + ')',
      'Uus makstud tellimus:\n\n' + lines.join('\n') +
      '\n\nKokku: ' + total + ' €' +
      '\n\nKlient: ' + name + '\nE-post: ' + email + '\nTelefon: ' + phone +
      '\nTarne: ' + shipMethod + ' — ' + terminalName +
      '\n\nTellimuse nr: ' + orderRef)
  } catch (err) { /* owner alert must not block the callback ack */ }

  try {
    MailApp.sendEmail(email,
      'Sinu tellimus on kinnitatud — Unevalem',
      'Tere, ' + name + '!\n\n' +
      'Aitäh tellimuse eest — makse on kinnitatud.\n\n' +
      'Sinu tellimus:\n' + lines.join('\n') +
      '\nKokku: ' + total + ' €\n\n' +
      'Tarne: ' + terminalName + ' (' + shipMethod + ')\n' +
      'Saadame paki teele ' + DELIVERY_DAYS + ' tööpäeva jooksul — pakiautomaadi koodi saad SMS-iga.\n\n' +
      'Tellimuse number: ' + orderRef + '\n\n' +
      'Küsimuste korral vasta sellele kirjale.\n\n' +
      'Head und!\nUnevalem — Costlio OÜ')
  } catch (err) { /* ditto */ }
}

function bytesToHex_(bytes) {
  return bytes.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16)
    return v.length === 1 ? '0' + v : v
  }).join('')
}

// ═══════════════════════════════════════════════════════════════════════════
// ONE-TIME ADMIN HELPERS — run manually from the Apps Script editor
// (select the function in the toolbar dropdown → Run). Not reachable over
// the web app; they exist so sheet setup doesn't require hand-pasting.
// ═══════════════════════════════════════════════════════════════════════════

var REPO_RAW = 'https://raw.githubusercontent.com/wargunnerguy/unevalem/main'

/**
 * Imports scripts/sources-import.tsv from the repo into the `sources` tab
 * (slug | title | url). Replaces the tab's contents — safe to re-run.
 */
function importSources() {
  var tsv = UrlFetchApp.fetch(REPO_RAW + '/scripts/sources-import.tsv').getContentText()
  var rows = tsv.trim().split('\n').map(function (line) {
    var parts = line.split('\t')
    return [parts[0] || '', parts[1] || '', parts[2] || '']
  })
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var tab = ss.getSheetByName('sources')
  if (!tab) tab = ss.insertSheet('sources')
  tab.clearContents()
  tab.getRange(1, 1, 1, 3).setValues([['slug', 'title', 'url']])
  tab.getRange(2, 1, rows.length, 3).setValues(rows)
  Logger.log('Imported ' + rows.length + ' source rows into the sources tab')
}

/**
 * Prepares the shop side of the spreadsheet:
 *  - adds an `available` column to inventory if missing (blank = waitlist mode)
 *  - creates waitlist + orders tabs with headers (kept out of the GET allowlist)
 * Safe to re-run; never overwrites existing data.
 */
function setupShop() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()

  var inv = ss.getSheetByName('inventory')
  if (inv) {
    var headers = inv.getRange(1, 1, 1, inv.getLastColumn()).getValues()[0]
    if (headers.indexOf('available') === -1) {
      inv.getRange(1, inv.getLastColumn() + 1).setValue('available')
      Logger.log('inventory: added "available" column — tick TRUE per product to enable purchase')
    } else {
      Logger.log('inventory: "available" column already present')
    }
  } else {
    Logger.log('WARNING: no inventory tab found')
  }

  var waitlist = ss.getSheetByName('waitlist')
  if (!waitlist) {
    waitlist = ss.insertSheet('waitlist')
    waitlist.appendRow(['createdAt', 'email', 'productId'])
    Logger.log('created waitlist tab')
  }

  var orders = ss.getSheetByName('orders')
  if (!orders) {
    orders = ss.insertSheet('orders')
    orders.appendRow(['orderRef', 'createdAt', 'status', 'itemsJson', 'total',
      'name', 'email', 'phone', 'shipMethod', 'terminalId', 'terminalName',
      'note', 'transactionId', 'paidAt'])
    Logger.log('created orders tab')
  }

  var props = PropertiesService.getScriptProperties()
  if (!props.getProperty('MK_SHOP_ID')) {
    Logger.log('REMINDER: set Script Properties MK_SHOP_ID, MK_SECRET_KEY, MK_ENV=test ' +
      '(Project Settings → Script properties) before testing checkout')
  }
}
