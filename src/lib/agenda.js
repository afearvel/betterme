import { addDays, diaSemana, today } from './format.js'

/**
 * Toda la lógica de la Agenda vive aquí, como funciones puras: reciben datos y
 * devuelven datos. No importa React ni toca la base, así que se puede leer,
 * corregir y probar sin abrir la interfaz ni el navegador.
 *
 * Cuatro ideas mandan en este archivo:
 *
 *  1. La Agenda es lo que tiene HORA FIJA. Un evento, una clase, una rutina a
 *     una hora concreta. Lo que hay que hacer "en algún momento del día" es un
 *     hábito, y lo que se hace una vez y no tiene día es un pendiente.
 *
 *  2. La hora se guarda como texto 'HH:MM' de 24 horas con cero adelante, en un
 *     campo aparte de la fecha, y la duración en minutos enteros. Nunca un
 *     instante absoluto: ver el comentario grande de más abajo.
 *
 *  3. Lo que se repite se guarda como REGLA, no como miles de filas. "Martes y
 *     jueves a las 2" es una sola fila; los días se calculan al pintar. Las
 *     excepciones (moví esta clase, cancelé aquella, marqué la de ayer) son
 *     filas sueltas que solo existen para los días que tocaste.
 *
 *  4. El pasado no regaña. Aquí no hay porcentaje de cumplimiento, no hay
 *     contador de fallas y ninguna palabra dice "no cumpliste". Un bloque que
 *     no marcaste se ve apagado y ofrece dos salidas: marcarlo tarde o pasarlo
 *     a hoy. Nada más.
 */

/* ==================================================================== horas */

/**
 * POR QUÉ LA HORA ES TEXTO Y NO UN INSTANTE
 *
 * La tentación es guardar `new Date(...)` o un número de milisegundos. Es un
 * error para esta app: un instante absoluto se mueve si el teléfono cambia de
 * zona horaria. Si anotas "desayuno a las 9:00" y viajas a otro país, el bloque
 * saltaría a las 7:00 solo. Pero tú no querías decir "un momento del tiempo
 * universal", querías decir "cuando el reloj marque las 9".
 *
 * Guardando el texto '09:00' la hora es lo que dice el reloj de pared, esté
 * donde esté el teléfono. Es la misma razón por la que las fechas son
 * 'AAAA-MM-DD' y no objetos Date.
 *
 * Bonus: con el cero adelante, el orden alfabético ES el cronológico
 * ('09:00' < '14:30'). Sin el cero, '9:00' se ordenaría DESPUÉS de '14:30',
 * porque el texto compara carácter por carácter y '9' es mayor que '1'.
 */

const MINUTOS_DEL_DIA = 24 * 60
const ULTIMO_MINUTO = MINUTOS_DEL_DIA - 1 // 23:59

/** ¿Es exactamente 'HH:MM' de 24 horas con cero adelante? */
export const esHora = (valor) =>
  typeof valor === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(valor)

/**
 * Acepta lo que escriba una persona ('9:5', ' 14:30 ') y devuelve '09:05' o
 * '14:30'. Si no se parece a una hora, devuelve null en vez de inventar algo.
 */
export function normalizaHora(texto) {
  if (texto === null || texto === undefined) return null
  const s = String(texto).trim()
  if (s === '') return null
  const m = /^(\d{1,2})\s*:\s*(\d{1,2})$/.exec(s)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

/** '14:30' → 870. Para poder sumar y comparar. Null si no es una hora. */
export function minutosDeHora(hhmm) {
  const h = normalizaHora(hhmm)
  if (h === null) return null
  return Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5))
}

/** 870 → '14:30'. Se queda dentro del día: nunca devuelve '25:00'. */
export function horaDeMinutos(minutos) {
  const v = Math.max(0, Math.min(ULTIMO_MINUTO, Math.round(Number(minutos) || 0)))
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`
}

/**
 * A qué hora termina un bloque. Si se pasara de la medianoche se corta en
 * 23:59: un bloque que cruza el día son DOS bloques, uno en cada día. Esa
 * decisión evita todo un mundo de casos raros por un caso que casi no ocurre.
 */
export function finDeBloque(start, mins) {
  const ini = minutosDeHora(start)
  if (ini === null) return null
  return horaDeMinutos(ini + Math.max(0, Math.round(Number(mins) || 0)))
}

/**
 * Se guarda en 24 horas y se muestra en 12, porque así se lee la hora en
 * México. Guardar de una forma y mostrar de otra es normal: el formato de
 * guardado se elige por lo que ordena bien, el de pantalla por lo que se lee bien.
 */
export function textoHora(hhmm) {
  const h = normalizaHora(hhmm)
  if (h === null) return 'Sin hora'
  const h24 = Number(h.slice(0, 2))
  const sufijo = h24 < 12 ? 'am' : 'pm'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${h.slice(3, 5)} ${sufijo}`
}

/** Las duraciones que ofrece la hoja, en minutos. */
export const DURACIONES = [15, 30, 45, 60, 90, 120, 180]

export function duracionTexto(mins) {
  const m = Math.max(0, Math.round(Number(mins) || 0))
  if (m === 0) return 'sin duración'
  if (m < 60) return `${m} min`
  const horas = Math.floor(m / 60)
  const resto = m % 60
  const th = horas === 1 ? '1 hora' : `${horas} horas`
  return resto === 0 ? th : `${th} ${resto} min`
}

/** "2:00 pm – 3:30 pm" · "Sin hora fija · 45 min" */
export function rangoTexto(start, mins) {
  const ini = normalizaHora(start)
  const dur = Math.max(0, Math.round(Number(mins) || 0))
  if (ini === null) return dur > 0 ? `Sin hora fija · ${duracionTexto(dur)}` : 'Sin hora fija'
  if (dur === 0) return textoHora(ini)
  return `${textoHora(ini)} – ${textoHora(finDeBloque(ini, dur))}`
}

/* ============================================================== repetición */

/**
 * CÓMO SE GUARDA ALGO QUE SE REPITE
 *
 * Un bloque puede ser de dos formas, y `repite` (1 / 0) dice cuál:
 *
 *   repite: 0  → pasa UNA vez, el día que dice `date`.
 *   repite: 1  → es una REGLA: `weekdays` (0 = domingo … 6 = sábado), desde
 *                `startDate` y, si quieres, hasta `endDate`.
 *
 * La regla NO genera filas en la base. "Cada martes y jueves a las 2" es una
 * sola fila, aunque dure un semestre. Los días se calculan al pintar la
 * pantalla. La alternativa —escribir de golpe seis meses de filas— llena la
 * base de miles de registros y, peor, se te acaba sin avisar el día que
 * llegas al final.
 *
 * `repite` va como 1 / 0 y no como true / false porque IndexedDB no sabe
 * indexar booleanos: la misma rareza del navegador que ya vimos con `active`
 * en hábitos y `done` en pendientes.
 */
export const esSerie = (block) => block?.repite === 1

/**
 * ¿A este bloque le toca este día, según su regla y sin contar excepciones?
 *
 * Las fechas se comparan como texto sin ningún problema: 'AAAA-MM-DD' está
 * escrito de mayor a menor unidad, así que el orden alfabético ES el
 * cronológico. Esa es toda la razón de usar ese formato en la app.
 */
export function ocurreNatural(block, fecha) {
  if (!block || !fecha) return false
  if (!esSerie(block)) return block.date === fecha
  const dias = Array.isArray(block.weekdays) ? block.weekdays : []
  if (!dias.includes(diaSemana(fecha))) return false
  if (block.startDate && fecha < block.startDate) return false
  if (block.endDate && fecha > block.endDate) return false
  return true
}

/** El texto de la regla: "Cada martes y jueves", "Solo el sábado 15". */
const NOMBRES_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const ORDEN_LUNES = [1, 2, 3, 4, 5, 6, 0]

export function textoRepeticion(block) {
  if (!esSerie(block)) return 'Una sola vez'
  const dias = ORDEN_LUNES.filter((d) => (block.weekdays ?? []).includes(d))
  if (dias.length === 0) return 'Sin días elegidos'
  if (dias.length === 7) return 'Todos los días'
  if (dias.length === 5 && [1, 2, 3, 4, 5].every((d) => dias.includes(d))) return 'Entre semana'
  if (dias.length === 2 && dias.includes(6) && dias.includes(0)) return 'Fines de semana'
  const nombres = dias.map((d) => NOMBRES_DIA[d])
  const ultimo = nombres.pop()
  return nombres.length === 0 ? `Cada ${ultimo}` : `Cada ${nombres.join(', ')} y ${ultimo}`
}

/* ============================================================= excepciones */

/**
 * CÓMO SE GUARDA "ESTA SEMANA LA CLASE ES A LAS 4"
 *
 * El bloque dice lo que pasa EN TEORÍA. La tabla `blockDays` dice lo que pasó
 * DE VERDAD un día concreto: si lo marcaste, si lo moviste, si lo cancelaste o
 * si ese día cambió de hora.
 *
 * La identidad de una ocurrencia es la pareja (blockId, fecha ORIGINAL). Aunque
 * muevas la clase del martes al miércoles, su excepción sigue viviendo en el
 * martes: así, si la mueves otra vez, no se te hacen cadenas de mudanzas.
 *
 * Solo existen filas de los días que tocaste. Un semestre de clases perfecto no
 * ocupa ni una sola fila aquí. Es la misma idea de `checks` en hábitos: se
 * guarda lo que hiciste, no lo que dejaste de hacer.
 */
export const claveDia = (blockId, fecha) => `${blockId}|${fecha}`

/** Arma dos índices de un jalón para no recorrer la lista mil veces. */
export function indiceExcepciones(overrides = []) {
  const porClave = new Map()
  const porDestino = new Map()
  for (const o of overrides) {
    if (!o?.blockId || !o?.date) continue
    porClave.set(claveDia(o.blockId, o.date), o)
    if (o.movedTo && o.movedTo !== o.date) {
      const lista = porDestino.get(o.movedTo) ?? []
      lista.push(o)
      porDestino.set(o.movedTo, lista)
    }
  }
  return { porClave, porDestino }
}

/**
 * Junta el bloque con su excepción y devuelve la ocurrencia lista para pintar.
 * Lo que dice la excepción gana; lo que no diga, lo pone el bloque.
 */
function armaOcurrencia(block, excepcion, fechaOriginal, fecha) {
  const start = esHora(excepcion?.start)
    ? excepcion.start
    : esHora(block.start)
      ? block.start
      : null
  const mins = Number.isFinite(excepcion?.mins)
    ? Math.max(0, excepcion.mins)
    : Math.max(0, Math.round(Number(block.mins) || 0))

  return {
    clave: claveDia(block.id, fechaOriginal),
    blockId: block.id,
    block,
    name: block.name ?? 'Bloque',
    note: block.note ?? '',
    fecha, // el día en el que se dibuja
    fechaOriginal, // el día que le da identidad (donde vive su excepción)
    movida: fecha !== fechaOriginal,
    serie: esSerie(block),
    start,
    mins,
    hecho: excepcion?.done === 1,
    horaCambiada: esHora(excepcion?.start) && excepcion.start !== block.start,
    excepcion: excepcion ?? null,
  }
}

/**
 * Todas las ocurrencias de un día, ya ordenadas. Son dos grupos:
 *   1. lo que cae ahí por su propia regla (quitando lo cancelado y lo que se mudó)
 *   2. lo que se mudó A ese día desde otro
 */
export function ocurrenciasDelDia(blocks = [], overrides = [], fecha) {
  if (!fecha) return []
  const { porClave, porDestino } = indiceExcepciones(overrides)
  const porId = new Map(blocks.map((b) => [b.id, b]))
  const salida = []

  for (const b of blocks) {
    if (!ocurreNatural(b, fecha)) continue
    const o = porClave.get(claveDia(b.id, fecha))
    if (o?.cancelado === 1) continue
    if (o?.movedTo && o.movedTo !== fecha) continue // se fue a otro día
    salida.push(armaOcurrencia(b, o, fecha, fecha))
  }

  for (const o of porDestino.get(fecha) ?? []) {
    if (o.cancelado === 1) continue
    const b = porId.get(o.blockId)
    // Si el bloque ya no existe, o su regla cambió y ese día ya no le tocaba,
    // la mudanza queda huérfana y simplemente no se dibuja.
    if (!b || !ocurreNatural(b, o.date)) continue
    salida.push(armaOcurrencia(b, o, o.date, fecha))
  }

  return ordenaOcurrencias(salida)
}

/* ================================================================== orden */

/**
 * Primero lo que tiene hora, por hora. Después lo que no tiene hora, por
 * nombre. El desempate por nombre existe para que la lista no baile entre
 * pintadas cuando dos cosas caen a la misma hora.
 */
export function ordenaOcurrencias(lista = []) {
  return [...lista].sort((a, b) => {
    if (a.start && b.start && a.start !== b.start) return a.start < b.start ? -1 : 1
    if (a.start && !b.start) return -1
    if (!a.start && b.start) return 1
    return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'es')
  })
}

/**
 * Los bloques sin hora son los "flexibles": pasan ese día, pero no a una hora
 * concreta. Van en su propio grupo para que no se cuelen en la línea de tiempo
 * fingiendo un horario que no tienen.
 */
export function separarDia(ocurrencias = []) {
  const conHora = []
  const sinHora = []
  for (const oc of ocurrencias) (oc.start ? conHora : sinHora).push(oc)
  return { conHora, sinHora }
}

/* ============================================================ lo que sigue */

/** La hora local del reloj, como 'HH:MM'. Es la única función que mira el reloj. */
export function horaAhora(fecha = new Date()) {
  return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`
}

/**
 * Qué está pasando ahora y qué viene después. Lo ya marcado no aparece: si
 * terminaste temprano, la app no te lo sigue restregando.
 */
export function loQueSigue(ocurrencias = [], ahora = '00:00') {
  const m = minutosDeHora(ahora) ?? 0
  let enCurso = null
  let siguiente = null

  for (const oc of ocurrencias) {
    if (!oc.start || oc.hecho) continue
    const ini = minutosDeHora(oc.start)
    const fin = ini + Math.max(0, oc.mins || 0)
    if (ini <= m && m < fin) {
      if (!enCurso) enCurso = oc
    } else if (ini > m) {
      if (!siguiente || ini < minutosDeHora(siguiente.start)) siguiente = oc
    }
  }

  return { enCurso, siguiente }
}

/** Cuántos minutos faltan para una ocurrencia. Negativo = ya empezó. */
export function minutosPara(oc, ahora = '00:00') {
  const ini = minutosDeHora(oc?.start)
  const m = minutosDeHora(ahora)
  if (ini === null || m === null) return null
  return ini - m
}

export function textoFalta(minutos) {
  const m = Math.round(Number(minutos) || 0)
  if (m <= 0) return 'ahora'
  if (m < 60) return `en ${m} min`
  const horas = Math.floor(m / 60)
  const resto = m % 60
  if (resto === 0) return horas === 1 ? 'en 1 hora' : `en ${horas} horas`
  return `en ${horas} h ${resto} min`
}

/* ============================================================= solapamiento */

/** ¿Dos bloques se pisan en el tiempo? Los de duración cero nunca se pisan. */
export function seEncima(a, b) {
  const ia = minutosDeHora(a?.start)
  const ib = minutosDeHora(b?.start)
  if (ia === null || ib === null) return false
  const fa = ia + Math.max(0, a.mins || 0)
  const fb = ib + Math.max(0, b.mins || 0)
  return ia < fb && ib < fa
}

/**
 * Devuelve un Map: clave de ocurrencia → nombres con los que se encima.
 *
 * Es un AVISO, no un error. La app no te impide agendar dos cosas a la vez ni
 * pinta nada de rojo: solo te lo dice, porque a veces encimar es a propósito.
 */
export function encimados(ocurrencias = []) {
  const mapa = new Map()
  for (let i = 0; i < ocurrencias.length; i++) {
    for (let j = i + 1; j < ocurrencias.length; j++) {
      const a = ocurrencias[i]
      const b = ocurrencias[j]
      if (!seEncima(a, b)) continue
      mapa.set(a.clave, [...(mapa.get(a.clave) ?? []), b.name])
      mapa.set(b.clave, [...(mapa.get(b.clave) ?? []), a.name])
    }
  }
  return mapa
}

/* ================================================================ el pasado */

export const esPasado = (fecha, hoy = today()) => Boolean(fecha) && fecha < hoy
export const esHoy = (fecha, hoy = today()) => fecha === hoy
export const esFuturo = (fecha, hoy = today()) => Boolean(fecha) && fecha > hoy

/**
 * El texto del estado de una ocurrencia. Fíjate en que NINGUNA variante dice
 * "no cumpliste", "fallaste", "te lo saltaste" ni "atrasado". Un bloque que no
 * marcaste dice exactamente eso: que no lo marcaste. Hay una prueba que
 * recorre todos los casos y revienta si alguna vez aparece una de esas
 * palabras, para que no se cuele en un descuido dentro de seis meses.
 */
export function textoEstado(oc, fecha, hoy = today()) {
  if (oc?.hecho) return 'Hecho'
  if (esPasado(fecha, hoy)) return 'Sin marcar'
  if (esHoy(fecha, hoy)) return 'Para hoy'
  return 'Por venir'
}

/**
 * El resumen de un día. A propósito NO devuelve porcentaje de cumplimiento ni
 * cuántos "faltaron": ese número no existe en esta app. Solo cuenta lo que hay
 * y lo que marcaste.
 */
export function resumenDia(ocurrencias = []) {
  const { conHora, sinHora } = separarDia(ocurrencias)
  return {
    total: ocurrencias.length,
    hechos: ocurrencias.filter((oc) => oc.hecho).length,
    conHora: conHora.length,
    sinHora: sinHora.length,
  }
}

/* ============================================================ tira de días */

/** Las fechas de la tira de arriba: unos días atrás y varios adelante. */
export function rangoDias(centro = today(), atras = 3, adelante = 17) {
  const total = atras + adelante + 1
  return Array.from({ length: total }, (_, i) => addDays(centro, i - atras))
}

/** Los días de la tira que tienen algo, para pintarles el puntito. */
export function diasConAlgo(blocks = [], overrides = [], fechas = []) {
  const conAlgo = new Set()
  for (const f of fechas) {
    if (ocurrenciasDelDia(blocks, overrides, f).length > 0) conAlgo.add(f)
  }
  return conAlgo
}

/* ============================================================= intenciones */

/**
 * Las intenciones son la otra mitad de la pantalla y NO tienen hora. Responden
 * "¿qué importa hoy?", no "¿a qué hora?". Son máximo tres a propósito: una
 * lista de veinte intenciones no es una intención, es una lista de deseos.
 *
 * Un día puede tener intenciones sin un solo bloque, y al revés. Por eso viven
 * en su propia tabla en vez de ser bloques marcados de alguna manera.
 */
export const MAX_INTENCIONES = 3

export const intencionesDelDia = (intentions = [], fecha) =>
  intentions
    .filter((i) => i?.date === fecha)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

export const hayEspacio = (lista = []) => lista.length < MAX_INTENCIONES

/** El siguiente hueco libre, para no repetir `order` al agregar. */
export const siguienteOrden = (lista = []) =>
  lista.reduce((max, i) => Math.max(max, (i.order ?? 0) + 1), 0)

/**
 * El texto de arriba de las intenciones. Cuando no hay ninguna no dice
 * "no has puesto nada": invita. Cuando faltan, tampoco cuenta lo que falta.
 */
export function textoIntenciones(lista = [], esDeHoy = true) {
  const hechas = lista.filter((i) => i?.done === 1).length
  if (lista.length === 0) {
    return esDeHoy ? '¿Qué haría que hoy valiera la pena?' : '¿Qué quieres que importe ese día?'
  }
  if (hechas === 0) return esDeHoy ? 'Lo que importa hoy' : 'Lo que importa ese día'
  if (hechas === lista.length) return lista.length === 1 ? 'Listo' : 'Las tres, listas'
  return `${hechas} de ${lista.length} listas`
}

/* ================================================================ calendario */

/**
 * NO HAY NOTIFICACIONES, Y ES A PROPÓSITO
 *
 * Esto es una app web guardada en la pantalla de inicio. En iOS las
 * notificaciones de una app web solo existen si está instalada, y además
 * necesitarían un servidor de push encendido las 24 horas (que cuesta dinero).
 * Prometerte una alarma que a veces no suena es peor que no prometer nada.
 *
 * En vez de eso, cualquier bloque se puede exportar como archivo .ics y
 * dejárselo al Calendario del iPhone, que sí sabe avisar y ya vive en tu
 * teléfono. Esta función solo arma el texto del archivo; bajarlo es cosa de la
 * interfaz.
 *
 * Ojo con las horas: el .ics se escribe SIN zona horaria (lo que el estándar
 * llama "hora flotante"). Es exactamente lo mismo que hacemos nosotros — las
 * 2 son las 2 marque lo que marque el reloj del mundo — así que el evento
 * llega al calendario con la hora que tú escribiste.
 */
const escapaIcs = (texto) =>
  String(texto ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')

const selloFechaHora = (fecha, hora) =>
  `${fecha.replace(/-/g, '')}T${(normalizaHora(hora) ?? '00:00').replace(':', '')}00`

const DIAS_ICS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

/** El primer día en el que de verdad ocurre una serie (o la fecha del único). */
export function primeraOcurrencia(block) {
  if (!esSerie(block)) return block?.date ?? null
  let f = block.startDate
  if (!f) return null
  for (let i = 0; i < 7; i++) {
    if (ocurreNatural(block, f)) return f
    f = addDays(f, 1)
  }
  return null
}

/**
 * El contenido de un archivo .ics para un bloque. Si el bloque se repite, sale
 * como serie (una regla RRULE) y el calendario del teléfono la expande solo.
 *
 * Lo que NO viaja: las excepciones sueltas ("esta semana fue a las 4"). El
 * archivo lleva la regla, no los parches. Se dice en la interfaz para que no
 * sea una sorpresa.
 */
export function bloqueAIcs(block, { uid = 'betterme', sello = '20260101T000000Z' } = {}) {
  const inicio = primeraOcurrencia(block)
  if (!inicio) return null

  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BetterMe//Agenda//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}@betterme`,
    `DTSTAMP:${sello}`,
    `SUMMARY:${escapaIcs(block.name ?? 'Bloque')}`,
  ]

  if (esHora(block.start)) {
    const dur = Math.max(0, Math.round(Number(block.mins) || 0)) || 30
    lineas.push(`DTSTART:${selloFechaHora(inicio, block.start)}`)
    lineas.push(`DTEND:${selloFechaHora(inicio, finDeBloque(block.start, dur))}`)
  } else {
    // Sin hora fija: un evento de día completo. El fin va al día siguiente
    // porque en el estándar el final de un evento de día completo es exclusivo.
    lineas.push(`DTSTART;VALUE=DATE:${inicio.replace(/-/g, '')}`)
    lineas.push(`DTEND;VALUE=DATE:${addDays(inicio, 1).replace(/-/g, '')}`)
  }

  if (esSerie(block)) {
    const dias = ORDEN_LUNES.filter((d) => (block.weekdays ?? []).includes(d))
      .map((d) => DIAS_ICS[d])
      .join(',')
    let regla = `RRULE:FREQ=WEEKLY;BYDAY=${dias}`
    if (block.endDate) regla += `;UNTIL=${selloFechaHora(block.endDate, '23:59')}`
    lineas.push(regla)
  }

  if (block.note) lineas.push(`DESCRIPTION:${escapaIcs(block.note)}`)

  lineas.push('END:VEVENT', 'END:VCALENDAR')

  // El estándar pide fin de línea de Windows (retorno de carro + salto).
  return `${lineas.join('\r\n')}\r\n`
}

/** Un nombre de archivo sin acentos ni espacios, que iOS no maltrate. */
export function nombreArchivoIcs(nombre) {
  const limpio = String(nombre ?? 'bloque')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita los acentos que NFD dejó sueltos // quita los acentos que NFD dejó sueltos
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return `${limpio || 'bloque'}.ics`
}
