import { currentMonth, daysInMonth, dayOfMonth, monthOf, today } from './format.js'

/**
 * Todas las cuentas de la app viven aquí, como funciones puras: reciben datos
 * y regresan números. Así puedes leerlas (y corregirlas) sin tocar la interfaz.
 */

const suma = (arr, f) => arr.reduce((acc, x) => acc + f(x), 0)

/** Un gasto cuenta como "libre" si NO está asignado a un sobre fijo. */
export const esGastoLibre = (t, sobresFijos) =>
  t.type === 'gasto' && !sobresFijos.has(t.envelopeId)

export function idsDeSobresFijos(envelopes = []) {
  return new Set(envelopes.filter((e) => e.kind === 'fijo').map((e) => e.id))
}

/** Ingresos y egresos de un mes ('AAAA-MM'). */
export function totalesDelMes(transactions = [], ym = currentMonth()) {
  const delMes = transactions.filter((t) => monthOf(t.date) === ym)
  return {
    ingresos: suma(delMes.filter((t) => t.type === 'ingreso'), (t) => t.amount),
    egresos: suma(delMes.filter((t) => t.type === 'gasto'), (t) => t.amount),
  }
}

/** Cuánto se gastó en cada sobre durante el mes. Regresa un objeto {sobreId: total}. */
export function gastoPorSobre(transactions = [], ym = currentMonth()) {
  const out = {}
  for (const t of transactions) {
    if (t.type !== 'gasto' || monthOf(t.date) !== ym) continue
    const k = t.envelopeId ?? 'sin-sobre'
    out[k] = (out[k] ?? 0) + t.amount
  }
  return out
}

/**
 * El corazón del sistema: cuánto puedes gastar hoy sin desviarte del plan.
 *
 *   comprometido = suma de los sobres fijos (renta, transporte, servicios…)
 *   libreDelMes  = ingreso − comprometido − ahorro
 *   diario       = libreDelMes ÷ días del mes
 *
 * El "colchón" compara lo que llevas gastado contra lo que te tocaba haber
 * gastado a estas alturas del mes. Positivo = vas holgado. Negativo = vas
 * adelantado en gasto, pero nadie te castiga: solo se ve.
 */
export function resumenDiario({ settings, envelopes = [], transactions = [] }) {
  const ym = currentMonth()
  const fijos = idsDeSobresFijos(envelopes)

  const comprometido = suma(envelopes.filter((e) => e.kind === 'fijo'), (e) => e.budget)
  const ahorro = settings?.monthlySavings ?? 0

  // Ingreso variable: si lo activas en Ajustes y ya registraste al menos un
  // ingreso este mes, la app usa ese total real en vez del estimado fijo.
  const ingresoReal = suma(
    transactions.filter((t) => t.type === 'ingreso' && monthOf(t.date) === ym),
    (t) => t.amount,
  )
  const estimado = settings?.monthlyIncome ?? 0
  const usandoReal = Boolean(settings?.useRealIncome) && ingresoReal > 0
  const ingreso = usandoReal ? ingresoReal : estimado

  const libreDelMes = Math.max(0, ingreso - comprometido - ahorro)
  const dias = daysInMonth(ym)
  const diario = Math.floor(libreDelMes / dias)

  const librosDelMes = transactions.filter((t) => monthOf(t.date) === ym && esGastoLibre(t, fijos))
  const gastadoLibreMes = suma(librosDelMes, (t) => t.amount)
  const gastadoHoy = suma(librosDelMes.filter((t) => t.date === today()), (t) => t.amount)

  const presupuestoALaFecha = diario * dayOfMonth()
  const colchon = presupuestoALaFecha - gastadoLibreMes

  return {
    ingreso,
    ingresoReal,
    estimado,
    usandoReal,
    comprometido,
    ahorro,
    libreDelMes,
    diario,
    gastadoHoy,
    gastadoLibreMes,
    restanteHoy: diario - gastadoHoy,
    colchon,
    diasDelMes: dias,
    configurado: ingreso > 0,
  }
}

/** Serie para la gráfica: ingresos vs egresos de los meses que le pases. */
export function serieMensual(transactions = [], meses = []) {
  return meses.map((ym) => {
    const { ingresos, egresos } = totalesDelMes(transactions, ym)
    return { ym, ingresos, egresos, balance: ingresos - egresos }
  })
}

/* -------------------------------------------------------------------- metas */

/** Meses completos que faltan para una fecha 'AAAA-MM-DD' (mínimo 1). */
export function mesesHasta(deadline) {
  if (!deadline) return null
  const fin = new Date(`${deadline}T00:00:00`)
  const hoy = new Date(`${today()}T00:00:00`)
  const dias = Math.max(1, Math.round((fin - hoy) / 86400000))
  return Math.max(1, Math.ceil(dias / 30))
}

/** Cuánto falta, y a qué ritmo hay que ahorrar para llegar. */
export function planDeMeta(goal) {
  const falta = Math.max(0, goal.target - goal.saved)
  const avance = goal.target > 0 ? Math.min(1, goal.saved / goal.target) : 0
  const meses = mesesHasta(goal.deadline)
  const semanas = meses ? Math.max(1, Math.round(meses * 4.33)) : null

  return {
    falta,
    avance,
    meses,
    porMes: meses ? Math.ceil(falta / meses) : null,
    porSemana: semanas ? Math.ceil(falta / semanas) : null,
    listo: falta === 0,
  }
}

/** Sub-hitos automáticos al 25 / 50 / 75 / 100 % de la meta. */
export function hitosDeMeta(goal) {
  return [0.25, 0.5, 0.75, 1].map((p) => ({
    pct: p,
    monto: Math.round(goal.target * p),
    logrado: goal.saved >= Math.round(goal.target * p),
  }))
}
