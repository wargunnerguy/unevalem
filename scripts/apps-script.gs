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
  calculators:    'calculators',
  calc_questions: 'calc_questions',
  post_stats:     'post_stats',
  sources:        'sources',
  pains:          'pains',
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
  // Buyer self-service lookup (/tellimus): order number + matching email.
  if (e.parameter.action === 'order_lookup') return handleOrderLookup(e)

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
    if (action === 'subscribe')    return handleSubscribe(ss, payload)
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

/**
 * Calculator submission → <calcType>_responses, plus the completions counter.
 *
 * Header-mapped, NOT positional. The previous version appended a fixed 18-cell
 * array against a header written only when the tab was first created, which had
 * two consequences: the seven newer answers the client already sends
 * (complaint, age, pillowCount, sleepQuality, currentMattress, roomTemp,
 * problemSeason) were silently dropped on every submission, and inserting a
 * column in the sheet by hand would have misaligned every subsequent row.
 *
 * Now each payload key finds its own column by name, and an unknown key appends
 * a new header cell first — same self-migrating shape as the orderNumber column
 * in handleCreateOrder. Adding a field client-side needs no change here.
 */

// Written into a freshly created tab so the common columns keep a readable,
// stable order. Anything else the payload carries is appended after these.
var CALC_BASE_COLUMNS = [
  'completedAt', 'sessionId', 'env', 'calcType', 'prefilledFrom',
  'position', 'bodyType', 'neckPain', 'sweating', 'temp',
  'blanketWeight', 'partner', 'allergies', 'pillowAge',
  'backPain', 'mattressAge', 'complaint', 'age', 'pillowCount',
  'sleepQuality', 'currentMattress', 'roomTemp', 'problemSeason',
  'rec0', 'currentScore', 'improvedScore',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'gclid', 'ttclid', 'firstTouchAt'
]

function handleCalcSubmit(ss, payload) {
  var calcType = payload.calcType || 'pillow'
  var sheetName = calcType + '_responses'

  var responseSheet = ss.getSheetByName(sheetName)
  if (!responseSheet) {
    responseSheet = ss.insertSheet(sheetName)
    responseSheet.appendRow(CALC_BASE_COLUMNS)
  }
  // Hand-created empty tab: without headers every column would key as ''.
  if (responseSheet.getLastRow() === 0) responseSheet.appendRow(CALC_BASE_COLUMNS)

  var headers = responseSheet.getRange(1, 1, 1, responseSheet.getLastColumn()).getValues()[0]
  var col = {}
  for (var h = 0; h < headers.length; h++) {
    var name = String(headers[h]).trim()
    if (name) col[name] = h
  }

  // `action` is routing metadata, not data. Everything else the client sends
  // gets a column, creating one on first sight.
  var newHeaders = []
  for (var key in payload) {
    if (!payload.hasOwnProperty(key) || key === 'action') continue
    if (!(key in col)) {
      col[key] = headers.length + newHeaders.length
      newHeaders.push(key)
    }
  }
  if (newHeaders.length) {
    responseSheet.getRange(1, headers.length + 1, 1, newHeaders.length).setValues([newHeaders])
  }

  var width = headers.length + newHeaders.length
  var row = new Array(width)
  for (var i = 0; i < width; i++) row[i] = ''
  for (var field in payload) {
    if (!payload.hasOwnProperty(field) || field === 'action') continue
    var value = payload[field]
    row[col[field]] = (value === null || value === undefined) ? '' : value
  }
  responseSheet.appendRow(row)

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

  // Recovers the funnel's main conversion for blocker-using visitors. Mirrors
  // the client's own `submit_calc` event, and only fires when that one couldn't.
  gaSendServerEvent_(payload, 'submit_calc', {
    calc_type: String(payload.calcType || ''),
    current_score: Number(payload.currentScore) || 0,
    improved_score: Number(payload.improvedScore) || 0,
  })

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
 * Newsletter sign-up → subscribers tab.
 *
 * ⚠️ The `subscribers` tab holds personal data and is deliberately NOT in
 * SHEET_MAP — same rule as `orders` and `waitlist`. Never add it: doing so
 * would publish the whole mailing list over an unauthenticated GET.
 *
 * Consent is stored as the exact wording shown, with a timestamp. Estonian
 * ESS §103¹ requires prior consent for direct e-marketing, and consent that
 * cannot be evidenced is not consent.
 */
function handleSubscribe(ss, payload) {
  var email = String(payload.email || '').trim().toLowerCase().slice(0, 200)
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: 'invalid email' })
  // No consent, no row. The client requires the checkbox; this is the backstop.
  if (payload.consent !== true) return json({ ok: false, error: 'consent required' })

  var headers = [
    'createdAt', 'email', 'source', 'sessionId', 'env',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'clickId', 'consentText', 'unsubscribed'
  ]

  // Sign-ups can arrive concurrently; without a lock two submissions can both
  // read "not present" and write duplicate rows for the same address.
  var lock = LockService.getScriptLock()
  try {
    lock.waitLock(10000)
  } catch (err) {
    return json({ ok: false, error: 'busy' })
  }

  try {
    var sheet = ss.getSheetByName('subscribers')
    if (!sheet) sheet = ss.insertSheet('subscribers')
    if (sheet.getLastRow() === 0) sheet.appendRow(headers)

    // Already subscribed: succeed quietly rather than creating a duplicate or
    // leaking, via an error, whether an address is on the list.
    var data = sheet.getDataRange().getValues()
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim().toLowerCase() === email) {
        return json({ ok: true, duplicate: true })
      }
    }

    var clickId = payload.fbclid || payload.gclid || payload.ttclid || payload.msclkid || ''

    sheet.appendRow([
      new Date().toISOString(),
      email,
      String(payload.source || '').slice(0, 100),
      String(payload.sessionId || '').slice(0, 50),
      String(payload.env || '').slice(0, 20),
      String(payload.utm_source || '').slice(0, 200),
      String(payload.utm_medium || '').slice(0, 200),
      String(payload.utm_campaign || '').slice(0, 200),
      String(payload.utm_content || '').slice(0, 200),
      String(payload.utm_term || '').slice(0, 200),
      String(clickId).slice(0, 200),
      String(payload.consentText || '').slice(0, 500),
      ''
    ])
    // Mirrors the client's `lead` event for blocked visitors. Inside the lock
    // and after the duplicate check on purpose: a repeat sign-up returns above
    // without reaching here, so re-submitting the same address cannot inflate
    // the conversion count.
    gaSendServerEvent_(payload, 'lead', {
      source: String(payload.source || ''),
    })
    return json({ ok: true })
  } finally {
    lock.releaseLock()
  }
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

  // The UUID stays the unguessable access token (URLs, status endpoint);
  // orderNumber is the short numeric id humans quote (emails, support).
  var orderRef = Utilities.getUuid()
  var orderNumber

  // Lock: sequential numbers must not collide under concurrent checkouts.
  var lock = LockService.getScriptLock()
  try {
    lock.waitLock(10000)
  } catch (err) {
    return json({ ok: false, error: 'busy, try again' })
  }
  try {
    var orders = ss.getSheetByName('orders')
    if (!orders) orders = ss.insertSheet('orders')
    if (orders.getLastRow() === 0) {
      orders.appendRow(['orderRef', 'createdAt', 'status', 'itemsJson', 'total',
        'name', 'email', 'phone', 'shipMethod', 'terminalId', 'terminalName',
        'note', 'transactionId', 'paidAt', 'orderNumber', 'gaMeta'])
    } else {
      if (orders.getRange(1, 15).getValue() !== 'orderNumber') {
        orders.getRange(1, 15).setValue('orderNumber') // migrate pre-existing tab
      }
      // Column 16 appended rather than inserted: setOrderStatus_ and the
      // payment callback address columns positionally, so nothing before it
      // may shift.
      if (orders.getRange(1, 16).getValue() !== 'gaMeta') {
        orders.getRange(1, 16).setValue('gaMeta')
      }
    }

    // Next number = max existing + 1, starting from 1001
    var maxN = 1000
    var vals = orders.getDataRange().getValues()
    for (var r = 1; r < vals.length; r++) {
      var n = parseInt(String(vals[r][14]), 10)
      if (n > maxN) maxN = n
    }
    orderNumber = maxN + 1

    // gaMeta is stored, not acted on, at this point: the purchase only counts
    // once payment is CONFIRMED, and by then the visitor has left for the
    // payment provider and the browser cannot report anything.
    orders.appendRow([
      orderRef, new Date().toISOString(), 'PENDING', JSON.stringify(lines), total,
      name, email, phone, shipMethod, terminalId, terminalName,
      String(payload.note || '').slice(0, 500), '', '', orderNumber,
      JSON.stringify(payload.gaMeta || {})
    ])
  } finally {
    lock.releaseLock()
  }

  try {
    var paymentUrl = createPayment_(orderRef, orderNumber, total, email)
    return json({ ok: true, orderRef: orderRef, orderNumber: orderNumber, paymentUrl: paymentUrl })
  } catch (err) {
    setOrderStatus_(ss, orderRef, 'FAILED', '', '')
    return json({ ok: false, error: 'payment init failed: ' + err.message })
  }
}

/**
 * /aitah polls this: order status + a safe summary (items, total, delivery).
 * The ref is an unguessable UUID and acts as the access token. Name, email
 * and phone are deliberately NOT returned — those live only in the
 * confirmation email.
 */
function handleOrderStatus(e) {
  var ref = String(e.parameter.ref || '').trim()
  if (!ref) return json({ error: 'missing ref' })
  var orders = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders')
  if (!orders) return json({ error: 'not found' })
  var data = orders.getDataRange().getValues()
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) !== ref) continue
    var items = []
    try {
      items = JSON.parse(String(data[i][3])).map(function (l) {
        return { name: l.name, qty: l.qty, price: l.price }
      })
    } catch (err) { /* leave empty on malformed itemsJson */ }
    return json({
      status:       String(data[i][2]),
      orderNumber:  parseInt(String(data[i][14]), 10) || null,
      items:        items,
      total:        Number(data[i][4]) || 0,
      shipMethod:   String(data[i][8]),
      terminalName: String(data[i][10]),
      createdAt:    String(data[i][1]),
      paidAt:       String(data[i][13] || ''),
    })
  }
  return json({ error: 'not found' })
}

/**
 * Buyer self-service status (/tellimus page). Requires BOTH the short order
 * number and the exact buyer email — numbers alone are sequential and
 * guessable, so they unlock nothing by themselves. Returns only the status.
 * The shop owner marks fulfilment by changing a row's status to SHIPPED.
 */
function handleOrderLookup(e) {
  var num = parseInt(String(e.parameter.number || '').replace(/\D/g, ''), 10)
  var email = String(e.parameter.email || '').trim().toLowerCase()
  if (!num || !email) return json({ error: 'missing' })
  var orders = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders')
  if (!orders) return json({ error: 'not found' })
  var data = orders.getDataRange().getValues()
  for (var i = 1; i < data.length; i++) {
    if (parseInt(String(data[i][14]), 10) === num
        && String(data[i][6]).trim().toLowerCase() === email) {
      return json({ status: String(data[i][2]) })
    }
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
function createPayment_(orderRef, orderNumber, total, email) {
  var cfg = mkConfig_()
  if (!cfg.shopId || !cfg.secret) throw new Error('MK credentials not set in Script Properties')

  var selfUrl = ScriptApp.getService().getUrl() // this web app's /exec URL
  var body = {
    transaction: {
      amount: total.toFixed(2),
      currency: 'EUR',
      // The reference is what the buyer sees on the payment page / bank
      // statement (with the shop name) — keep it the short human number.
      // The unguessable UUID rides along in merchant_data for lookups.
      reference: String(orderNumber),
      merchant_data: orderRef,
      transaction_url: {
        // Success: /aitah verifies the order server-side before thanking.
        return_url:        { url: SITE_URL + '/aitah?ref=' + orderRef, method: 'GET' },
        // Cancel: back to checkout with a notice — the cart is still intact.
        cancel_url:        { url: SITE_URL + '/kassa?makse=katkes', method: 'GET' },
        // Authoritative server-to-server result, independent of the user's
        // journey — must hit this web app (the only backend we have).
        notification_url: { url: selfUrl, method: 'POST' },
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
 * notification_url hit this). MAC is verified BEFORE anything else; a bad
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
  // merchant_data carries the UUID; reference is the short human number.
  // Older orders used the UUID as reference, so both are checked.
  var orderRef = String(msg.merchant_data || msg.reference || '').trim()
  var refNumber = parseInt(String(msg.reference || ''), 10) || 0
  var status = String(msg.status || '').toUpperCase()
  var txId = String(msg.transaction || '')
  if (!orderRef && !refNumber) return json({ ok: false, error: 'no reference' })

  var lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    var orders = ss.getSheetByName('orders')
    if (!orders) return json({ ok: false, error: 'no orders tab' })
    var data = orders.getDataRange().getValues()
    for (var i = 1; i < data.length; i++) {
      var uuidMatch = orderRef && String(data[i][0]) === orderRef
      var numberMatch = refNumber && parseInt(String(data[i][14]), 10) === refNumber
      if (!uuidMatch && !numberMatch) continue

      var current = String(data[i][2])
      if (status === 'COMPLETED') {
        if (current === 'PAID') return json({ ok: true }) // duplicate — ignore
        orders.getRange(i + 1, 3).setValue('PAID')
        orders.getRange(i + 1, 13).setValue(txId)
        orders.getRange(i + 1, 14).setValue(new Date().toISOString())
        sendOrderEmails_(data[i], orderRef)
        // After the state change and the emails: a GA failure must never cost
        // an order confirmation. The PAID guard above makes this idempotent —
        // a duplicate callback returns before reaching here, so a retry from
        // the payment provider cannot double-count the purchase.
        gaSendPurchase_(data[i], txId)
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

/**
 * GA4 `purchase` for a confirmed order, using the gaMeta captured at checkout.
 *
 * Unlike the other two paths this is not merely a fallback: the browser can
 * never send it. Payment confirmation arrives as a server-to-server callback
 * while the visitor is on the payment provider's domain, and plenty never
 * return to /aitah at all. gaSendServerEvent_ still gates on gaBlocked, so
 * visitors whose gtag.js works keep reporting purchases from the browser via
 * /aitah and are not counted twice.
 */
function gaSendPurchase_(orderRow, txId) {
  try {
    var meta = {}
    try { meta = JSON.parse(String(orderRow[15] || '{}')) } catch (e) { meta = {} }
    // Orders created before the gaMeta column existed have nothing to send.
    if (!meta || !meta.gaBlocked) return

    var items = []
    try {
      var lines = JSON.parse(String(orderRow[3] || '[]'))
      for (var i = 0; i < lines.length; i++) {
        items.push({
          item_id: String(lines[i].id || ''),
          item_name: String(lines[i].name || lines[i].id || ''),
          price: Number(lines[i].price) || 0,
          quantity: Number(lines[i].qty) || 1,
        })
      }
    } catch (e) { /* items are a nice-to-have; the purchase still counts */ }

    // env lives inside gaMeta for orders — the checkout payload has no
    // top-level env field the way the calculator and newsletter ones do. No
    // default: an order row written before this field existed must not be
    // assumed to be production, or a local checkout test would report a real
    // purchase. gaSendServerEvent_ drops anything that isn't 'prod'.
    gaSendServerEvent_(meta, 'purchase', {
      transaction_id: String(orderRow[14] || txId || ''),
      value: Number(orderRow[4]) || 0,
      currency: 'EUR',
      items: items,
    })
  } catch (err) {
    Logger.log('GA MP purchase failed (ignored): ' + err.message)
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
  // Human-facing id; old rows without one fall back to the short ref.
  var orderNo = parseInt(String(orderRow[14]), 10) || orderRef.slice(0, 8)

  var lines = []
  try {
    JSON.parse(itemsJson).forEach(function (l) {
      lines.push('  ' + l.name + ' × ' + l.qty + ' — ' + (l.price * l.qty).toFixed(2) + ' €')
    })
  } catch (err) { lines.push('  ' + itemsJson) }

  try {
    MailApp.sendEmail(OWNER_EMAIL,
      '💰 Uus tellimus nr ' + orderNo + ' — ' + total + ' €',
      'Uus makstud tellimus:\n\n' + lines.join('\n') +
      '\n\nKokku: ' + total + ' €' +
      '\n\nKlient: ' + name + '\nE-post: ' + email + '\nTelefon: ' + phone +
      '\nTarne: ' + shipMethod + ' — ' + terminalName +
      '\n\nTellimuse nr: ' + orderNo + '\nSisemine viide: ' + orderRef)
  } catch (err) { /* owner alert must not block the callback ack */ }

  try {
    MailApp.sendEmail(email,
      'Sinu tellimus nr ' + orderNo + ' on kinnitatud — Unevalem',
      'Tere, ' + name + '!\n\n' +
      'Aitäh tellimuse eest — makse on kinnitatud.\n\n' +
      'Sinu tellimus:\n' + lines.join('\n') +
      '\nKokku: ' + total + ' €\n\n' +
      'Tarne: ' + terminalName + ' (' + shipMethod + ')\n' +
      'Saadame paki teele ' + DELIVERY_DAYS + ' tööpäeva jooksul — pakiautomaadi koodi saad SMS-iga.\n\n' +
      'Tellimuse number: ' + orderNo + '\n\n' +
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
// GA4 MEASUREMENT PROTOCOL — server-side conversion recovery
//
// Tracker blockers (uBlock Origin, AdGuard, Brave Shields, filtering DNS) do
// not block googletagmanager.com — they answer it with a neutered 200 stub. So
// `window.gtag` still exists as a no-op and every client-side event silently
// disappears. That is 15–30% of visitors, and a higher share of paid traffic
// than organic, so ad optimisation and conversion counts are both distorted.
//
// These visitors still reach this backend: the calculator, newsletter and
// checkout POST first-party, which no blocker touches. So the conversions that
// matter get re-sent to GA4 from here.
//
// ONLY when the client reports it was blocked (`gaBlocked: true`). A visitor
// whose gtag.js loaded normally already sent the event from the browser and
// must not be counted twice.
//
// Script Properties (File → Project properties → Script properties):
//   GA_MEASUREMENT_ID — e.g. G-D921C30JEQ
//   GA_API_SECRET     — GA4 Admin → Data Streams → your stream →
//                       Measurement Protocol API secrets → Create
// Absent either one, every call below is a silent no-op.
// ═══════════════════════════════════════════════════════════════════════════

var GA_MP_ENDPOINT = 'https://www.google-analytics.com/mp/collect'
var GA_MP_DEBUG_ENDPOINT = 'https://www.google-analytics.com/debug/mp/collect'

function gaConfig_() {
  var props = PropertiesService.getScriptProperties()
  return {
    measurementId: props.getProperty('GA_MEASUREMENT_ID'),
    apiSecret: props.getProperty('GA_API_SECRET'),
  }
}

/**
 * Re-send one conversion to GA4. Never throws: analytics must not be able to
 * fail an order, a sign-up or a calculator submission.
 *
 * `meta` carries what the client observed — gaBlocked, gaClientId,
 * gaSessionId, analyticsConsent, adsConsent, env, sessionId. For orders it is
 * the `gaMeta` object stored on the row at checkout; for the other paths the
 * payload itself carries those fields.
 */
function gaSendServerEvent_(meta, eventName, params) {
  try {
    if (!meta) return
    // Review builds (localhost) must not pollute the property.
    if (String(meta.env || '') !== 'prod') return
    // The browser sent this already — re-sending would double-count.
    if (meta.gaBlocked !== true) return
    // An explicit analytics opt-out applies to server-side sends too. Undefined
    // means the field predates this feature, not that consent was refused —
    // analytics is opt-out on this site, so absence is treated as granted.
    if (meta.analyticsConsent === false) return

    var cfg = gaConfig_()
    if (!cfg.measurementId || !cfg.apiSecret) return

    // A blocked visitor has no _ga cookie — gtag.js never ran to write one — so
    // this is nearly always the uva-sid fallback. That means the conversion is
    // counted under a synthetic user that cannot be joined to a web session.
    // A counted conversion under a synthetic user beats a lost one.
    var clientId = String(meta.gaClientId || meta.sessionId || '').trim()
    if (!clientId) return

    var eventParams = params || {}
    // GA4 discards events with no engagement time; 1ms is the documented
    // minimum for server-sent events that should still count as engaged.
    eventParams.engagement_time_msec = 1
    if (meta.gaSessionId) eventParams.session_id = String(meta.gaSessionId)

    var body = {
      client_id: clientId,
      non_personalized_ads: meta.adsConsent !== true,
      events: [{ name: eventName, params: eventParams }],
    }

    UrlFetchApp.fetch(gaMpUrl_(GA_MP_ENDPOINT, cfg), {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(body),
      muteHttpExceptions: true,
    })
  } catch (err) {
    Logger.log('GA MP send failed (ignored): ' + err.message)
  }
}

function gaMpUrl_(base, cfg) {
  return base +
    '?measurement_id=' + encodeURIComponent(cfg.measurementId) +
    '&api_secret=' + encodeURIComponent(cfg.apiSecret)
}

// ═══════════════════════════════════════════════════════════════════════════
// ONE-TIME ADMIN HELPERS — run manually from the Apps Script editor
// (select the function in the toolbar dropdown → Run). Not reachable over
// the web app; they exist so sheet setup doesn't require hand-pasting.
// ═══════════════════════════════════════════════════════════════════════════

var REPO_RAW = 'https://raw.githubusercontent.com/wargunnerguy/unevalem/main'

/**
 * Verifies the Measurement Protocol setup without waiting for a real
 * conversion. Run it from the editor and read the log.
 *
 * Sends to GA4's /debug/mp/collect, which VALIDATES ONLY — it never records an
 * event, so this cannot pollute reports. An empty validationMessages array
 * means the payload and credentials are good; anything else names the problem.
 *
 * Then sends one real `submit_calc` with client_id "mp-debug-ping" so you can
 * watch it land in GA4 → Admin → DebugView. Delete nothing afterwards: one
 * synthetic conversion is not worth the effort of filtering out.
 */
function gaDebugPing() {
  var cfg = gaConfig_()
  if (!cfg.measurementId || !cfg.apiSecret) {
    Logger.log('MISSING Script Properties: set GA_MEASUREMENT_ID and GA_API_SECRET')
    return
  }

  var body = {
    client_id: 'mp-debug-ping',
    events: [{ name: 'submit_calc', params: { calc_type: 'debug', engagement_time_msec: 1 } }],
  }

  var validation = UrlFetchApp.fetch(gaMpUrl_(GA_MP_DEBUG_ENDPOINT, cfg), {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  })
  Logger.log('validation response: ' + validation.getContentText())

  var live = UrlFetchApp.fetch(gaMpUrl_(GA_MP_ENDPOINT, cfg), {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  })
  // A real MP send always answers 204 with an empty body, even for a payload
  // GA will silently discard — which is exactly why the validation call above
  // is the one that tells you anything.
  Logger.log('live send status: ' + live.getResponseCode() + ' (204 expected)')
}

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
 * Seeds the `calculators` and `calc_questions` tabs from
 * scripts/calculators-import.tsv in the repo — the questions exactly as they
 * were when they lived in utils/copy.ts. Run this ONCE, when moving the
 * calculator into Sheets; after that the sheet is the source of truth and
 * re-running would overwrite whatever has been edited since.
 *
 * The `answerKey` column and the value half of each option (`Label|value`) are
 * the contract with the recommendation engine. Edit the labels and the question
 * text freely; changing a value or an answerKey fails the next build with a
 * message naming the offending row, which is deliberate — a silent mismatch
 * would leave the engine ignoring that answer for everyone.
 */
function importCalculators() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  if (ss.getSheetByName('calculators') || ss.getSheetByName('calc_questions')) {
    Logger.log('ABORTED: calculators/calc_questions already exist. Delete them by hand ' +
      'first if you really mean to reseed — this would overwrite your edits.')
    return
  }

  var tsv = UrlFetchApp.fetch(REPO_RAW + '/scripts/calculators-import.tsv').getContentText()
  var metaRows = []
  var questionRows = []
  var section = ''

  var lines = tsv.split('\n')
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].replace(/\r$/, '')
    if (!line.trim()) continue
    if (line.indexOf('### TAB: calculators') === 0)    { section = 'meta';      continue }
    if (line.indexOf('### TAB: calc_questions') === 0) { section = 'questions'; continue }
    if (line.indexOf('#') === 0) continue
    var parts = line.split('\t')
    if (section === 'meta')      metaRows.push([parts[0], parts[1], parts[2], parts[3], parts[4] === 'TRUE'])
    if (section === 'questions') questionRows.push([parts[0], Number(parts[1]), parts[2], parts[3], parts[4]])
  }

  if (!metaRows.length || !questionRows.length) {
    Logger.log('ABORTED: parsed ' + metaRows.length + ' calculators and ' +
      questionRows.length + ' questions — expected both to be non-empty')
    return
  }

  var meta = ss.insertSheet('calculators')
  meta.appendRow(['id', 'icon', 'title', 'description', 'active'])
  meta.getRange(2, 1, metaRows.length, 5).setValues(metaRows)

  var qs = ss.insertSheet('calc_questions')
  qs.appendRow(['calcId', 'order', 'answerKey', 'question', 'options'])
  qs.getRange(2, 1, questionRows.length, 5).setValues(questionRows)
  qs.setFrozenRows(1)
  meta.setFrozenRows(1)

  Logger.log('Seeded ' + metaRows.length + ' calculators and ' + questionRows.length + ' questions.')
  Logger.log('Edit the `question` column and the label half of `options` freely. ' +
    'Do NOT edit `answerKey` or the value after the "|" — the build will reject it.')
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
      'note', 'transactionId', 'paidAt', 'orderNumber'])
    Logger.log('created orders tab')
  } else if (orders.getRange(1, 15).getValue() !== 'orderNumber') {
    orders.getRange(1, 15).setValue('orderNumber')
    Logger.log('orders: added orderNumber column')
  }

  var props = PropertiesService.getScriptProperties()
  if (!props.getProperty('MK_SHOP_ID')) {
    Logger.log('REMINDER: set Script Properties MK_SHOP_ID, MK_SECRET_KEY, MK_ENV=test ' +
      '(Project Settings → Script properties) before testing checkout')
  }
}

// ── Calculator response column cleanup ──────────────────────────────────────
//
// Each *_responses tab used to receive all eighteen answer fields regardless of
// which calculator wrote the row, because the client sent every key with '' for
// the ones that calculator never asks. handleCalcSubmit creates a column for
// any key it sees, so an always-empty field became an always-blank column —
// ten per tab.
//
// The client now sends only the active calculator's stepKeys, so those columns
// are dead and can go. ORDER MATTERS: deploy the site first. Deleting while the
// old code is still live only makes the next submission recreate them.
//
// Only *_responses tabs are ever touched. `orders` is addressed positionally by
// setOrderStatus_ and handlePaymentCallback — deleting a column there would
// silently corrupt every subsequent order — and `subscribers`, `waitlist` and
// the content tabs are none of this function's business.

var CALC_RESPONSE_TABS = ['pillow_responses', 'blanket_responses', 'mattress_responses']

/**
 * Columns that are legitimately blank most of the time and must survive the
 * sweep. Attribution fields only populate for visitors who arrived tagged, so
 * a young sheet can show them empty across every row without them being dead.
 */
var CALC_KEEP_COLUMNS = [
  'completedAt', 'sessionId', 'env', 'calcType', 'prefilledFrom',
  'rec0', 'currentScore', 'improvedScore',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'last_utm_source', 'last_utm_medium', 'last_utm_campaign',
  'last_utm_content', 'last_utm_term',
  'fbclid', 'gclid', 'ttclid', 'firstTouchAt',
  'gaBlocked', 'gaClientId', 'gaSessionId', 'analyticsConsent', 'adsConsent'
]

/**
 * DRY RUN — reports which columns would be deleted, changes nothing.
 * Run this first, read the log, then run deleteEmptyCalcColumns().
 */
function reportEmptyCalcColumns() {
  scanCalcColumns_(false)
}

/**
 * Deletes the columns reportEmptyCalcColumns() lists. Re-runnable: a second run
 * finds nothing. If a column comes back after this, the client is still sending
 * that key — fix the site, don't re-run.
 */
function deleteEmptyCalcColumns() {
  scanCalcColumns_(true)
}

function scanCalcColumns_(destructive) {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var totalRemoved = 0

  for (var t = 0; t < CALC_RESPONSE_TABS.length; t++) {
    var name = CALC_RESPONSE_TABS[t]
    var tab = ss.getSheetByName(name)
    if (!tab) { Logger.log(name + ': not present, skipped'); continue }

    var lastRow = tab.getLastRow()
    var lastCol = tab.getLastColumn()
    if (lastCol === 0) { Logger.log(name + ': empty tab, skipped'); continue }
    if (lastRow < 2) {
      Logger.log(name + ': header only, no data rows — nothing can be judged empty yet, skipped')
      continue
    }

    var headers = tab.getRange(1, 1, 1, lastCol).getValues()[0]
    var data = tab.getRange(2, 1, lastRow - 1, lastCol).getValues()

    // Collect first, delete after: deleting shifts every column to its right.
    var doomed = []
    for (var c = 0; c < lastCol; c++) {
      var header = String(headers[c]).trim()
      if (!header) continue
      if (CALC_KEEP_COLUMNS.indexOf(header) !== -1) continue

      var hasValue = false
      for (var r = 0; r < data.length; r++) {
        var cell = data[r][c]
        if (cell !== '' && cell !== null && cell !== undefined) { hasValue = true; break }
      }
      if (!hasValue) doomed.push({ index: c + 1, header: header })
    }

    if (!doomed.length) {
      Logger.log(name + ': nothing to remove (' + (lastRow - 1) + ' rows checked)')
      continue
    }

    var names = doomed.map(function (d) { return d.header })
    Logger.log(name + ': ' + doomed.length + ' empty column(s) across ' +
      (lastRow - 1) + ' rows → ' + names.join(', '))

    if (destructive) {
      // Right to left, so each deletion leaves the remaining indices valid.
      for (var d = doomed.length - 1; d >= 0; d--) tab.deleteColumn(doomed[d].index)
      totalRemoved += doomed.length
    }
  }

  Logger.log(destructive
    ? 'Removed ' + totalRemoved + ' column(s). Re-run reportEmptyCalcColumns() to confirm none return.'
    : 'DRY RUN — nothing was changed. Run deleteEmptyCalcColumns() to apply.')
}
