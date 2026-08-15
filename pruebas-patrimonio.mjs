/**
 * Pruebas de la lógica del patrimonio. No es un framework: es un archivo que
 * corres con `node pruebas-patrimonio.mjs` y te dice qué falla.
 *
 * La regla que más se prueba aquí es la que pediste: no se puede repartir en
 * metas dinero que no existe.
 */
import assert from 'node:assert/strict'
import {
  apartadoDe, totalDeMovimientos, patrimonio, repartoDelTotal,
  revisarApartado, revisarRetiro, revisarGasto, metasParaRescate,
  hayDeDondeSacar, revisarSaldoInicial,
} from './src/lib/patrimonio.js'

let ok = 0
const test = (nombre, fn) => {
  try { fn(); ok++; console.log('  ✓', nombre) }
  catch (e) { console.log('  ✗', nombre, '\n     ', e.message); process.exitCode = 1 }
}

// Atajos para armar datos de prueba sin repetir campos.
const ing = (amount, date = '2026-08-01') => ({ id: 'i' + amount, type: 'ingreso', amount, date })
const gas = (amount, date = '2026-08-01') => ({ id: 'g' + amount, type: 'gasto', amount, date })
const meta = (id, name, saved, target = 100000) => ({ id, name, saved, target, order: 0 })

const s = (initialBalance) => ({ initialBalance })

console.log('\nEl total')
test('sin nada, el total es cero', () =>
  assert.equal(patrimonio({}).total, 0))
test('el saldo inicial es el punto de partida', () =>
  assert.equal(patrimonio({ settings: s(60000) }).total, 60000))
test('los ingresos suman', () =>
  assert.equal(patrimonio({ settings: s(60000), transactions: [ing(5000)] }).total, 65000))
test('los egresos restan', () =>
  assert.equal(patrimonio({ settings: s(60000), transactions: [gas(5000)] }).total, 55000))
test('suma y resta juntos', () =>
  assert.equal(
    patrimonio({ settings: s(60000), transactions: [ing(10000), gas(3000), gas(2000)] }).total,
    65000,
  ))
test('cuenta TODOS los meses, no solo el actual', () =>
  assert.equal(
    patrimonio({ transactions: [ing(1000, '2024-01-05'), ing(1000, '2026-08-15')] }).total,
    2000,
  ))
test('gastar de más deja el total en rojo', () => {
  const p = patrimonio({ settings: s(1000), transactions: [gas(3000)] })
  assert.equal(p.total, -2000)
  assert.equal(p.enRojo, true)
})
test('separa ingresos de egresos', () => {
  const t = totalDeMovimientos([ing(100), ing(200), gas(50)])
  assert.deepEqual(t, { ingresos: 300, gastos: 50 })
})

console.log('\nEl caso que planteaste: 60,000 con 50,000 apartados')
const caso = { settings: s(60000), goals: [meta('m1', 'Ahorro', 50000)] }
test('el total sigue siendo 60,000: apartar no gasta', () =>
  assert.equal(patrimonio(caso).total, 60000))
test('aparecen 50,000 apartados', () =>
  assert.equal(patrimonio(caso).apartado, 50000))
test('y 10,000 libres', () =>
  assert.equal(patrimonio(caso).libre, 10000))
test('al abrir otra meta con 4,000, el total NO cambia', () => {
  const dos = { ...caso, goals: [meta('m1', 'Ahorro', 50000), meta('m2', 'Laptop', 4000)] }
  const p = patrimonio(dos)
  assert.equal(p.total, 60000)
  assert.equal(p.apartado, 54000)
  assert.equal(p.libre, 6000)
})

console.log('\nNo se puede apartar dinero que no existe')
test('apartar dentro de lo libre: sí', () =>
  assert.equal(revisarApartado({ libre: 10000, monto: 10000 }).ok, true))
test('apartar un peso más: no', () =>
  assert.equal(revisarApartado({ libre: 10000, monto: 10001 }).ok, false))
test('y dice cuánto falta', () =>
  assert.equal(revisarApartado({ libre: 10000, monto: 15000 }).faltante, 5000))
test('el tope es justo el dinero libre', () =>
  assert.equal(revisarApartado({ libre: 10000, monto: 99999 }).tope, 10000))
test('sin dinero libre no se aparta nada', () =>
  assert.equal(revisarApartado({ libre: 0, monto: 1 }).ok, false))
test('un monto vacío no es un error, solo no hace nada', () => {
  const r = revisarApartado({ libre: 10000, monto: 0 })
  assert.equal(r.ok, false)
  assert.equal(r.vacio, true)
})
test('un libre negativo se trata como cero, no como permiso', () =>
  assert.equal(revisarApartado({ libre: -5000, monto: 100 }).ok, false))

console.log('\nRetirar de una meta')
test('retirar lo que la meta tiene: sí', () =>
  assert.equal(revisarRetiro({ goal: meta('m1', 'A', 5000), monto: 5000 }).ok, true))
test('retirar más de lo que tiene: no', () =>
  assert.equal(revisarRetiro({ goal: meta('m1', 'A', 5000), monto: 5001 }).ok, false))
test('una meta vacía no da nada', () =>
  assert.equal(revisarRetiro({ goal: meta('m1', 'A', 0), monto: 1 }).ok, false))
test('un saved corrupto en negativo se lee como cero', () =>
  assert.equal(apartadoDe({ saved: -300 }), 0))

console.log('\nGastos que se pasan del dinero libre')
test('un gasto que cabe no molesta', () => {
  const r = revisarGasto({ libre: 10000, total: 60000, monto: 3000 })
  assert.equal(r.cabe, true)
  assert.equal(r.faltante, 0)
})
test('un gasto que se pasa avisa cuánto falta', () => {
  const r = revisarGasto({ libre: 10000, total: 60000, monto: 15000 })
  assert.equal(r.cabe, false)
  assert.equal(r.faltante, 5000)
})
test('gastar exactamente lo libre sí cabe', () =>
  assert.equal(revisarGasto({ libre: 10000, total: 60000, monto: 10000 }).cabe, true))
test('detecta cuando el gasto es más grande que TODO tu dinero', () => {
  const r = revisarGasto({ libre: 10000, total: 60000, monto: 70000 })
  assert.equal(r.pasaDelTotal, true)
  assert.equal(r.totalDespues, -10000)
})

console.log('\n¿De qué meta saco la diferencia?')
const metas = [meta('m1', 'Ahorro', 50000), meta('m2', 'Laptop', 3000), meta('m3', 'Vacía', 0)]
test('las metas sin dinero ni aparecen', () =>
  assert.equal(metasParaRescate({ goals: metas, faltante: 1000 }).length, 2))
test('primero las que alcanzan solas, y de esas la más chica', () => {
  const r = metasParaRescate({ goals: metas, faltante: 2000 })
  assert.equal(r[0].id, 'm2') // 3,000 alcanza y es la más chica: se vacía antes que la grande
  assert.equal(r[1].id, 'm1')
})
test('si ninguna alcanza sola, marca cuánto quedaría faltando', () => {
  const r = metasParaRescate({ goals: metas, faltante: 60000 })
  assert.equal(r[0].cubre, false)
  assert.equal(r[0].retiro, 50000) // saca todo lo que tiene
  assert.equal(r[0].restante, 10000) // y todavía faltarían 10,000
})
test('el retiro nunca pasa de lo que la meta tiene', () =>
  assert.equal(metasParaRescate({ goals: metas, faltante: 999999 })[0].retiro, 50000))
test('sin metas con dinero no hay de dónde sacar', () => {
  assert.equal(hayDeDondeSacar([meta('m3', 'Vacía', 0)]), false)
  assert.equal(hayDeDondeSacar(metas), true)
})

console.log('\nCuando la cuenta se descuadra')
test('borrar un ingreso puede dejarte sobreapartado', () => {
  const p = patrimonio({ settings: s(40000), goals: [meta('m1', 'Ahorro', 50000)] })
  assert.equal(p.libre, -10000)
  assert.equal(p.sobreapartado, true)
})
test('bajar el saldo inicial avisa antes de romper la cuenta', () => {
  const r = revisarSaldoInicial({ nuevo: 40000, goals: [meta('m1', 'Ahorro', 50000)] })
  assert.equal(r.rompe, true)
  assert.equal(r.faltante, 10000)
})
test('si no rompe nada, no avisa', () =>
  assert.equal(revisarSaldoInicial({ nuevo: 60000, goals: [meta('m1', 'A', 50000)] }).rompe, false))

console.log('\nLa barra de reparto')
test('un pedazo por meta con dinero, más el libre', () => {
  const partes = repartoDelTotal({ goals: metas, total: 60000, apartado: 53000, libre: 7000 })
  assert.equal(partes.length, 3) // dos metas con dinero + libre
  assert.equal(partes.at(-1).tipo, 'libre')
})
test('los pedazos suman 1 cuando la cuenta cuadra', () => {
  const partes = repartoDelTotal({ goals: metas, total: 60000, apartado: 53000, libre: 7000 })
  const suma = partes.reduce((a, p) => a + p.pct, 0)
  assert.ok(Math.abs(suma - 1) < 0.0001)
})
test('sin dinero libre no se dibuja el pedazo libre', () => {
  const partes = repartoDelTotal({ goals: metas, total: 53000, apartado: 53000, libre: 0 })
  assert.equal(partes.some((p) => p.tipo === 'libre'), false)
})
test('sobreapartado: la barra usa lo apartado como 100% y no se desborda', () => {
  const partes = repartoDelTotal({ goals: metas, total: 40000, apartado: 53000, libre: -13000 })
  const suma = partes.reduce((a, p) => a + p.pct, 0)
  assert.ok(suma <= 1.0001, `la barra se desborda: ${suma}`)
})
test('sin metas ni dinero no truena', () =>
  assert.equal(repartoDelTotal({}).length, 0))

console.log(`\n${ok} pruebas pasaron\n`)
