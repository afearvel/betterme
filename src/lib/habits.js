import { addDays, diaSemana, diasEntre, today } from './format.js'

/**
 * Toda la matemática de los hábitos vive aquí, como funciones puras: reciben
 * datos y devuelven números. No importa React ni toca la base de datos, así que
 * puedes leerla, probarla y corregirla sin abrir la interfaz.
 *
 * Dos ideas mandan en todo el archivo:
 *
 *  1. La rotación avanza con el CALENDARIO, no con lo que cumpliste. Si te
 *     saltas el día B, mañana toca C igual. La app no te espera.
 *  2. Las rachas no castigan. Fallar reinicia el contador y ya: se guarda tu
 *     mejor racha y el porcentaje de los últimos 30 días, sin colores de alarma.
 */

const TODOS_LOS_DIAS = [0, 1, 2, 3, 4, 5, 6]

/* ============================================================== ciclos A/B/C */

/** Los días de la semana en los que un ciclo trabaja. Por defecto, todos. */
export const diasActivos = (cycle) =>
  cycle?.weekdays?.length ? cycle.weekdays : TODOS_LOS_DIAS

/** ¿Este ciclo trabaja en esta fecha, o es un día que ni siquiera cuenta? */
export const esDiaActivo = (cycle, iso) => diasActivos(cycle).includes(diaSemana(iso))

/**
 * Cuenta cuántos días activos hay en el rango [desde, hasta) — incluye el
 * primero, excluye el último.
 *
 * Podríamos recorrer día por día, pero si el ciclo empezó hace dos años serían
 * 700 vueltas cada vez que se pinta la pantalla. El truco: las semanas completas
 * se resuelven con una multiplicación (cada semana tiene exactamente los mismos
 * días activos) y solo los 6 días sueltos del final se revisan a mano.
 */
export function contarDiasActivos(desde, hasta, dias = TODOS_LOS_DIAS) {
  const total = diasEntre(desde, hasta)
  if (total <= 0) return 0

  const semanas = Math.floor(total / 7)
  let n = semanas * dias.length

  const dowInicial = diaSemana(desde)
  for (let i = semanas * 7; i < total; i++) {
    if (dias.includes((dowInicial + i) % 7)) n++
  }
  return n
}

/**
 * En qué posición de la rotación cae una fecha: 0 = primera rutina, 1 = segunda…
 * Devuelve null si el ciclo aún no empieza, si ese día no es activo o si el
 * ciclo todavía no tiene rutinas.
 */
export function posicionEnCiclo(cycle, routines = [], iso = today()) {
  if (!cycle || routines.length === 0) return null
  if (iso < cycle.startDate) return null
  if (!esDiaActivo(cycle, iso)) return null

  const pasados = contarDiasActivos(cycle.startDate, iso, diasActivos(cycle))
  return pasados % routines.length
}

/** Qué rutina toca en una fecha. null = descanso de calendario o sin empezar. */
export function rutinaDelDia(cycle, routines = [], iso = today()) {
  const i = posicionEnCiclo(cycle, routines, iso)
  return i === null ? null : routines[i]
}

/** Las rutinas de un ciclo, en su orden. El orden ES la rotación. */
export const rutinasDe = (routines = [], cycleId) =>
  routines.filter((r) => r.cycleId === cycleId).sort((a, b) => a.order - b.order)

/** Qué viene en los próximos días. Sirve para el "mañana toca B" de la tarjeta. */
export function proximosDias(cycle, routines = [], desde = today(), n = 5) {
  return Array.from({ length: n }, (_, k) => {
    const date = addDays(desde, k)
    return { date, routine: rutinaDelDia(cycle, routines, date) }
  })
}

/* ============================================================ hábitos sueltos */

/**
 * ¿Toca este hábito en esta fecha? Antes de su fecha de inicio, nunca.
 *
 *   diario → todos los días
 *   semana → solo los días de la semana elegidos
 *   cadaN  → cada n días contando desde que lo creaste
 */
export function tocaHabito(habit, iso = today()) {
  if (!habit || habit.active === 0) return false
  if (habit.startDate && iso < habit.startDate) return false

  const s = habit.schedule ?? { type: 'diario' }
  if (s.type === 'semana') return (s.weekdays ?? []).includes(diaSemana(iso))
  if (s.type === 'cadaN') {
    const n = Math.max(1, Number(s.n) || 1)
    return diasEntre(habit.startDate ?? iso, iso) % n === 0
  }
  return true // 'diario' y cualquier cosa rara
}

const LETRA_DIA = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const PLURAL_DIA = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados']

/** Texto corto para la tarjeta: "Todos los días", "L M V", "Cada 3 días". */
export function textoFrecuencia(habit) {
  const s = habit?.schedule ?? { type: 'diario' }
  if (s.type === 'cadaN') return `Cada ${Math.max(1, Number(s.n) || 1)} días`
  if (s.type === 'semana') {
    const dias = [1, 2, 3, 4, 5, 6, 0].filter((d) => (s.weekdays ?? []).includes(d))
    if (dias.length === 0) return 'Sin días elegidos'
    if (dias.length === 7) return 'Todos los días'
    // Una sola letra suelta ("D") no se entiende; con nombre completo sí.
    if (dias.length === 1) return `Los ${PLURAL_DIA[dias[0]]}`
    if (dias.length === 5 && !dias.includes(0) && !dias.includes(6)) return 'Entre semana'
    if (dias.length === 2 && dias.includes(0) && dias.includes(6)) return 'Fines de semana'
    return dias.map((d) => LETRA_DIA[d]).join(' ')
  }
  return 'Todos los días'
}

/* ================================================================= palomitas */

const clave = (targetId, date) => `${targetId}|${date}`

/**
 * Convierte la lista plana de palomitas en un Map para buscarlas al instante.
 * Sin esto, cada casilla del calendario recorrería el arreglo completo.
 */
export function mapaDeMarcas(checks = []) {
  const m = new Map()
  for (const c of checks) m.set(clave(c.targetId, c.date), c)
  return m
}

export const marcaDe = (mapa, targetId, date) => mapa.get(clave(targetId, date))
export const estaHecho = (mapa, targetId, date) => Boolean(marcaDe(mapa, targetId, date)?.done)
export const pasosHechos = (mapa, targetId, date) => marcaDe(mapa, targetId, date)?.steps ?? []

/* =================================================================== rachas */

const LIMITE = 400 // hasta dónde miramos hacia atrás. Más que suficiente y rápido.

/**
 * Días seguidos cumplidos, contando solo los días en los que TOCABA.
 *
 * Detalle que importa: si hoy toca y todavía no lo marcas, la racha no se rompe.
 * El día no ha terminado. Empezamos a revisar desde ayer y hoy suma en cuanto
 * lo palomees.
 *
 * @param toca  (iso) => boolean — ¿ese día contaba?
 * @param hecho (iso) => boolean — ¿lo cumpliste?
 */
export function racha({ toca, hecho, hasta = today(), desde = null }) {
  let dias = 0
  let iso = hasta

  if (toca(iso) && !hecho(iso)) iso = addDays(iso, -1)

  for (let i = 0; i < LIMITE; i++) {
    if (desde && iso < desde) break
    if (toca(iso)) {
      if (!hecho(iso)) break
      dias++
    }
    iso = addDays(iso, -1)
  }
  return dias
}

/**
 * La racha más larga que has tenido. Recorre hacia adelante desde el inicio.
 * Las fechas 'AAAA-MM-DD' se pueden comparar con < y > como texto: están
 * escritas de mayor a menor unidad, así que el orden alfabético ES el orden
 * cronológico. Es la razón de usar ese formato en toda la app.
 */
export function mejorRacha({ toca, hecho, desde, hasta = today() }) {
  const tope = addDays(hasta, -LIMITE)
  let iso = desde && desde > tope ? desde : tope
  let mejor = 0
  let actual = 0

  while (iso <= hasta) {
    if (toca(iso)) {
      if (hecho(iso)) {
        actual++
        if (actual > mejor) mejor = actual
      } else if (iso !== hasta) {
        actual = 0 // hoy sin marcar todavía no cuenta como fallo
      }
    }
    iso = addDays(iso, 1)
  }
  return mejor
}

/** Cumplimiento de los últimos n días: cuántos tocaron y cuántos cumpliste. */
export function cumplimiento({ toca, hecho, dias = 30, hasta = today(), desde = null }) {
  let tocaron = 0
  let hechos = 0

  for (let i = 0; i < dias; i++) {
    const iso = addDays(hasta, -i)
    if (desde && iso < desde) break
    if (!toca(iso)) continue
    tocaron++
    if (hecho(iso)) hechos++
  }
  return { tocaron, hechos, pct: tocaron ? hechos / tocaron : 0 }
}

/** Los últimos n días, para pintar la tira de puntitos de la tarjeta. */
export function tiraDeDias({ toca, hecho, dias = 7, hasta = today() }) {
  return Array.from({ length: dias }, (_, i) => {
    const date = addDays(hasta, -(dias - 1 - i))
    return { date, toca: toca(date), hecho: hecho(date) }
  })
}

/* ================================================================= resúmenes */

/** Todo lo que la tarjeta de un hábito necesita saber, de una sola pasada. */
export function resumenHabito(habit, mapa, hoy = today()) {
  const toca = (iso) => tocaHabito(habit, iso)
  const hecho = (iso) => estaHecho(mapa, habit.id, iso)
  const desde = habit.startDate ?? null

  return {
    tocaHoy: toca(hoy),
    hechoHoy: hecho(hoy),
    racha: racha({ toca, hecho, hasta: hoy, desde }),
    mejor: mejorRacha({ toca, hecho, desde, hasta: hoy }),
    ultimos30: cumplimiento({ toca, hecho, hasta: hoy, desde }),
    tira: tiraDeDias({ toca, hecho, hasta: hoy }),
  }
}

/**
 * Lo mismo para un ciclo completo. Aquí "cumplir" significa haber hecho la
 * rutina que tocaba ese día; los días de descanso cuentan como cumplidos solos,
 * que es justo el punto de programarlos.
 */
export function resumenCiclo(cycle, routines, mapa, hoy = today()) {
  const toca = (iso) => rutinaDelDia(cycle, routines, iso) !== null
  const hecho = (iso) => {
    const r = rutinaDelDia(cycle, routines, iso)
    if (!r) return false
    return r.rest ? true : estaHecho(mapa, r.id, iso)
  }
  const desde = cycle?.startDate ?? null
  const rutinaHoy = rutinaDelDia(cycle, routines, hoy)

  return {
    rutinaHoy,
    hechoHoy: rutinaHoy ? hecho(hoy) : false,
    pasosHoy: rutinaHoy ? pasosHechos(mapa, rutinaHoy.id, hoy) : [],
    racha: racha({ toca, hecho, hasta: hoy, desde }),
    mejor: mejorRacha({ toca, hecho, desde, hasta: hoy }),
    ultimos30: cumplimiento({ toca, hecho, hasta: hoy, desde }),
    tira: tiraDeDias({ toca, hecho, hasta: hoy }),
    proximos: proximosDias(cycle, routines, hoy, 5),
  }
}

/* ============================================================== el día entero */

/**
 * Cuántas cosas tocaban un día y cuántas se cumplieron, juntando hábitos y
 * ciclos. Es lo que alimenta la barra de "hoy" y el calendario del historial.
 */
export function resumenDelDia({ habits = [], cycles = [], routines = [], mapa, iso = today() }) {
  let total = 0
  let hechos = 0

  for (const h of habits) {
    if (!tocaHabito(h, iso)) continue
    total++
    if (estaHecho(mapa, h.id, iso)) hechos++
  }

  for (const c of cycles) {
    const r = rutinaDelDia(c, rutinasDe(routines, c.id), iso)
    if (!r) continue
    total++
    if (r.rest || estaHecho(mapa, r.id, iso)) hechos++
  }

  return { total, hechos, pct: total ? hechos / total : 0, completo: total > 0 && hechos === total }
}

/** Días seguidos en los que cumpliste TODO lo que tocaba. */
export function rachaDeDiasCompletos({ habits, cycles, routines, mapa, hoy = today() }) {
  // `racha` pregunta dos veces por el mismo día (toca y hecho). Guardamos el
  // resultado para no recalcularlo: son cientos de días hacia atrás.
  const cache = new Map()
  const dia = (iso) => {
    if (!cache.has(iso)) cache.set(iso, resumenDelDia({ habits, cycles, routines, mapa, iso }))
    return cache.get(iso)
  }
  return racha({
    toca: (iso) => dia(iso).total > 0,
    hecho: (iso) => dia(iso).completo,
    hasta: hoy,
  })
}
