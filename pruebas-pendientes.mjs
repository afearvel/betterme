/**
 * Pruebas de la lógica de pendientes. No es un framework: es un archivo que
 * corres con `node pruebas-pendientes.mjs` y te dice qué falla.
 */
import assert from 'node:assert/strict'
import {
  diasEsperando, textoEspera, estaPospuesto, estaEsperando, yaHecho,
  importanciaDe, pesoImportancia, ordenarPendientes, separarPendientes,
  agruparPorImportancia, resumenPendientes, textoRegreso, fechaPosponer,
  sugiereSoltar, hechosViejos, DIAS_PARA_SOLTAR,
} from './src/lib/todos.js'
import { addDays } from './src/lib/format.js'

let ok = 0
const test = (nombre, fn) => {
  try { fn(); ok++; console.log('  ✓', nombre) }
  catch (e) { console.log('  ✗', nombre, '\n     ', e.message); process.exitCode = 1 }
}

// Todas las pruebas fijan "hoy" a mano. Nunca dependen del reloj de la
// computadora: si no, mañana fallarían solas.
const HOY = '2026-08-15'
const hace = (n) => addDays(HOY, -n)

const p = (extra = {}) => ({
  id: extra.id ?? 'p1',
  name: extra.name ?? 'Algo',
  importance: 'normal',
  since: HOY,
  snoozeUntil: null,
  done: 0,
  doneAt: null,
  ...extra,
})

console.log('\nAntigüedad')
test('recién anotado son 0 días', () => assert.equal(diasEsperando(p(), HOY), 0))
test('cuenta desde la fecha since', () =>
  assert.equal(diasEsperando(p({ since: hace(12) }), HOY), 12))
test('una fecha en el futuro no da negativos', () =>
  assert.equal(diasEsperando(p({ since: addDays(HOY, 5) }), HOY), 0))
test('sin since no truena: cuenta como hoy', () =>
  assert.equal(diasEsperando({ name: 'x' }, HOY), 0))
test('cruza meses y años bien', () => {
  assert.equal(diasEsperando(p({ since: '2026-07-15' }), HOY), 31)
  assert.equal(diasEsperando(p({ since: '2025-08-15' }), HOY), 365)
})

console.log('\nTexto de la espera (nunca dice "atrasado")')
test('los textos son los esperados', () => {
  assert.equal(textoEspera(0), 'Anotado hoy')
  assert.equal(textoEspera(1), 'Desde ayer')
  assert.equal(textoEspera(4), 'Lleva 4 días aquí')
  assert.equal(textoEspera(9), 'Lleva una semana aquí')
  assert.equal(textoEspera(21), 'Lleva 3 semanas aquí')
  assert.equal(textoEspera(40), 'Lleva un mes aquí')
  assert.equal(textoEspera(90), 'Lleva 3 meses aquí')
})
test('ninguna variante regaña', () => {
  const prohibidas = ['atrasad', 'vencid', 'tarde', 'retraso', 'debiste', 'urgente']
  for (let d = 0; d <= 400; d++) {
    const t = textoEspera(d).toLowerCase()
    for (const mala of prohibidas) assert.ok(!t.includes(mala), `día ${d}: "${t}"`)
  }
})

console.log('\nPosponer')
test('mientras la fecha sea futura, está escondido', () => {
  assert.equal(estaPospuesto(p({ snoozeUntil: addDays(HOY, 1) }), HOY), true)
  assert.equal(estaEsperando(p({ snoozeUntil: addDays(HOY, 1) }), HOY), false)
})
test('el día que llega, vuelve solo a la bandeja', () => {
  assert.equal(estaPospuesto(p({ snoozeUntil: HOY }), HOY), false)
  assert.equal(estaEsperando(p({ snoozeUntil: HOY }), HOY), true)
})
test('una fecha ya pasada tampoco esconde nada', () =>
  assert.equal(estaPospuesto(p({ snoozeUntil: hace(3) }), HOY), false))
test('sin snoozeUntil no está pospuesto', () =>
  assert.equal(estaPospuesto(p(), HOY), false))
test('fechaPosponer suma los días a hoy', () => {
  assert.equal(fechaPosponer(1, HOY), '2026-08-16')
  assert.equal(fechaPosponer(30, HOY), '2026-09-14')
})
test('el texto de regreso', () => {
  assert.equal(textoRegreso(p({ snoozeUntil: addDays(HOY, 1) }), HOY), 'Vuelve mañana')
  assert.equal(textoRegreso(p({ snoozeUntil: addDays(HOY, 5) }), HOY), 'Vuelve en 5 días')
  assert.equal(textoRegreso(p({ snoozeUntil: addDays(HOY, 90) }), HOY), 'Vuelve en 3 meses')
})
test('posponer NO reinicia desde cuándo espera', () => {
  const t = p({ since: hace(20), snoozeUntil: addDays(HOY, 7) })
  assert.equal(diasEsperando(t, HOY), 20)
})

console.log('\nImportancia')
test('los pesos ordenan alta, normal, baja', () => {
  assert.ok(pesoImportancia('alta') < pesoImportancia('normal'))
  assert.ok(pesoImportancia('normal') < pesoImportancia('baja'))
})
test('un valor raro o ausente cae en normal y NO desaparece', () => {
  assert.equal(importanciaDe({ importance: 'altisima' }), 'normal')
  assert.equal(importanciaDe({}), 'normal')
  assert.equal(pesoImportancia(undefined), pesoImportancia('normal'))
  const grupos = agruparPorImportancia([p({ id: 'a', importance: 'inventada' })])
  assert.equal(grupos.length, 1)
  assert.equal(grupos[0].id, 'normal')
  assert.equal(grupos[0].items.length, 1)
})

console.log('\nOrden de la bandeja')
test('la importancia manda sobre la antigüedad', () => {
  const lista = [
    p({ id: 'viejoBajo', importance: 'baja', since: hace(100) }),
    p({ id: 'nuevoAlto', importance: 'alta', since: HOY }),
  ]
  assert.deepEqual(ordenarPendientes(lista, HOY).map((t) => t.id), ['nuevoAlto', 'viejoBajo'])
})
test('dentro del mismo nivel, lo más viejo va arriba', () => {
  const lista = [
    p({ id: 'nuevo', since: hace(1) }),
    p({ id: 'viejo', since: hace(30) }),
    p({ id: 'medio', since: hace(10) }),
  ]
  assert.deepEqual(ordenarPendientes(lista, HOY).map((t) => t.id), ['viejo', 'medio', 'nuevo'])
})
test('empate total se desempata por nombre, no al azar', () => {
  const lista = [p({ id: 'b', name: 'Zapatos' }), p({ id: 'a', name: 'Agua' })]
  assert.deepEqual(ordenarPendientes(lista, HOY).map((t) => t.id), ['a', 'b'])
})
test('ordenar no modifica el arreglo original (viene de Dexie)', () => {
  const lista = [p({ id: 'x', since: hace(1) }), p({ id: 'y', since: hace(9) })]
  const copia = [...lista]
  ordenarPendientes(lista, HOY)
  assert.deepEqual(lista, copia)
})

console.log('\nLas tres secciones de la pantalla')
{
  const lista = [
    p({ id: 'esperando', since: hace(5) }),
    p({ id: 'pospuesto', snoozeUntil: addDays(HOY, 3) }),
    p({ id: 'hecho', done: 1, doneAt: hace(1) }),
  ]
  const { activos, pospuestos, hechos } = separarPendientes(lista, HOY)

  test('cada uno cae en su sección', () => {
    assert.deepEqual(activos.map((t) => t.id), ['esperando'])
    assert.deepEqual(pospuestos.map((t) => t.id), ['pospuesto'])
    assert.deepEqual(hechos.map((t) => t.id), ['hecho'])
  })
  test('un hecho pospuesto sigue contando como hecho', () => {
    const raro = [p({ id: 'r', done: 1, doneAt: HOY, snoozeUntil: addDays(HOY, 9) })]
    assert.deepEqual(separarPendientes(raro, HOY).hechos.map((t) => t.id), ['r'])
  })
  test('los hechos salen del más reciente al más viejo', () => {
    const h = [
      p({ id: 'ayer', done: 1, doneAt: hace(1) }),
      p({ id: 'hoy', done: 1, doneAt: HOY }),
      p({ id: 'semana', done: 1, doneAt: hace(7) }),
    ]
    assert.deepEqual(separarPendientes(h, HOY).hechos.map((t) => t.id), ['hoy', 'ayer', 'semana'])
  })
  test('los pospuestos salen por el que vuelve primero', () => {
    const s = [
      p({ id: 'lejos', snoozeUntil: addDays(HOY, 30) }),
      p({ id: 'cerca', snoozeUntil: addDays(HOY, 2) }),
    ]
    assert.deepEqual(separarPendientes(s, HOY).pospuestos.map((t) => t.id), ['cerca', 'lejos'])
  })
  test('una lista vacía no truena', () => {
    const r = separarPendientes([], HOY)
    assert.deepEqual([r.activos, r.pospuestos, r.hechos], [[], [], []])
  })
}

console.log('\nResumen de arriba')
test('cuenta lo cerrado en los últimos 7 días, hoy incluido', () => {
  const lista = [
    p({ id: 'a', done: 1, doneAt: HOY }),
    p({ id: 'b', done: 1, doneAt: hace(6) }), // justo dentro
    p({ id: 'c', done: 1, doneAt: hace(7) }), // justo fuera
    p({ id: 'd', since: hace(2) }),
    p({ id: 'e', snoozeUntil: addDays(HOY, 4) }),
  ]
  const r = resumenPendientes(lista, HOY)
  assert.equal(r.cerradosSemana, 2)
  assert.equal(r.hechos, 3)
  assert.equal(r.activos, 1)
  assert.equal(r.pospuestos, 1)
})

console.log('\nSoltar sin culpa')
test('antes del umbral no se sugiere nada', () =>
  assert.equal(sugiereSoltar(p({ since: hace(DIAS_PARA_SOLTAR - 1) }), HOY), false))
test('al llegar al umbral aparece la salida', () =>
  assert.equal(sugiereSoltar(p({ since: hace(DIAS_PARA_SOLTAR) }), HOY), true))
test('a algo pospuesto o ya hecho no se le sugiere soltarlo', () => {
  assert.equal(sugiereSoltar(p({ since: hace(100), snoozeUntil: addDays(HOY, 2) }), HOY), false)
  assert.equal(sugiereSoltar(p({ since: hace(100), done: 1, doneAt: HOY }), HOY), false)
})

console.log('\nLimpiar los hechos viejos')
test('solo entran los hechos con más de 30 días', () => {
  const lista = [
    p({ id: 'viejo', done: 1, doneAt: hace(40) }),
    p({ id: 'reciente', done: 1, doneAt: hace(10) }),
    p({ id: 'sinHacer', since: hace(200) }),
  ]
  assert.deepEqual(hechosViejos(lista, HOY, 30).map((t) => t.id), ['viejo'])
})

console.log('\nBanderas 1 / 0 de IndexedDB')
test('done se lee como 1, no como true', () => {
  assert.equal(yaHecho({ done: 1 }), true)
  assert.equal(yaHecho({ done: 0 }), false)
  assert.equal(yaHecho({}), false)
  // Si algún día alguien guardara true, NO debe contar como hecho: se vería en
  // la bandeja en vez de desaparecer sin explicación.
  assert.equal(yaHecho({ done: true }), false)
})

console.log(`\n${ok} pruebas pasaron.\n`)
