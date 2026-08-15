import { addDays, diasEntre, today } from './format.js'

/**
 * Toda la lógica de los Pendientes vive aquí, como funciones puras: reciben
 * datos y devuelven datos. No importa React ni toca la base de datos, así que
 * la puedes leer y corregir sin abrir la interfaz.
 *
 * Tres ideas mandan en este archivo:
 *
 *  1. Un pendiente es una cosa de UNA SOLA VEZ: se hace y se va. Lo que se
 *     repite con un ritmo es un hábito, y lo que tiene día y hora es agenda.
 *
 *  2. No existen las fechas límite. El único número que llevamos es cuánto
 *     tiempo lleva esperando desde que lo anotaste. Por eso el campo se llama
 *     `since` y no `dueDate`: mide antigüedad, no retraso. Nada aquí dice
 *     "vencido" porque no hay nada que vencer.
 *
 *  3. Que algo lleve mucho tiempo esperando no es una falta tuya: es
 *     información. A los 45 días la app deja de empujarlo y te ofrece
 *     soltarlo (ver `sugiereSoltar`). Es una salida, no un regaño.
 */

/* =========================================================== importancia */

/** El orden en el que se muestran los grupos. El primero manda. */
export const IMPORTANCIAS = [
  { id: 'alta', label: 'Alta' },
  { id: 'normal', label: 'Normal' },
  { id: 'baja', label: 'Baja' },
]

const PESO = { alta: 0, normal: 1, baja: 2 }

/**
 * Convierte la importancia en un número para poder ordenar. Cualquier valor
 * raro (o un pendiente viejo sin el campo) cae en 'normal': prefiero que se
 * vea en medio de la lista a que desaparezca de la pantalla.
 */
export const pesoImportancia = (importance) => PESO[importance] ?? PESO.normal

/** La importancia ya normalizada, para agrupar sin perder nada. */
export const importanciaDe = (todo) =>
  PESO[todo?.importance] === undefined ? 'normal' : todo.importance

export const etiquetaImportancia = (importance) =>
  IMPORTANCIAS.find((i) => i.id === importanciaDe({ importance }))?.label ?? 'Normal'

/* ================================================================ estados */

/** `done` se guarda como 1 / 0 porque IndexedDB no sabe indexar true / false. */
export const yaHecho = (todo) => todo?.done === 1

/**
 * ¿Está guardado para después? `snoozeUntil` es 'AAAA-MM-DD'. En cuanto llega
 * ese día vuelve solo a la lista: posponer esconde, nunca borra ni marca.
 */
export const estaPospuesto = (todo, hoy = today()) =>
  Boolean(todo?.snoozeUntil) && todo.snoozeUntil > hoy

/** Lo que se ve hoy en la bandeja: ni hecho, ni pospuesto. */
export const estaEsperando = (todo, hoy = today()) =>
  !yaHecho(todo) && !estaPospuesto(todo, hoy)

/* ============================================================= antigüedad */

/**
 * Cuántos días lleva esperando. `since` es la fecha desde la que cuenta, y es
 * editable a mano: si algo te lleva dando vueltas en la cabeza desde marzo,
 * puedes anotarlo con esa fecha y la lista lo trata como lo que es.
 *
 * Nunca devuelve negativos: una fecha en el futuro cuenta como recién anotado.
 */
export function diasEsperando(todo, hoy = today()) {
  const desde = todo?.since ?? hoy
  return Math.max(0, diasEntre(desde, hoy))
}

/**
 * El texto de la antigüedad. Fíjate en que ninguna variante dice "atrasado",
 * "vencido" ni "pendiente desde hace demasiado": solo cuenta el tiempo.
 */
export function textoEspera(dias) {
  if (dias <= 0) return 'Anotado hoy'
  if (dias === 1) return 'Desde ayer'
  if (dias < 7) return `Lleva ${dias} días aquí`
  if (dias < 14) return 'Lleva una semana aquí'
  if (dias < 30) return `Lleva ${Math.floor(dias / 7)} semanas aquí`
  if (dias < 60) return 'Lleva un mes aquí'
  return `Lleva ${Math.round(dias / 30)} meses aquí`
}

/* =============================================================== posponer */

/** Los atajos de la hoja de posponer. `dias` se suma a hoy. */
export const OPCIONES_POSPONER = [
  { id: 'manana', label: 'Mañana', dias: 1 },
  { id: 'tresDias', label: 'En 3 días', dias: 3 },
  { id: 'semana', label: 'En una semana', dias: 7 },
  { id: 'mes', label: 'En un mes', dias: 30 },
]

export const fechaPosponer = (dias, hoy = today()) => addDays(hoy, dias)

/** "Vuelve mañana", "Vuelve en 5 días", "Vuelve en 2 meses". */
export function textoRegreso(todo, hoy = today()) {
  if (!estaPospuesto(todo, hoy)) return 'Vuelve hoy'
  const d = diasEntre(hoy, todo.snoozeUntil)
  if (d === 1) return 'Vuelve mañana'
  if (d < 14) return `Vuelve en ${d} días`
  if (d < 60) return `Vuelve en ${Math.round(d / 7)} semanas`
  return `Vuelve en ${Math.round(d / 30)} meses`
}

/* ================================================================== orden */

/**
 * El orden de la bandeja: primero la importancia que tú pusiste y, dentro de
 * cada nivel, lo que lleva más tiempo esperando. Así lo viejo sube solo sin
 * que tengas que acomodar nada a mano.
 *
 * Devuelve una función comparadora (la que `sort` espera): recibe dos
 * pendientes y regresa negativo si el primero va antes, positivo si va después
 * y 0 si da igual.
 */
export function comparaPendientes(hoy = today()) {
  return (a, b) => {
    const porImportancia = pesoImportancia(a.importance) - pesoImportancia(b.importance)
    if (porImportancia !== 0) return porImportancia

    const porEspera = diasEsperando(b, hoy) - diasEsperando(a, hoy) // más viejo, más arriba
    if (porEspera !== 0) return porEspera

    // Último desempate para que la lista no baile entre pintadas.
    return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'es')
  }
}

/** No modifica el arreglo original: `sort` sí lo haría, y viene de Dexie. */
export const ordenarPendientes = (todos = [], hoy = today()) =>
  [...todos].sort(comparaPendientes(hoy))

/**
 * Parte la lista en las tres secciones de la pantalla, de una sola pasada.
 *
 * Las fechas 'AAAA-MM-DD' se comparan como texto sin problema: están escritas
 * de mayor a menor unidad, así que el orden alfabético ES el cronológico. Esa
 * es la razón de usar ese formato en toda la app.
 */
export function separarPendientes(todos = [], hoy = today()) {
  const activos = []
  const pospuestos = []
  const hechos = []

  for (const t of todos) {
    if (yaHecho(t)) hechos.push(t)
    else if (estaPospuesto(t, hoy)) pospuestos.push(t)
    else activos.push(t)
  }

  activos.sort(comparaPendientes(hoy))
  pospuestos.sort((a, b) => String(a.snoozeUntil).localeCompare(String(b.snoozeUntil)))
  hechos.sort((a, b) => String(b.doneAt ?? '').localeCompare(String(a.doneAt ?? '')))

  return { activos, pospuestos, hechos }
}

/** Los activos partidos en grupos por importancia. Los grupos vacíos no salen. */
export function agruparPorImportancia(activos = []) {
  return IMPORTANCIAS.map(({ id, label }) => ({
    id,
    label,
    items: activos.filter((t) => importanciaDe(t) === id),
  })).filter((g) => g.items.length > 0)
}

/* =============================================================== resumen */

/**
 * Los números de la tarjeta de arriba. El único que celebra algo es
 * `cerradosSemana`: es lo que hiciste, no lo que te falta.
 */
export function resumenPendientes(todos = [], hoy = today()) {
  const { activos, pospuestos, hechos } = separarPendientes(todos, hoy)
  const haceUnaSemana = addDays(hoy, -6) // hoy incluido = 7 días

  return {
    activos: activos.length,
    pospuestos: pospuestos.length,
    hechos: hechos.length,
    cerradosSemana: hechos.filter((t) => String(t.doneAt ?? '') >= haceUnaSemana).length,
  }
}

/* ================================================================ soltar */

/** A partir de aquí la app deja de empujar y ofrece soltar el pendiente. */
export const DIAS_PARA_SOLTAR = 45

/**
 * Si algo lleva mes y medio esperando, lo más probable es que no lo quieras
 * hacer, y eso está bien. En vez de dejarlo ahí acumulando polvo (y culpa),
 * la fila ofrece un botón para borrarlo sin ceremonia.
 */
export const sugiereSoltar = (todo, hoy = today(), umbral = DIAS_PARA_SOLTAR) =>
  estaEsperando(todo, hoy) && diasEsperando(todo, hoy) >= umbral

/** Los hechos con más de n días, que son los que ofrece limpiar la pantalla. */
export const hechosViejos = (todos = [], hoy = today(), dias = 30) =>
  todos.filter((t) => yaHecho(t) && String(t.doneAt ?? '') < addDays(hoy, -dias))
