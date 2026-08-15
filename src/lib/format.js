/** Formato de dinero. Enteros siempre: nada de centavos. */
const mxn = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

export const money = (n) => mxn.format(Math.round(Number(n) || 0))

/** Versión corta para ejes de gráficas: 12500 -> "12.5k" */
export const moneyShort = (n) => {
  const v = Math.round(Number(n) || 0)
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
  return String(v)
}

/* ------------------------------------------------------------------ fechas */

/** 'AAAA-MM-DD' del día de hoy, en la hora local del teléfono. */
export const today = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

/** 'AAAA-MM' del mes de hoy. */
export const currentMonth = () => today().slice(0, 7)

export const monthOf = (isoDate) => isoDate.slice(0, 7)

export const daysInMonth = (ym = currentMonth()) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export const dayOfMonth = () => new Date().getDate()

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return `${MESES[m - 1]} ${String(y).slice(2)}`
}

/** Mueve un 'AAAA-MM' n meses adelante (n negativo = hacia atrás). */
export const addMonth = (ym, n) => {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** 'AAAA-MM-DD' de hace n días. */
export const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

/** Los últimos n meses en formato 'AAAA-MM', del más viejo al más nuevo. */
export const lastMonths = (n) => {
  const out = []
  const d = new Date()
  d.setDate(1)
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1)
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

/** Cuántos días pasaron desde una fecha 'AAAA-MM-DD'. */
export const daysSince = (isoDate) => {
  const a = new Date(`${isoDate}T00:00:00`)
  const b = new Date(`${today()}T00:00:00`)
  return Math.round((b - a) / 86400000)
}

/** "hoy", "ayer", "hace 3 días" */
export const relativeDay = (isoDate) => {
  const d = daysSince(isoDate)
  if (d === 0) return 'hoy'
  if (d === 1) return 'ayer'
  if (d < 0) return `en ${-d} días`
  return `hace ${d} días`
}

/* ------------------------------------------ fechas para hábitos y calendarios */

/**
 * Convierte un objeto Date a 'AAAA-MM-DD' usando la hora LOCAL del teléfono.
 * Ojo: `date.toISOString()` a secas usa UTC y en México te daría el día
 * anterior después de las 6 de la tarde. Por eso armamos el texto a mano.
 */
const isoLocal = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Suma n días a una fecha 'AAAA-MM-DD' (n negativo = hacia atrás). */
export const addDays = (isoDate, n) => {
  const d = new Date(`${isoDate}T00:00:00`)
  d.setDate(d.getDate() + n)
  return isoLocal(d)
}

/** Días entre dos fechas: diasEntre('2026-08-10', '2026-08-15') === 5 */
export const diasEntre = (desde, hasta) =>
  Math.round((new Date(`${hasta}T00:00:00`) - new Date(`${desde}T00:00:00`)) / 86400000)

/** Día de la semana: 0 = domingo, 1 = lunes … 6 = sábado (igual que JS). */
export const diaSemana = (isoDate) => new Date(`${isoDate}T00:00:00`).getDay()

/** Mismo día pero contando desde el lunes: 0 = lunes … 6 = domingo. */
export const diaSemanaLunes = (isoDate) => (diaSemana(isoDate) + 6) % 7

/** El orden de la semana que usamos en pantalla: lunes primero. */
export const SEMANA = [
  { n: 1, corto: 'L', largo: 'lunes' },
  { n: 2, corto: 'M', largo: 'martes' },
  { n: 3, corto: 'X', largo: 'miércoles' },
  { n: 4, corto: 'J', largo: 'jueves' },
  { n: 5, corto: 'V', largo: 'viernes' },
  { n: 6, corto: 'S', largo: 'sábado' },
  { n: 0, corto: 'D', largo: 'domingo' },
]

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

/** "vie 15" */
export const diaCorto = (isoDate) =>
  `${DIAS_CORTOS[diaSemana(isoDate)]} ${Number(isoDate.slice(8, 10))}`

const MESES_LARGOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** "sábado 15 de agosto" */
export const fechaLarga = (isoDate) => {
  const [, m, d] = isoDate.split('-').map(Number)
  const nombre = SEMANA.find((s) => s.n === diaSemana(isoDate))?.largo ?? ''
  return `${nombre} ${d} de ${MESES_LARGOS[m - 1]}`
}

/** Todas las fechas 'AAAA-MM-DD' de un mes, en orden. */
export const diasDelMes = (ym) =>
  Array.from({ length: daysInMonth(ym) }, (_, i) => `${ym}-${String(i + 1).padStart(2, '0')}`)
