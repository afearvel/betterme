/**
 * Prueba en un Chromium real: migración v4 → v5 y el recorrido completo del
 * patrimonio por la interfaz, a 390 px (el ancho de un iPhone).
 *
 * Cómo correrla:
 *   npm run build                              deja la app compilada en dist/
 *   npm i -D playwright                        pesa mucho; por eso NO va en package.json
 *   npx playwright install chromium
 *   cp node_modules/dexie/dist/dexie.mjs dist/dexie.mjs
 *   node prueba-navegador.mjs
 *
 * Esa copia de dexie.mjs es solo para la prueba: le sirve para sembrar a mano
 * una base vieja y para leer la base sin pasar por la interfaz.
 */
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const TIPOS = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript',
  '.css':'text/css', '.json':'application/json', '.webmanifest':'application/manifest+json',
  '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon' }

const server = createServer(async (req, res) => {
  let ruta = decodeURIComponent(req.url.split('?')[0])
  if (ruta === '/') ruta = '/index.html'
  // Página vacía del MISMO origen para sembrar la base vieja sin que la app
  // esté cargada. Si la sembraras desde index.html, la app ya tiene su propia
  // conexión abierta a IndexedDB y las dos se pelean: a veces la app alcanza a
  // recrear la base en la versión nueva y la migración ya no tiene nada que
  // migrar. Con esta página no hay nadie más conectado.
  if (ruta === '/sembrar.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<!doctype html><meta charset="utf-8"><title>sembrar</title><body>')
    return
  }
  try {
    const buf = await readFile(join('/tmp/bm/dist', ruta))
    res.writeHead(200, { 'Content-Type': TIPOS[extname(ruta)] ?? 'application/octet-stream' })
    res.end(buf)
  } catch { res.writeHead(404); res.end('no') }
})
await new Promise((r) => server.listen(4173, r))
const BASE = 'http://localhost:4173'

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
page.on('pageerror', (e) => console.log('  [error de la página]', e.message))
// Bloquear el service worker: si no, sirve la versión vieja en caché.
await page.route('**/sw.js', (r) => r.fulfill({ status: 404, body: '' }))
await page.route('**/registerSW.js', (r) => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }))

let fallos = 0
const check = (nombre, cond, extra = '') => {
  console.log(cond ? '  ✓ ' + nombre : '  ✗ ' + nombre + '  ' + extra)
  if (!cond) fallos++
}
const num = (s) => Number(String(s).replace(/[^\d-]/g, ''))
const hoja = () => page.getByRole('dialog')

/** Lee un número de la tarjeta de patrimonio por su etiqueta. */
const valorDe = (etiqueta) =>
  page.locator(`p:text-is("${etiqueta}")`).first().locator('xpath=following-sibling::p[1]').innerText()

const estadoDeLaBase = () => page.evaluate(async () => {
  const { default: Dexie } = await import('/dexie.mjs')
  const db = new Dexie('betterme'); await db.open()
  const goals = await db.table('goals').toArray()
  const tx = await db.table('transactions').toArray()
  const moves = await db.table('goalMoves').toArray()
  const st = await db.table('settings').get('general')
  db.close()
  const total = (st?.initialBalance ?? 0)
    + tx.filter((t) => t.type === 'ingreso').reduce((a, t) => a + t.amount, 0)
    - tx.filter((t) => t.type === 'gasto').reduce((a, t) => a + t.amount, 0)
  const apartado = goals.reduce((a, g) => a + g.saved, 0)
  return { goals, tx, moves, total, apartado, libre: total - apartado }
})

/* ------------------------------------------- 1. migrar una base v4 con datos */
console.log('\nMigración de una base v4 que ya tenía datos')
await page.goto(BASE + '/sembrar.html')
await page.evaluate(async () => {
  const { default: Dexie } = await import('/dexie.mjs')
  await Dexie.delete('betterme')
  const db = new Dexie('betterme')
  db.version(1).stores({ transactions: 'id, date, type, envelopeId, updatedAt', envelopes: 'id, kind, order, updatedAt', goals: 'id, order, updatedAt', settings: 'key' })
  db.version(2).stores({ habits: 'id, active, order, updatedAt', cycles: 'id, order, updatedAt', routines: 'id, cycleId, order, updatedAt', checks: 'id, date, targetId, kind, [targetId+date], updatedAt' })
  db.version(3).stores({ todos: 'id, done, importance, since, snoozeUntil, doneAt, updatedAt' })
  db.version(4).stores({ blocks: 'id, date, repite, start, updatedAt', blockDays: 'id, blockId, date, movedTo, [blockId+date], updatedAt', intentions: 'id, date, done, order, [date+order], updatedAt' })
  await db.open()
  await db.settings.put({ key: 'general', monthlyIncome: 20000, monthlySavings: 2000, useRealIncome: false, updatedAt: 'x' })
  await db.goals.add({ id: 'vieja', name: 'Meta vieja', target: 30000, saved: 12000, deadline: null, order: 0, updatedAt: 'x' })
  await db.transactions.add({ id: 't1', amount: 5000, type: 'ingreso', envelopeId: null, note: 'sueldo', date: '2026-08-01', createdAt: 'x', updatedAt: 'x' })
  await db.todos.add({ id: 'td1', name: 'Pendiente viejo', importance: 'normal', since: '2026-08-01', snoozeUntil: null, done: 0, doneAt: null, order: 0, updatedAt: 'x' })
  db.close()
})

// OJO: cambiar solo el hash NO recarga la página (HashRouter), así que la app
// nunca volvería a abrir la base y la migración no correría. Hay que forzar
// una navegación de verdad con reload().
await page.goto(BASE + '/index.html#/finanzas')
await page.reload()
await page.waitForSelector('text=Tu dinero', { timeout: 15000 })
// Esperar activamente a que la migración termine de escribir la bitácora en
// vez de adivinar con un timeout: en un teléfono lento tarda más.
await page.waitForFunction(async () => {
  const { default: Dexie } = await import('/dexie.mjs')
  try {
    const db = new Dexie('betterme'); await db.open()
    const n = await db.table('goalMoves').count()
    db.close()
    return n > 0
  } catch { return false }
}, null, { timeout: 15000 }).catch(() => {})
const tras = await page.evaluate(async () => {
  const req = indexedDB.open('betterme')
  const idb = await new Promise((res) => { req.onsuccess = () => res(req.result) })
  const version = idb.version; const stores = [...idb.objectStoreNames]; idb.close()
  const { default: Dexie } = await import('/dexie.mjs')
  const db = new Dexie('betterme'); await db.open()
  const out = { version, stores,
    goals: await db.table('goals').toArray(), moves: await db.table('goalMoves').toArray(),
    todos: await db.table('todos').toArray(), tx: await db.table('transactions').toArray(),
    settings: await db.table('settings').get('general') }
  db.close(); return out
})
check('IndexedDB subió a la versión 50 (Dexie la guarda por diez)', tras.version === 50, `dio ${tras.version}`)
check('existe la tabla nueva goalMoves', tras.stores.includes('goalMoves'))
check('la meta vieja conserva sus 12,000', tras.goals[0]?.saved === 12000)
check('el pendiente viejo sigue ahí', tras.todos.length === 1)
check('el ingreso viejo sigue ahí', tras.tx.length === 1)
check('los ajustes viejos siguen ahí', tras.settings?.monthlyIncome === 20000, JSON.stringify(tras.settings))
check('se le sembró su primer abono a la meta vieja', tras.moves.length === 1 && tras.moves[0].amount === 12000, JSON.stringify(tras.moves))
check('y quedó marcado como abono', tras.moves[0]?.kind === 'abono')
check('el saldo inicial arranca en cero, sin inventar dinero', (tras.settings?.initialBalance ?? 0) === 0)

/* -------------------------------- 2. el caso de 60,000 con 50,000 apartados */
console.log('\nEl caso que planteaste, por la interfaz')
await page.goto(BASE + '/sembrar.html')
await page.evaluate(async () => {
  const { default: Dexie } = await import('/dexie.mjs')
  await Dexie.delete('betterme')
})
await page.goto(BASE + '/index.html#/ajustes')
await page.reload()
await page.waitForSelector('text=Dinero que ya tenías')
await page.locator('input[inputmode="numeric"]').first().fill('60000')
await page.getByRole('button', { name: 'Guardar saldo inicial' }).click()
await page.waitForTimeout(500)

await page.goto(BASE + '/index.html#/finanzas')
await page.waitForSelector('text=Tu dinero')
await page.waitForTimeout(400)
check('el total muestra los 60,000', num(await valorDe('Tu dinero')) === 60000, await valorDe('Tu dinero'))

// Meta 1 — apartar 50,000
await page.getByRole('button', { name: 'Nueva meta' }).click()
await hoja().getByPlaceholder('Laptop nueva').fill('Ahorro')
await hoja().getByPlaceholder('25000').fill('80000')
await hoja().getByPlaceholder('0', { exact: true }).fill('50000')
await hoja().getByRole('button', { name: 'Crear meta' }).click()
await page.waitForTimeout(700)
check('el total NO cambió: apartar no gasta', num(await valorDe('Tu dinero')) === 60000, await valorDe('Tu dinero'))
check('aparecen 50,000 apartados', num(await valorDe('Apartado en metas')) === 50000, await valorDe('Apartado en metas'))
check('y 10,000 libres', num(await valorDe('Libre')) === 10000, await valorDe('Libre'))

// Meta 2 — intentar apartar 20,000 teniendo solo 10,000
await page.getByRole('button', { name: 'Nueva meta' }).click()
await hoja().getByPlaceholder('Laptop nueva').fill('Laptop')
await hoja().getByPlaceholder('25000').fill('25000')
await hoja().getByPlaceholder('0', { exact: true }).fill('20000')
await page.waitForTimeout(300)
check('avisa que no puedes apartar más de lo que tienes',
  await hoja().locator('text=/Te faltan/').first().isVisible())
check('y bloquea el botón de crear',
  await hoja().getByRole('button', { name: 'Crear meta' }).isDisabled())

await hoja().getByPlaceholder('0', { exact: true }).fill('4000')
await page.waitForTimeout(300)
check('al bajarlo a algo que sí cabe, se desbloquea',
  !(await hoja().getByRole('button', { name: 'Crear meta' }).isDisabled()))
await hoja().getByRole('button', { name: 'Crear meta' }).click()
await page.waitForTimeout(700)
check('con la segunda meta quedan 6,000 libres', num(await valorDe('Libre')) === 6000, await valorDe('Libre'))
check('el total sigue intacto en 60,000', num(await valorDe('Tu dinero')) === 60000)

/* -------------------------- 3. un gasto que se pasa del dinero libre */
console.log('\nUn gasto de 15,000 teniendo solo 6,000 libres')
await page.locator('input[aria-label="Monto"]').first().fill('15000')
await page.getByRole('button', { name: /^Registrar$/ }).click()
await page.waitForTimeout(600)
check('sube la hoja de aviso', await page.locator('text=Ese gasto no cabe').isVisible())
check('dice cuánto falta', await hoja().locator('text=Te falta').first().isVisible())
const btnRegistrar = hoja().getByRole('button', { name: /Registrar el gasto/ })
check('el botón de registrar arranca bloqueado', await btnRegistrar.isDisabled())
check('ofrece de qué meta sacarlo', await hoja().locator('text=¿De qué meta lo saco?').isVisible())
check('el gasto todavía NO se guardó', (await estadoDeLaBase()).tx.length === 0)

// La chica no alcanza sola: se queda abierta pidiendo el resto
await hoja().locator('button:has-text("Laptop")').click()
await page.waitForTimeout(700)
check('tras sacar de la meta chica, sigue pidiendo el resto',
  await hoja().locator('text=Te falta').first().isVisible())
await hoja().locator('button:has-text("Ahorro")').click()
await page.waitForTimeout(700)
check('cuando ya cabe, lo dice', await hoja().locator('text=Ya cabe').isVisible())
check('y el botón se enciende solo', !(await btnRegistrar.isDisabled()))
await btnRegistrar.click()
await page.waitForTimeout(900)

const e = await estadoDeLaBase()
check('el gasto quedó registrado', e.tx.length === 1 && e.tx[0].amount === 15000, JSON.stringify(e.tx.map(t=>t.amount)))
check('el total bajó a 45,000', e.total === 45000, String(e.total))
check('quedan 45,000 apartados (50,000 + 4,000 − 9,000)', e.apartado === 45000, String(e.apartado))
check('el dinero libre quedó en 0, nunca en negativo', e.libre === 0, String(e.libre))
check('los dos retiros quedaron en la bitácora', e.moves.filter(m=>m.kind==='retiro').length === 2)

/* ------------------------------------------------ 4. usar una meta */
console.log('\nUsar una meta: ya compré la cosa')
await page.reload()
await page.waitForSelector('text=Tu dinero')
await page.waitForTimeout(400)
await page.locator('button:has-text("Mover")').first().click()
await page.waitForTimeout(500)
await hoja().getByRole('button', { name: 'Usar' }).click()
await page.waitForTimeout(500)
const btnUsar = hoja().getByRole('button', { name: /Gastar .* de la meta/ })
check('propone gastar todo lo apartado', await btnUsar.isVisible())
await btnUsar.click()
await page.waitForTimeout(900)
const f = await estadoDeLaBase()
check('quedó un gasto nuevo', f.tx.length === 2, JSON.stringify(f.tx.map(t=>t.amount)))
check('el total bajó a 0', f.total === 0, String(f.total))
check('la meta quedó vacía', f.apartado === 0, String(f.apartado))
check('quedó anotado como "uso" en la bitácora', f.moves.filter(m=>m.kind==='uso').length === 1)

/* ------------------------------------- 5. borrar una meta devuelve el dinero */
console.log('\nBorrar una meta con dinero adentro')
await page.evaluate(async () => {
  const { default: Dexie } = await import('/dexie.mjs')
  const db = new Dexie('betterme'); await db.open()
  await db.table('settings').update('general', { initialBalance: 20000 })
  await db.table('transactions').clear()
  await db.table('goals').clear()
  await db.table('goalMoves').clear()
  await db.table('goals').add({ id: 'x1', name: 'Prueba', target: 10000, saved: 8000, deadline: null, order: 0, updatedAt: 'x' })
  db.close()
})
await page.reload()
await page.waitForSelector('text=Tu dinero')
await page.waitForTimeout(500)
check('antes de borrar hay 12,000 libres', num(await valorDe('Libre')) === 12000, await valorDe('Libre'))
await page.locator('button:has-text("Mover")').first().click()
await page.waitForTimeout(400)
await hoja().getByRole('button', { name: /Editar nombre/ }).click()
await page.waitForTimeout(300)
check('avisa que el dinero vuelve a ser libre',
  await hoja().locator('text=/vuelven a ser dinero libre/').isVisible())
await hoja().getByRole('button', { name: 'Borrar meta' }).click()
await page.waitForTimeout(800)
check('al borrarla, los 8,000 vuelven a libre', num(await valorDe('Libre')) === 20000, await valorDe('Libre'))

/* ------------------------------------------------------------- 6. fotos */
await page.evaluate(async () => {
  const { default: Dexie } = await import('/dexie.mjs')
  const db = new Dexie('betterme'); await db.open()
  await db.table('settings').update('general', { initialBalance: 58000, monthlyIncome: 22000, monthlySavings: 3000 })
  await db.table('transactions').bulkPut([
    { id:'a', amount: 22000, type:'ingreso', envelopeId:null, note:'Sueldo', date:'2026-08-01', createdAt:'2026-08-01', updatedAt:'x' },
    { id:'b', amount: 8500, type:'gasto', envelopeId:null, note:'Renta', date:'2026-08-02', createdAt:'2026-08-02', updatedAt:'x' },
    { id:'c', amount: 1500, type:'gasto', envelopeId:null, note:'Súper', date:'2026-08-10', createdAt:'2026-08-10', updatedAt:'x' },
  ])
  await db.table('goals').bulkPut([
    { id:'g1', name:'Fondo de emergencia', target: 60000, saved: 40000, deadline:null, order:0, updatedAt:'x' },
    { id:'g2', name:'Laptop nueva', target: 25000, saved: 12000, deadline:'2026-12-01', order:1, updatedAt:'x' },
    { id:'g3', name:'Viaje', target: 15000, saved: 5000, deadline:null, order:2, updatedAt:'x' },
  ])
  db.close()
})
await page.reload()
await page.waitForSelector('text=Tu dinero')
await page.waitForTimeout(800)
await page.screenshot({ path: '/tmp/bm/foto-dinero.png' })
await page.goto(BASE + '/index.html#/patrimonio')
await page.waitForTimeout(900)
await page.screenshot({ path: '/tmp/bm/foto-patrimonio.png', fullPage: true })
await page.goto(BASE + '/index.html#/finanzas')
await page.waitForTimeout(600)
await page.locator('button:has-text("Mover")').first().click()
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/bm/foto-meta.png' })
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
await page.locator('input[aria-label="Monto"]').first().fill('20000')
await page.getByRole('button', { name: /^Registrar$/ }).click()
await page.waitForTimeout(700)
await page.screenshot({ path: '/tmp/bm/foto-sobregiro.png' })

console.log(fallos === 0 ? '\nTODO BIEN\n' : `\n${fallos} FALLAS\n`)
await browser.close()
server.close()
process.exit(fallos === 0 ? 0 : 1)
