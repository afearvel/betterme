/**
 * PATRIMONIO — la cuenta más importante de la app.
 *
 * Todo se apoya en una sola idea:
 *
 *      total   = saldo inicial + ingresos − gastos      (el dinero que existe)
 *      apartado = suma de lo guardado en TODAS las metas (dinero con dueño)
 *      libre   = total − apartado                       (dinero sin dueño)
 *
 * "Apartar" NO mueve dinero: solo le pone una etiqueta. Por eso abonar a una
 * meta jamás cambia el total; cambia el reparto. Y por eso la regla de oro es
 * que la suma de lo apartado nunca puede pasarse del total: no puedes repartir
 * dinero que no tienes.
 *
 * Aquí solo hay funciones puras: reciben datos y regresan números. Ni React ni
 * base de datos. Así puedes leer las cuentas (y corregirlas) sin abrir la app,
 * y se pueden probar con `node pruebas-patrimonio.mjs`.
 */

const suma = (arr, f) => arr.reduce((acc, x) => acc + f(x), 0)

const entero = (n) => Math.round(Number(n) || 0)

/** Lo guardado en una meta, sin dejar que un dato raro meta negativos. */
export const apartadoDe = (goal) => Math.max(0, entero(goal?.saved))

/** Suma histórica de ingresos y de gastos. OJO: de toda la vida, no de un mes. */
export function totalDeMovimientos(transactions = []) {
  return {
    ingresos: suma(transactions.filter((t) => t.type === 'ingreso'), (t) => entero(t.amount)),
    gastos: suma(transactions.filter((t) => t.type === 'gasto'), (t) => entero(t.amount)),
  }
}

/**
 * La foto completa de tu dinero. Es lo que pinta la pantalla de Patrimonio y
 * la tarjeta de arriba en Dinero.
 *
 * `saldoInicial` existe porque la app nace hoy y tu dinero no: es el punto de
 * partida, "lo que ya tenía cuando empecé a usar esto". Sin él, el total
 * arrancaría en $0 y solo sería correcto dentro de varios años.
 */
export function patrimonio({ settings, transactions = [], goals = [] } = {}) {
  const inicial = entero(settings?.initialBalance)
  const { ingresos, gastos } = totalDeMovimientos(transactions)

  const total = inicial + ingresos - gastos
  const apartado = suma(goals, apartadoDe)
  const libre = total - apartado

  return {
    inicial,
    ingresos,
    gastos,
    total,
    apartado,
    libre,
    // Te pasaste repartiendo: hay más etiquetado en metas que dinero real.
    // Solo puede pasar por caminos indirectos (borrar un ingreso, bajar el
    // saldo inicial, un gasto que decidiste registrar de todos modos).
    sobreapartado: libre < 0,
    // Debes dinero: gastaste más de lo que tenías.
    enRojo: total < 0,
    // Qué parte del total ya tiene dueño, de 0 a 1. Para la barra.
    pctApartado: total > 0 ? Math.min(1, apartado / total) : apartado > 0 ? 1 : 0,
    sinDatos: inicial === 0 && ingresos === 0 && gastos === 0,
  }
}

/**
 * La barra de reparto: un pedazo por meta y uno al final para el dinero libre.
 *
 * El 100% de la barra es el total... salvo que te hayas pasado apartando. En
 * ese caso el 100% es lo apartado, para que la barra no se salga de la
 * pantalla y se vea claro que ya no queda nada libre.
 */
export function repartoDelTotal({ goals = [], total = 0, apartado = 0, libre = 0 } = {}) {
  const base = Math.max(total, apartado, 1) // el 1 evita dividir entre cero
  const partes = goals
    .filter((g) => apartadoDe(g) > 0)
    .map((g) => ({
      id: g.id,
      name: g.name,
      monto: apartadoDe(g),
      pct: apartadoDe(g) / base,
      tipo: 'meta',
    }))

  if (libre > 0) {
    partes.push({ id: 'libre', name: 'Libre', monto: libre, pct: libre / base, tipo: 'libre' })
  }
  return partes
}

/* ------------------------------------------------------- reglas de apartado */

/**
 * ¿Puedo apartar este monto? Es LA validación que pediste: no se puede
 * repartir dinero que no existe.
 *
 * Regresa siempre el mismo objeto para que la pantalla no tenga que adivinar:
 *   ok        → se puede
 *   faltante  → cuánto te falta para que sí se pueda
 *   tope      → el máximo que sí puedes apartar ahorita
 */
export function revisarApartado({ libre = 0, monto = 0 } = {}) {
  const m = entero(monto)
  const tope = Math.max(0, entero(libre))
  return {
    ok: m > 0 && m <= tope,
    vacio: m <= 0,
    monto: m,
    tope,
    faltante: Math.max(0, m - tope),
  }
}

/** ¿Puedo retirar este monto de la meta? El tope es lo que la meta tiene. */
export function revisarRetiro({ goal, monto = 0 } = {}) {
  const m = entero(monto)
  const tope = apartadoDe(goal)
  return {
    ok: m > 0 && m <= tope,
    vacio: m <= 0,
    monto: m,
    tope,
    faltante: Math.max(0, m - tope),
  }
}

/* ---------------------------------------------------------- reglas de gasto */

/**
 * Antes de registrar un gasto: ¿cabe en el dinero libre?
 *
 * El gasto NO se bloquea (ya pasó en la vida real), pero si se pasa hay que
 * avisar y ofrecerte sacar la diferencia de alguna meta.
 */
export function revisarGasto({ libre = 0, total = 0, monto = 0 } = {}) {
  const m = entero(monto)
  const faltante = Math.max(0, m - Math.max(0, entero(libre)))
  return {
    monto: m,
    cabe: faltante === 0,
    faltante,
    // Ni sacando de todas las metas alcanza: esto te deja en números rojos.
    pasaDelTotal: m > entero(total),
    libreDespues: entero(libre) - m,
    totalDespues: entero(total) - m,
  }
}

/**
 * Las metas de donde se puede sacar la diferencia, ordenadas por conveniencia.
 * El orden no es capricho: es "cuál te cuesta menos tocar".
 *
 *   1. Primero las que cubren TODO el faltante ellas solas, así solo mueves
 *      una meta. De esas, la que tiene menos dinero: mejor vaciar la chiquita
 *      que picarle a la grande.
 *   2. Después las que no alcanzan solas, de mayor a menor. Si vas a tener que
 *      juntar de varias, conviene empezar por la que más aporta.
 */
export function metasParaRescate({ goals = [], faltante = 0 } = {}) {
  const f = Math.max(0, entero(faltante))
  return goals
    .filter((g) => apartadoDe(g) > 0)
    .map((g) => ({
      id: g.id,
      name: g.name,
      saved: apartadoDe(g),
      cubre: apartadoDe(g) >= f,
      retiro: Math.min(apartadoDe(g), f),
      restante: Math.max(0, f - apartadoDe(g)),
    }))
    .sort((a, b) => {
      if (a.cubre !== b.cubre) return a.cubre ? -1 : 1
      return a.cubre ? a.saved - b.saved : b.saved - a.saved
    })
}

/** ¿Hay al menos una meta con dinero de donde sacar? */
export const hayDeDondeSacar = (goals = []) => goals.some((g) => apartadoDe(g) > 0)

/* ------------------------------------------------------------ saldo inicial */

/**
 * Si cambias el saldo inicial hacia abajo, puedes dejar el total por debajo de
 * lo que ya repartiste en metas. Esto te dice si ese cambio rompe la cuenta
 * ANTES de guardarlo, para poder avisarte.
 */
export function revisarSaldoInicial({ nuevo = 0, transactions = [], goals = [] } = {}) {
  const p = patrimonio({ settings: { initialBalance: nuevo }, transactions, goals })
  return {
    total: p.total,
    apartado: p.apartado,
    libre: p.libre,
    rompe: p.libre < 0,
    faltante: Math.max(0, -p.libre),
  }
}
