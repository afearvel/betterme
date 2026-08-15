/**
 * Pruebas de la lógica de hábitos. No es un framework: es un archivo que
 * corres con `node pruebas-habitos.mjs` y te dice qué falla.
 */
import assert from 'node:assert/strict'
import {
  contarDiasActivos, posicionEnCiclo, rutinaDelDia, tocaHabito,
  racha, mejorRacha, cumplimiento, mapaDeMarcas, resumenDelDia,
} from './src/lib/habits.js'
import { addDays, diaSemana, diasEntre } from './src/lib/format.js'

let ok = 0
const test = (nombre, fn) => {
  try { fn(); ok++; console.log('  ✓', nombre) }
  catch (e) { console.log('  ✗', nombre, '\n     ', e.message); process.exitCode = 1 }
}

const rutinas = (n, cycleId = 'c1') =>
  Array.from({ length: n }, (_, i) => ({
    id: `r${i}`, cycleId, name: `R${i}`, order: i, rest: false, steps: [],
  }))

console.log('\nFechas')
test('addDays cruza fin de mes', () => assert.equal(addDays('2026-08-31', 1), '2026-09-01'))
test('addDays hacia atrás cruza año', () => assert.equal(addDays('2026-01-01', -1), '2025-12-31'))
test('addDays sobre año bisiesto', () => assert.equal(addDays('2028-02-28', 1), '2028-02-29'))
test('diasEntre', () => assert.equal(diasEntre('2026-08-10', '2026-08-15'), 5))
test('2026-08-15 es sábado', () => assert.equal(diaSemana('2026-08-15'), 6))

console.log('\nRotación con todos los días activos')
{
  const ciclo = { id: 'c1', startDate: '2026-08-01', weekdays: [0, 1, 2, 3, 4, 5, 6] }
  const rs = rutinas(3)
  test('el día de arranque es la primera rutina', () =>
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-08-01'), 0))
  test('avanza un paso por día', () => {
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-08-02'), 1)
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-08-03'), 2)
  })
  test('da la vuelta al llegar al final', () =>
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-08-04'), 0))
  test('sigue avanzando aunque no marques nada (30 días después)', () =>
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-08-31'), 30 % 3))
  test('antes de la fecha de arranque no toca nada', () =>
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-07-31'), null))
  test('un ciclo sin rutinas no truena', () =>
    assert.equal(rutinaDelDia(ciclo, [], '2026-08-01'), null))
}

console.log('\nRotación solo lunes, miércoles y viernes')
{
  // 2026-08-03 es lunes.
  const ciclo = { id: 'c1', startDate: '2026-08-03', weekdays: [1, 3, 5] }
  const rs = rutinas(3)
  test('lunes de arranque = rutina 0', () =>
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-08-03'), 0))
  test('el martes no es día del ciclo', () =>
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-08-04'), null))
  test('miércoles = rutina 1, viernes = rutina 2', () => {
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-08-05'), 1)
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-08-07'), 2)
  })
  test('el lunes siguiente vuelve a la 0', () =>
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-08-10'), 0))
  test('cuenta bien a lo largo de meses', () => {
    // Del 3 de agosto al 2 de noviembre hay 91 días = 13 semanas exactas.
    assert.equal(contarDiasActivos('2026-08-03', '2026-11-02', [1, 3, 5]), 39)
    assert.equal(posicionEnCiclo(ciclo, rs, '2026-11-02'), 0)
  })
  test('el atajo de semanas completas da lo mismo que contar a mano', () => {
    for (let n = 0; n < 40; n++) {
      const hasta = addDays('2026-08-03', n)
      let aMano = 0
      for (let i = 0; i < n; i++) if ([1, 3, 5].includes(diaSemana(addDays('2026-08-03', i)))) aMano++
      assert.equal(contarDiasActivos('2026-08-03', hasta, [1, 3, 5]), aMano, `en n=${n}`)
    }
  })
}

console.log('\nFrecuencia de hábitos sueltos')
{
  const diario = { id: 'h1', active: 1, startDate: '2026-08-01', schedule: { type: 'diario' } }
  const finde = { id: 'h2', active: 1, startDate: '2026-08-01', schedule: { type: 'semana', weekdays: [0, 6] } }
  const cada3 = { id: 'h3', active: 1, startDate: '2026-08-01', schedule: { type: 'cadaN', n: 3 } }

  test('diario toca siempre, pero no antes de existir', () => {
    assert.equal(tocaHabito(diario, '2026-08-15'), true)
    assert.equal(tocaHabito(diario, '2026-07-31'), false)
  })
  test('semanal solo en sus días', () => {
    assert.equal(tocaHabito(finde, '2026-08-15'), true)  // sábado
    assert.equal(tocaHabito(finde, '2026-08-14'), false) // viernes
  })
  test('cada 3 días cuenta desde el inicio', () => {
    assert.equal(tocaHabito(cada3, '2026-08-01'), true)
    assert.equal(tocaHabito(cada3, '2026-08-02'), false)
    assert.equal(tocaHabito(cada3, '2026-08-04'), true)
  })
  test('un hábito pausado no toca', () =>
    assert.equal(tocaHabito({ ...diario, active: 0 }, '2026-08-15'), false))
}

console.log('\nRachas sin penalización')
{
  const toca = () => true
  const hechosEn = (fechas) => (iso) => fechas.includes(iso)

  test('cuenta los días seguidos hasta hoy', () =>
    assert.equal(racha({ toca, hecho: hechosEn(['2026-08-13', '2026-08-14', '2026-08-15']), hasta: '2026-08-15' }), 3))

  test('hoy sin marcar NO rompe la racha', () =>
    assert.equal(racha({ toca, hecho: hechosEn(['2026-08-13', '2026-08-14']), hasta: '2026-08-15' }), 2))

  test('un hueco anterior sí corta', () =>
    assert.equal(racha({ toca, hecho: hechosEn(['2026-08-10', '2026-08-14', '2026-08-15']), hasta: '2026-08-15' }), 2))

  test('sin nada marcado la racha es 0', () =>
    assert.equal(racha({ toca, hecho: () => false, hasta: '2026-08-15' }), 0))

  test('los días que no tocaban se saltan sin romper', () => {
    const soloLunes = (iso) => diaSemana(iso) === 1
    const lunes = ['2026-08-03', '2026-08-10']
    assert.equal(racha({ toca: soloLunes, hecho: hechosEn(lunes), hasta: '2026-08-15' }), 2)
  })

  test('la mejor racha se guarda aunque la actual sea 0', () => {
    const fechas = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-09']
    assert.equal(mejorRacha({ toca, hecho: hechosEn(fechas), desde: '2026-08-01', hasta: '2026-08-15' }), 4)
    assert.equal(racha({ toca, hecho: hechosEn(fechas), hasta: '2026-08-15', desde: '2026-08-01' }), 0)
  })

  test('cumplimiento de los últimos 30 días', () => {
    const fechas = Array.from({ length: 5 }, (_, i) => addDays('2026-08-15', -i))
    const c = cumplimiento({ toca, hecho: hechosEn(fechas), hasta: '2026-08-15', dias: 10 })
    assert.equal(c.tocaron, 10)
    assert.equal(c.hechos, 5)
    assert.equal(c.pct, 0.5)
  })
}

console.log('\nEl día completo')
{
  const ciclo = { id: 'c1', startDate: '2026-08-01', weekdays: [0, 1, 2, 3, 4, 5, 6] }
  const rs = [
    { id: 'r0', cycleId: 'c1', order: 0, rest: false, steps: [] },
    { id: 'r1', cycleId: 'c1', order: 1, rest: true, steps: [] },
  ]
  const habits = [{ id: 'h1', active: 1, startDate: '2026-08-01', schedule: { type: 'diario' } }]

  test('un día de descanso ya cuenta como cumplido', () => {
    const mapa = mapaDeMarcas([{ targetId: 'h1', date: '2026-08-02', done: 1 }])
    // 2026-08-02 cae en la rutina de descanso.
    const r = resumenDelDia({ habits, cycles: [ciclo], routines: rs, mapa, iso: '2026-08-02' })
    assert.equal(r.total, 2)
    assert.equal(r.hechos, 2)
    assert.equal(r.completo, true)
  })

  test('un día de entrenar sin marcar queda incompleto', () => {
    const mapa = mapaDeMarcas([{ targetId: 'h1', date: '2026-08-01', done: 1 }])
    const r = resumenDelDia({ habits, cycles: [ciclo], routines: rs, mapa, iso: '2026-08-01' })
    assert.equal(r.total, 2)
    assert.equal(r.hechos, 1)
    assert.equal(r.completo, false)
  })
}

console.log(`\n${ok} pruebas pasaron.\n`)
