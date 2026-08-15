/**
 * Pruebas de la lógica de agenda. No es un framework: es un archivo que corres
 * con `node pruebas-agenda.mjs` y te dice qué falla. Sin navegador, sin base de
 * datos, sin React: solo funciones que reciben datos y devuelven datos.
 */
import assert from 'node:assert/strict'
import {
  esHora, normalizaHora, minutosDeHora, horaDeMinutos, finDeBloque,
  textoHora, duracionTexto, rangoTexto,
  esSerie, ocurreNatural, textoRepeticion,
  claveDia, indiceExcepciones, ocurrenciasDelDia, ordenaOcurrencias, separarDia,
  loQueSigue, minutosPara, textoFalta, horaAhora,
  seEncima, encimados,
  esPasado, esHoy, esFuturo, textoEstado, resumenDia,
  rangoDias, diasConAlgo,
  MAX_INTENCIONES, intencionesDelDia, hayEspacio, siguienteOrden, textoIntenciones,
  primeraOcurrencia, bloqueAIcs, nombreArchivoIcs,
} from './src/lib/agenda.js'
import { addDays, diaSemana } from './src/lib/format.js'

let ok = 0
const test = (nombre, fn) => {
  try { fn(); ok++; console.log('  ✓', nombre) }
  catch (e) { console.log('  ✗', nombre, '\n     ', e.message); process.exitCode = 1 }
}

// Todas las pruebas fijan "hoy" a mano. Nunca dependen del reloj de la
// computadora: si no, mañana fallarían solas.
const HOY = '2026-08-15' // sábado
const MARTES = '2026-08-18'
const JUEVES = '2026-08-20'
const hace = (n) => addDays(HOY, -n)

/** Un bloque de una sola vez. */
const b = (extra = {}) => ({
  id: extra.id ?? 'b1',
  name: extra.name ?? 'Algo',
  note: '',
  start: '09:00',
  mins: 60,
  repite: 0,
  date: HOY,
  weekdays: [],
  startDate: null,
  endDate: null,
  ...extra,
})

/** Un bloque que se repite. */
const serie = (extra = {}) =>
  b({ repite: 1, date: null, weekdays: [2, 4], startDate: HOY, endDate: null, ...extra })

/** Una excepción de un día. */
const exc = (extra = {}) => ({
  id: extra.id ?? 'e1',
  blockId: extra.blockId ?? 'b1',
  date: extra.date ?? HOY,
  done: 0, doneAt: null, cancelado: 0, movedTo: null, start: null, mins: null,
  ...extra,
})

console.log('\nLas fechas de referencia son las que creo que son')
test('15 de agosto de 2026 es sábado, 18 martes y 20 jueves', () => {
  assert.equal(diaSemana(HOY), 6)
  assert.equal(diaSemana(MARTES), 2)
  assert.equal(diaSemana(JUEVES), 4)
})

console.log('\nLa hora como texto')
test('esHora solo acepta HH:MM de 24 h con cero adelante', () => {
  assert.equal(esHora('09:00'), true)
  assert.equal(esHora('23:59'), true)
  assert.equal(esHora('00:00'), true)
  assert.equal(esHora('9:00'), false)   // sin cero adelante
  assert.equal(esHora('24:00'), false)
  assert.equal(esHora('12:60'), false)
  assert.equal(esHora(null), false)
  assert.equal(esHora(900), false)
})
test('normalizaHora arregla lo que escriba una persona', () => {
  assert.equal(normalizaHora('9:5'), '09:05')
  assert.equal(normalizaHora(' 14:30 '), '14:30')
  assert.equal(normalizaHora('7 : 0'), '07:00')
  assert.equal(normalizaHora(''), null)
  assert.equal(normalizaHora('mañana'), null)
  assert.equal(normalizaHora('25:00'), null)
  assert.equal(normalizaHora(undefined), null)
})
test('minutos y hora se convierten en los dos sentidos', () => {
  assert.equal(minutosDeHora('00:00'), 0)
  assert.equal(minutosDeHora('14:30'), 870)
  assert.equal(minutosDeHora('23:59'), 1439)
  assert.equal(minutosDeHora('nada'), null)
  assert.equal(horaDeMinutos(870), '14:30')
  assert.equal(horaDeMinutos(0), '00:00')
})
test('nada se sale del día: horaDeMinutos se queda dentro', () => {
  assert.equal(horaDeMinutos(1500), '23:59')
  assert.equal(horaDeMinutos(-30), '00:00')
})
test('un bloque que cruzaría la medianoche se corta en 23:59', () => {
  assert.equal(finDeBloque('23:00', 60), '23:59')
  assert.equal(finDeBloque('22:00', 90), '23:30')
  assert.equal(finDeBloque(null, 60), null)
})

console.log('\nEl truco del cero adelante: orden alfabético = orden cronológico')
test('con cero adelante, ordenar texto ordena el tiempo', () => {
  const horas = ['14:30', '09:00', '23:15', '00:05']
  assert.deepEqual([...horas].sort(), ['00:05', '09:00', '14:30', '23:15'])
})
test('sin cero adelante el truco se rompe (por eso normalizamos siempre)', () => {
  // '9' es mayor que '1' carácter por carácter, así que las 9 de la mañana
  // quedarían DESPUÉS de las 2:30 de la tarde. Este es el error que evitamos.
  assert.ok('9:00' > '14:30')
  assert.ok(normalizaHora('9:00') < normalizaHora('14:30'))
})

console.log('\nCómo se lee la hora en pantalla')
test('se guarda en 24 h y se muestra en 12 h', () => {
  assert.equal(textoHora('00:00'), '12:00 am')
  assert.equal(textoHora('00:30'), '12:30 am')
  assert.equal(textoHora('09:05'), '9:05 am')
  assert.equal(textoHora('12:00'), '12:00 pm')
  assert.equal(textoHora('14:30'), '2:30 pm')
  assert.equal(textoHora('23:59'), '11:59 pm')
  assert.equal(textoHora(null), 'Sin hora')
})
test('las duraciones se leen como las diría una persona', () => {
  assert.equal(duracionTexto(0), 'sin duración')
  assert.equal(duracionTexto(45), '45 min')
  assert.equal(duracionTexto(60), '1 hora')
  assert.equal(duracionTexto(90), '1 hora 30 min')
  assert.equal(duracionTexto(120), '2 horas')
  assert.equal(duracionTexto(195), '3 horas 15 min')
})
test('el rango de un bloque', () => {
  assert.equal(rangoTexto('09:00', 90), '9:00 am – 10:30 am')
  assert.equal(rangoTexto('14:00', 0), '2:00 pm')
  assert.equal(rangoTexto(null, 45), 'Sin hora fija · 45 min')
  assert.equal(rangoTexto(null, 0), 'Sin hora fija')
})

console.log('\nA quién le toca qué día')
test('un bloque de una sola vez solo cae en su fecha', () => {
  assert.equal(ocurreNatural(b(), HOY), true)
  assert.equal(ocurreNatural(b(), MARTES), false)
  assert.equal(esSerie(b()), false)
})
test('una serie cae en sus días de la semana', () => {
  const s = serie() // martes y jueves
  assert.equal(ocurreNatural(s, MARTES), true)
  assert.equal(ocurreNatural(s, JUEVES), true)
  assert.equal(ocurreNatural(s, HOY), false) // sábado
  assert.equal(esSerie(s), true)
})
test('antes de startDate no existe, y endDate la termina', () => {
  const s = serie({ startDate: '2026-08-19', endDate: '2026-08-25' })
  assert.equal(ocurreNatural(s, MARTES), false)     // 18, antes de empezar
  assert.equal(ocurreNatural(s, JUEVES), true)      // 20, dentro
  assert.equal(ocurreNatural(s, '2026-08-25'), true) // el último día SÍ cuenta
  assert.equal(ocurreNatural(s, '2026-09-01'), false)
})
test('sin endDate la serie no se acaba nunca', () =>
  assert.equal(ocurreNatural(serie(), '2030-08-20'), true))
test('una serie sin días elegidos no cae en ningún lado', () =>
  assert.equal(ocurreNatural(serie({ weekdays: [] }), MARTES), false))
test('el texto de la repetición', () => {
  assert.equal(textoRepeticion(b()), 'Una sola vez')
  assert.equal(textoRepeticion(serie({ weekdays: [2] })), 'Cada martes')
  assert.equal(textoRepeticion(serie({ weekdays: [2, 4] })), 'Cada martes y jueves')
  assert.equal(textoRepeticion(serie({ weekdays: [1, 3, 5] })), 'Cada lunes, miércoles y viernes')
  assert.equal(textoRepeticion(serie({ weekdays: [1, 2, 3, 4, 5] })), 'Entre semana')
  assert.equal(textoRepeticion(serie({ weekdays: [0, 6] })), 'Fines de semana')
  assert.equal(textoRepeticion(serie({ weekdays: [0, 1, 2, 3, 4, 5, 6] })), 'Todos los días')
})
test('los días se listan de lunes a domingo, no en el orden que se guardaron', () =>
  assert.equal(textoRepeticion(serie({ weekdays: [5, 1] })), 'Cada lunes y viernes'))

console.log('\nExcepciones: lo que pasó de verdad ese día')
test('sin excepciones, la serie sale tal cual', () => {
  const s = serie()
  const oc = ocurrenciasDelDia([s], [], MARTES)
  assert.equal(oc.length, 1)
  assert.equal(oc[0].start, '09:00')
  assert.equal(oc[0].hecho, false)
  assert.equal(oc[0].movida, false)
  assert.equal(oc[0].fechaOriginal, MARTES)
})
test('marcar un día no toca los demás días de la serie', () => {
  const s = serie()
  const e = [exc({ blockId: 'b1', date: MARTES, done: 1 })]
  assert.equal(ocurrenciasDelDia([s], e, MARTES)[0].hecho, true)
  assert.equal(ocurrenciasDelDia([s], e, JUEVES)[0].hecho, false)
})
test('cancelar un día quita solo ese día', () => {
  const s = serie()
  const e = [exc({ blockId: 'b1', date: MARTES, cancelado: 1 })]
  assert.equal(ocurrenciasDelDia([s], e, MARTES).length, 0)
  assert.equal(ocurrenciasDelDia([s], e, JUEVES).length, 1)
})
test('mover un día lo quita de su fecha y lo pone en la nueva', () => {
  const s = serie()
  const e = [exc({ blockId: 'b1', date: MARTES, movedTo: '2026-08-19' })]
  assert.equal(ocurrenciasDelDia([s], e, MARTES).length, 0)
  const movida = ocurrenciasDelDia([s], e, '2026-08-19')
  assert.equal(movida.length, 1)
  assert.equal(movida[0].movida, true)
  assert.equal(movida[0].fecha, '2026-08-19')
  // La identidad NO se muda: sigue viviendo en su fecha original, para que
  // moverla otra vez no arme una cadena de mudanzas.
  assert.equal(movida[0].fechaOriginal, MARTES)
  assert.equal(movida[0].clave, claveDia('b1', MARTES))
})
test('una ocurrencia movida se puede marcar y sigue siendo la misma', () => {
  const s = serie()
  const e = [exc({ blockId: 'b1', date: MARTES, movedTo: '2026-08-19', done: 1 })]
  assert.equal(ocurrenciasDelDia([s], e, '2026-08-19')[0].hecho, true)
})
test('cambiar la hora de un día no cambia la de la serie', () => {
  const s = serie()
  const e = [exc({ blockId: 'b1', date: MARTES, start: '16:00', mins: 30 })]
  const m = ocurrenciasDelDia([s], e, MARTES)[0]
  assert.equal(m.start, '16:00')
  assert.equal(m.mins, 30)
  assert.equal(m.horaCambiada, true)
  const j = ocurrenciasDelDia([s], e, JUEVES)[0]
  assert.equal(j.start, '09:00')
  assert.equal(j.mins, 60)
  assert.equal(j.horaCambiada, false)
})
test('una excepción con hora inválida se ignora y manda la del bloque', () => {
  const e = [exc({ blockId: 'b1', date: MARTES, start: '9:00' })] // sin cero: inválida
  assert.equal(ocurrenciasDelDia([serie()], e, MARTES)[0].start, '09:00')
})
test('una mudanza huérfana no se dibuja', () => {
  // La clase se movió del martes al miércoles, pero después cambiaste la serie
  // a solo jueves: el martes ya no existía, así que la mudanza no tiene de qué
  // ser mudanza y simplemente no sale.
  const s = serie({ weekdays: [4] })
  const e = [exc({ blockId: 'b1', date: MARTES, movedTo: '2026-08-19' })]
  assert.equal(ocurrenciasDelDia([s], e, '2026-08-19').length, 0)
})
test('una excepción de un bloque borrado tampoco truena', () => {
  const e = [exc({ blockId: 'fantasma', date: MARTES, movedTo: '2026-08-19' })]
  assert.equal(ocurrenciasDelDia([], e, '2026-08-19').length, 0)
})
test('mover algo a su mismo día no lo desaparece', () => {
  const e = [exc({ blockId: 'b1', date: MARTES, movedTo: MARTES })]
  assert.equal(ocurrenciasDelDia([serie()], e, MARTES).length, 1)
})
test('un día sin nada devuelve lista vacía, no truena', () => {
  assert.deepEqual(ocurrenciasDelDia([], [], HOY), [])
  assert.deepEqual(ocurrenciasDelDia([serie()], [], '2026-08-16'), [])
})
test('el índice de excepciones agrupa por clave y por destino', () => {
  const { porClave, porDestino } = indiceExcepciones([
    exc({ id: 'e1', blockId: 'b1', date: MARTES, movedTo: JUEVES }),
    exc({ id: 'e2', blockId: 'b2', date: MARTES }),
  ])
  assert.equal(porClave.size, 2)
  assert.equal(porDestino.get(JUEVES).length, 1)
  assert.equal(porDestino.has(MARTES), false)
})

console.log('\nOrden del día')
test('primero por hora; lo que no tiene hora, al final', () => {
  const bloques = [
    b({ id: 'tarde', name: 'Tarde', start: '16:00' }),
    b({ id: 'flexible', name: 'Flexible', start: null }),
    b({ id: 'temprano', name: 'Temprano', start: '07:30' }),
  ]
  assert.deepEqual(
    ocurrenciasDelDia(bloques, [], HOY).map((o) => o.blockId),
    ['temprano', 'tarde', 'flexible'],
  )
})
test('empate de hora se desempata por nombre, no al azar', () => {
  const bloques = [
    b({ id: 'z', name: 'Zumba', start: '10:00' }),
    b({ id: 'a', name: 'Alberca', start: '10:00' }),
  ]
  assert.deepEqual(ocurrenciasDelDia(bloques, [], HOY).map((o) => o.blockId), ['a', 'z'])
})
test('ordenar no modifica el arreglo original (viene de Dexie)', () => {
  const lista = [{ clave: 'x', start: '18:00', name: 'X' }, { clave: 'y', start: '08:00', name: 'Y' }]
  const copia = [...lista]
  ordenaOcurrencias(lista)
  assert.deepEqual(lista, copia)
})
test('separarDia parte en los que tienen hora y los flexibles', () => {
  const oc = ocurrenciasDelDia(
    [b({ id: '1', start: '09:00' }), b({ id: '2', start: null }), b({ id: '3', start: null, name: 'B' })],
    [], HOY,
  )
  const { conHora, sinHora } = separarDia(oc)
  assert.equal(conHora.length, 1)
  assert.equal(sinHora.length, 2)
})

console.log('\nLo que sigue')
{
  const dia = () => ocurrenciasDelDia([
    b({ id: 'm', name: 'Mañana', start: '09:00', mins: 60 }),
    b({ id: 't', name: 'Tarde', start: '14:00', mins: 60 }),
    b({ id: 'f', name: 'Flexible', start: null }),
  ], [], HOY)

  test('a las 9:30 hay algo en curso y algo después', () => {
    const { enCurso, siguiente } = loQueSigue(dia(), '09:30')
    assert.equal(enCurso.blockId, 'm')
    assert.equal(siguiente.blockId, 't')
  })
  test('justo cuando termina uno, ya no está en curso', () => {
    const { enCurso, siguiente } = loQueSigue(dia(), '10:00')
    assert.equal(enCurso, null)
    assert.equal(siguiente.blockId, 't')
  })
  test('justo cuando empieza, sí está en curso', () =>
    assert.equal(loQueSigue(dia(), '09:00').enCurso.blockId, 'm'))
  test('después de todo, no hay siguiente y no truena', () => {
    const { enCurso, siguiente } = loQueSigue(dia(), '23:00')
    assert.equal(enCurso, null)
    assert.equal(siguiente, null)
  })
  test('lo ya marcado no aparece como lo que sigue', () => {
    const oc = ocurrenciasDelDia(
      [b({ id: 'm', start: '09:00', mins: 60 }), b({ id: 't', start: '14:00', mins: 60 })],
      [exc({ blockId: 't', date: HOY, done: 1 })], HOY,
    )
    assert.equal(loQueSigue(oc, '09:30').siguiente, null)
  })
  test('lo que no tiene hora nunca es "lo que sigue"', () => {
    const solos = ocurrenciasDelDia([b({ id: 'f', start: null })], [], HOY)
    assert.deepEqual(loQueSigue(solos, '09:00'), { enCurso: null, siguiente: null })
  })
  test('un día vacío tampoco truena', () =>
    assert.deepEqual(loQueSigue([], '09:00'), { enCurso: null, siguiente: null }))
}
test('cuánto falta', () => {
  assert.equal(minutosPara({ start: '14:00' }, '13:20'), 40)
  assert.equal(minutosPara({ start: '09:00' }, '10:00'), -60)
  assert.equal(minutosPara({ start: null }, '09:00'), null)
})
test('el texto de cuánto falta', () => {
  assert.equal(textoFalta(0), 'ahora')
  assert.equal(textoFalta(-5), 'ahora')
  assert.equal(textoFalta(40), 'en 40 min')
  assert.equal(textoFalta(60), 'en 1 hora')
  assert.equal(textoFalta(120), 'en 2 horas')
  assert.equal(textoFalta(95), 'en 1 h 35 min')
})
test('horaAhora arma HH:MM con cero adelante desde la hora local', () => {
  assert.equal(horaAhora(new Date(2026, 7, 15, 9, 5)), '09:05')
  assert.equal(horaAhora(new Date(2026, 7, 15, 23, 59)), '23:59')
})

console.log('\nSe encima (es un aviso, no un error)')
test('dos bloques que se pisan se detectan', () => {
  assert.equal(seEncima({ start: '09:00', mins: 60 }, { start: '09:30', mins: 60 }), true)
  assert.equal(seEncima({ start: '09:30', mins: 60 }, { start: '09:00', mins: 60 }), true)
})
test('pegados no es encimados: uno termina donde empieza el otro', () =>
  assert.equal(seEncima({ start: '09:00', mins: 60 }, { start: '10:00', mins: 30 }), false))
test('sin hora nunca se encima nada', () =>
  assert.equal(seEncima({ start: null, mins: 60 }, { start: '09:00', mins: 60 }), false))
test('un bloque de duración cero no se encima con nadie', () =>
  assert.equal(seEncima({ start: '09:00', mins: 0 }, { start: '09:00', mins: 60 }), false))
test('encimados dice con quién, de los dos lados', () => {
  const oc = ocurrenciasDelDia([
    b({ id: 'a', name: 'Junta', start: '09:00', mins: 90 }),
    b({ id: 'c', name: 'Comida', start: '10:00', mins: 60 }),
    b({ id: 'z', name: 'Solo', start: '18:00', mins: 30 }),
  ], [], HOY)
  const mapa = encimados(oc)
  assert.deepEqual(mapa.get(claveDia('a', HOY)), ['Comida'])
  assert.deepEqual(mapa.get(claveDia('c', HOY)), ['Junta'])
  assert.equal(mapa.has(claveDia('z', HOY)), false)
})

console.log('\nEl pasado, que no regaña')
test('pasado, hoy y futuro', () => {
  assert.equal(esPasado(hace(1), HOY), true)
  assert.equal(esPasado(HOY, HOY), false)
  assert.equal(esHoy(HOY, HOY), true)
  assert.equal(esFuturo(addDays(HOY, 1), HOY), true)
})
test('los estados posibles', () => {
  assert.equal(textoEstado({ hecho: true }, hace(3), HOY), 'Hecho')
  assert.equal(textoEstado({ hecho: false }, hace(3), HOY), 'Sin marcar')
  assert.equal(textoEstado({ hecho: false }, HOY, HOY), 'Para hoy')
  assert.equal(textoEstado({ hecho: false }, addDays(HOY, 4), HOY), 'Por venir')
})
test('NINGUNA variante regaña, en ningún día del año', () => {
  const prohibidas = [
    'no cumpl', 'incumpl', 'fall', 'atrasad', 'vencid', 'perdid', 'te saltaste',
    'debiste', 'retraso', 'olvidaste', 'tarde', 'mal',
  ]
  for (let d = -400; d <= 400; d++) {
    for (const hecho of [true, false]) {
      const t = textoEstado({ hecho }, addDays(HOY, d), HOY).toLowerCase()
      for (const mala of prohibidas) {
        assert.ok(!t.includes(mala), `día ${d} (hecho: ${hecho}): "${t}"`)
      }
    }
  }
})
test('el resumen del día NO tiene porcentaje ni cuenta lo que faltó', () => {
  const oc = ocurrenciasDelDia([
    b({ id: '1', start: '09:00' }), b({ id: '2', start: '11:00' }), b({ id: '3', start: null }),
  ], [exc({ blockId: '1', date: HOY, done: 1 })], HOY)
  const r = resumenDia(oc)
  assert.deepEqual(Object.keys(r).sort(), ['conHora', 'hechos', 'sinHora', 'total'])
  assert.equal(r.total, 3)
  assert.equal(r.hechos, 1)
  assert.equal(r.conHora, 2)
  assert.equal(r.sinHora, 1)
  // Lo que NO existe a propósito: nada de porcentaje, nada de "faltaron".
  assert.equal(r.porcentaje, undefined)
  assert.equal(r.faltaron, undefined)
  assert.equal(r.incumplidos, undefined)
})

console.log('\nLa tira de días de arriba')
test('rangoDias devuelve los días en orden, con hoy en su lugar', () => {
  const dias = rangoDias(HOY, 2, 3)
  assert.equal(dias.length, 6)
  assert.equal(dias[0], hace(2))
  assert.equal(dias[2], HOY)
  assert.equal(dias[5], addDays(HOY, 3))
  assert.deepEqual([...dias].sort(), dias) // ya venían ordenados
})
test('diasConAlgo marca solo los días que tienen algo', () => {
  const dias = rangoDias(HOY, 0, 6)
  const con = diasConAlgo([serie()], [], dias) // martes y jueves
  assert.equal(con.has(MARTES), true)
  assert.equal(con.has(JUEVES), true)
  assert.equal(con.has(HOY), false)
  assert.equal(con.size, 2)
})

console.log('\nIntenciones del día')
test('son máximo tres', () => assert.equal(MAX_INTENCIONES, 3))
test('se filtran por día y se ordenan por order', () => {
  const lista = [
    { id: 'c', date: HOY, order: 2, text: 'C', done: 0 },
    { id: 'a', date: HOY, order: 0, text: 'A', done: 0 },
    { id: 'x', date: MARTES, order: 0, text: 'X', done: 0 },
  ]
  assert.deepEqual(intencionesDelDia(lista, HOY).map((i) => i.id), ['a', 'c'])
})
test('hayEspacio se cierra en tres', () => {
  assert.equal(hayEspacio([]), true)
  assert.equal(hayEspacio([1, 2]), true)
  assert.equal(hayEspacio([1, 2, 3]), false)
})
test('siguienteOrden no repite huecos aunque hayas borrado en medio', () => {
  assert.equal(siguienteOrden([]), 0)
  assert.equal(siguienteOrden([{ order: 0 }, { order: 5 }]), 6)
})
test('en un día que no es hoy, el texto no dice "hoy"', () => {
  assert.ok(!textoIntenciones([], false).includes('hoy'))
  assert.ok(!textoIntenciones([{ done: 0 }], false).includes('hoy'))
})
test('el texto de las intenciones nunca cuenta lo que falta', () => {
  assert.equal(textoIntenciones([]), '¿Qué haría que hoy valiera la pena?')
  assert.equal(textoIntenciones([{ done: 0 }, { done: 0 }]), 'Lo que importa hoy')
  assert.equal(textoIntenciones([{ done: 1 }, { done: 0 }]), '1 de 2 listas')
  assert.equal(textoIntenciones([{ done: 1 }]), 'Listo')
  assert.equal(textoIntenciones([{ done: 1 }, { done: 1 }, { done: 1 }]), 'Las tres, listas')
})

console.log('\nArchivo para el Calendario del iPhone (.ics)')
test('la primera ocurrencia de una serie busca el primer día que le toca', () => {
  // La serie arranca el sábado 15, pero es de martes y jueves: el primero es el 18.
  assert.equal(primeraOcurrencia(serie()), MARTES)
  assert.equal(primeraOcurrencia(b()), HOY)
  assert.equal(primeraOcurrencia(serie({ weekdays: [] })), null)
})
{
  const opciones = { uid: 'prueba', sello: '20260815T120000Z' }

  test('un evento de una sola vez, con hora', () => {
    const ics = bloqueAIcs(b({ name: 'Comida con Ana', start: '14:00', mins: 60 }), opciones)
    assert.ok(ics.includes('DTSTART:20260815T140000'))
    assert.ok(ics.includes('DTEND:20260815T150000'))
    assert.ok(ics.includes('SUMMARY:Comida con Ana'))
    assert.ok(!ics.includes('RRULE'))
  })
  test('la hora va SIN zona horaria (hora flotante), igual que la guardamos', () => {
    const ics = bloqueAIcs(b({ start: '14:00' }), opciones)
    // Si terminara en Z sería hora universal y el evento se movería al viajar.
    assert.ok(!/DTSTART:\d{8}T\d{6}Z/.test(ics))
  })
  test('sin hora fija sale como evento de día completo, y el fin es exclusivo', () => {
    const ics = bloqueAIcs(b({ start: null }), opciones)
    assert.ok(ics.includes('DTSTART;VALUE=DATE:20260815'))
    assert.ok(ics.includes('DTEND;VALUE=DATE:20260816'))
  })
  test('una serie viaja como regla, no como cuarenta eventos', () => {
    const ics = bloqueAIcs(serie(), opciones)
    assert.ok(ics.includes('RRULE:FREQ=WEEKLY;BYDAY=TU,TH'))
    assert.ok(ics.includes('DTSTART:20260818T090000'))
  })
  test('endDate se convierte en UNTIL', () => {
    const ics = bloqueAIcs(serie({ endDate: '2026-12-15' }), opciones)
    assert.ok(ics.includes('UNTIL=20261215T235900'))
  })
  test('los caracteres especiales del título se escapan', () => {
    const ics = bloqueAIcs(b({ name: 'Junta; con Ana, Luis y \\todos' }), opciones)
    assert.ok(ics.includes('SUMMARY:Junta\\; con Ana\\, Luis y \\\\todos'))
  })
  test('las líneas terminan como pide el estándar (retorno de carro + salto)', () => {
    const ics = bloqueAIcs(b(), opciones)
    assert.ok(ics.endsWith('END:VCALENDAR\r\n'))
    assert.equal(ics.split('\n').length - 1, ics.split('\r\n').length - 1)
  })
  test('un bloque imposible no genera archivo en vez de generar basura', () =>
    assert.equal(bloqueAIcs(serie({ weekdays: [] }), opciones), null))
}
test('el nombre del archivo sobrevive a los acentos', () => {
  assert.equal(nombreArchivoIcs('Clase de inglés'), 'clase-de-ingles.ics')
  assert.equal(nombreArchivoIcs('  ¿¡Qué?!  '), 'que.ics')
  assert.equal(nombreArchivoIcs(''), 'bloque.ics')
  assert.equal(nombreArchivoIcs('###'), 'bloque.ics')
})

console.log(`\n${ok} pruebas pasaron.\n`)
