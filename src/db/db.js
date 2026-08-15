import Dexie from 'dexie'
import { today } from '../lib/format.js'
import { esHora, MAX_INTENCIONES } from '../lib/agenda.js'
import { patrimonio } from '../lib/patrimonio.js'

/**
 * Base de datos local (IndexedDB) — vive DENTRO del navegador del teléfono.
 * No hay servidor: si el celular está en modo avión, todo sigue funcionando.
 *
 * Reglas de la casa:
 *  - El dinero SIEMPRE es un número entero de pesos. Nunca centavos, nunca decimales.
 *  - Cada registro trae `id` (uuid) y `updatedAt`, por si algún día quieres
 *    sincronizar entre dispositivos sin rehacer el esquema.
 */
export const db = new Dexie('betterme')

db.version(1).stores({
  // El primer campo es la llave primaria; los demás son índices para buscar rápido.
  transactions: 'id, date, type, envelopeId, updatedAt',
  envelopes: 'id, kind, order, updatedAt',
  goals: 'id, order, updatedAt',
  settings: 'key',
})

/**
 * Versión 2: hábitos. En Dexie las versiones son escalones: solo describes lo
 * que cambia y él actualiza la base que ya está en el teléfono sin borrar nada.
 * Las tablas de la versión 1 se quedan tal cual.
 *
 *  habits   → hábitos sueltos (tomar agua, leer…), cada uno con su frecuencia
 *  cycles   → un ciclo rotativo, con nombre y fecha de arranque (el "ancla")
 *  routines → las rutinas A / B / C que se turnan dentro de un ciclo
 *  checks   → una palomita: "esto se cumplió tal día". Sin hora.
 *
 * `[targetId+date]` es un índice compuesto: sirve para preguntar "¿está marcado
 * esto en esta fecha?" de un solo golpe.
 */
db.version(2).stores({
  habits: 'id, active, order, updatedAt',
  cycles: 'id, order, updatedAt',
  routines: 'id, cycleId, order, updatedAt',
  checks: 'id, date, targetId, kind, [targetId+date], updatedAt',
})

/**
 * Versión 3: pendientes. Otro escalón, con UNA sola tabla nueva. Los bloques de
 * arriba no se tocan nunca: si editaras la versión 2, la base que ya está en el
 * teléfono se rompería al abrir la app.
 *
 *  todos → una tarea de una sola vez. Se hace y se va.
 *
 * Los campos que importan:
 *  - `since`       'AAAA-MM-DD', desde cuándo espera. Es lo que mide la
 *                  antigüedad. NO es fecha límite: aquí no vence nada.
 *  - `snoozeUntil` 'AAAA-MM-DD' o null. Mientras sea mayor que hoy, el
 *                  pendiente se esconde de la bandeja y vuelve solo ese día.
 *  - `importance`  'alta' | 'normal' | 'baja'.
 *  - `done`        1 / 0, y `doneAt` con la fecha. Como quedamos, solo se
 *                  guarda la ÚLTIMA vez: no hay tabla de historial porque un
 *                  pendiente se hace una sola vez.
 *
 * `done` va como 1 / 0 y no como true / false porque IndexedDB no sabe indexar
 * booleanos: es la misma rareza del navegador que ya vimos con `active`.
 */
db.version(3).stores({
  todos: 'id, done, importance, since, snoozeUntil, doneAt, updatedAt',
})

/**
 * Versión 4: agenda. Tercer escalón, tres tablas nuevas. Igual que antes, los
 * bloques de arriba NO se tocan: si editaras la versión 3, la base que ya está
 * en el teléfono se rompería al abrir la app.
 *
 *  blocks     → un bloque de agenda. O pasa una sola vez (`repite: 0`, con su
 *               `date`), o es una REGLA que se repite (`repite: 1`, con
 *               `weekdays`, `startDate` y un `endDate` opcional).
 *               "Cada martes y jueves a las 2" es UNA fila, aunque dure un
 *               semestre: los días se calculan al pintar, no se escriben.
 *
 *  blockDays  → lo que pasó de verdad un día concreto: si lo marcaste, si lo
 *               moviste, si lo cancelaste o si ese día cambió de hora. Solo
 *               existen filas de los días que tocaste, así que un semestre de
 *               clases sin cambios no ocupa ni una. Es la misma idea de
 *               `checks` en hábitos: se guarda lo hecho, no lo no hecho.
 *
 *  intentions → las hasta tres intenciones del día. No tienen hora: responden
 *               "¿qué importa hoy?", no "¿a qué hora?". Por eso viven aparte de
 *               los bloques en vez de ser bloques marcados de algún modo.
 *
 * `[blockId+date]` es un índice compuesto, igual que el de las palomitas:
 * responde "¿qué pasó con este bloque este día?" de un solo golpe.
 *
 * `repite`, `done` y `cancelado` van como 1 / 0 y no como true / false porque
 * IndexedDB no sabe indexar booleanos. Es la rareza del navegador de siempre.
 *
 * Nota sobre `date` en `blocks`: en una serie vale null. IndexedDB simplemente
 * no mete esas filas en el índice `date` (null no es una llave válida), lo cual
 * nos viene bien: buscar por `date` devuelve solo los bloques de una sola vez.
 */
db.version(4).stores({
  blocks: 'id, date, repite, start, updatedAt',
  blockDays: 'id, blockId, date, movedTo, [blockId+date], updatedAt',
  intentions: 'id, date, done, order, [date+order], updatedAt',
})

/**
 * Versión 5: patrimonio. Cuarto escalón, UNA tabla nueva.
 *
 *  goalMoves → la bitácora de cada meta. Cada vez que apartas, retiras o usas
 *              dinero queda una línea. `goal.saved` sigue siendo la verdad
 *              (es el número que se lee mil veces al pintar); esta tabla es el
 *              "¿de dónde salió esto?" y solo se lee al abrir la meta.
 *
 *              kind: 'abono'  → dinero libre que pasa a estar apartado
 *                    'retiro' → lo apartado regresa a estar libre
 *                    'uso'    → gastaste el dinero de la meta: sale de la meta
 *                               Y sale de tu patrimonio (deja además un gasto
 *                               real en `transactions`, ligado por `txId`)
 *
 * Apartar NO es gastar: es ponerle etiqueta al dinero. Por eso abonos y
 * retiros viven aparte de `transactions` y no ensucian la gráfica de los
 * últimos 6 meses. La única excepción es 'uso', donde el dinero sí se va.
 *
 * El `upgrade` convierte lo que cada meta ya tenía guardado en su primer
 * abono, para que la bitácora arranque cuadrada en vez de en blanco.
 */
db.version(5)
  .stores({
    goalMoves: 'id, goalId, date, kind, [goalId+date], updatedAt',
  })
  .upgrade(async (tx) => {
    const metas = await tx.table('goals').toArray()
    const semilla = metas
      .filter((g) => (g.saved ?? 0) > 0)
      .map((g) => ({
        id: uid(),
        goalId: g.id,
        kind: 'abono',
        amount: Math.round(g.saved),
        note: 'Lo que ya llevabas',
        txId: null,
        date: today(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    if (semilla.length) await tx.table('goalMoves').bulkAdd(semilla)
  })

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())

const now = () => new Date().toISOString()

/* ------------------------------------------------------------------ ajustes */

export const DEFAULT_SETTINGS = {
  key: 'general',
  monthlyIncome: 0, // ingreso mensual estimado, entero
  monthlySavings: 0, // cuánto quieres apartar al mes, entero
  useRealIncome: false, // true = calcular con los ingresos que registres, no con el estimado
  // El dinero que YA tenías el día que empezaste a usar la app. Es el punto de
  // partida del patrimonio: sin él, el total arrancaría en $0 y solo sería
  // correcto después de años de registrar todo.
  initialBalance: 0,
  updatedAt: now(),
}

export async function getSettings() {
  return (await db.settings.get('general')) ?? DEFAULT_SETTINGS
}

export async function saveSettings(patch) {
  const current = await getSettings()
  await db.settings.put({ ...current, ...patch, key: 'general', updatedAt: now() })
}

/* ------------------------------------------------------------------- sobres */

/** kind: 'fijo' = dinero comprometido · 'libre' = gasto del día a día */
export async function addEnvelope({ name, kind = 'libre', budget = 0 }) {
  const count = await db.envelopes.count()
  return db.envelopes.add({
    id: uid(),
    name,
    kind,
    budget: Math.round(budget),
    order: count,
    updatedAt: now(),
  })
}

export async function updateEnvelope(id, patch) {
  await db.envelopes.update(id, { ...patch, updatedAt: now() })
}

export async function deleteEnvelope(id) {
  await db.transaction('rw', db.envelopes, db.transactions, async () => {
    await db.envelopes.delete(id)
    // Los movimientos no se borran: se quedan sin sobre.
    await db.transactions.where('envelopeId').equals(id).modify({ envelopeId: null })
  })
}

/* -------------------------------------------------------------- movimientos */

/** type: 'gasto' | 'ingreso' · amount: entero positivo · date: 'AAAA-MM-DD' */
export async function addTransaction({ amount, type = 'gasto', envelopeId = null, note = '', date }) {
  return db.transactions.add({
    id: uid(),
    amount: Math.max(0, Math.round(Number(amount) || 0)),
    type,
    envelopeId,
    note: note.trim(),
    date,
    createdAt: now(),
    updatedAt: now(),
  })
}

export async function updateTransaction(id, patch) {
  const limpio = { ...patch, updatedAt: now() }
  if ('amount' in limpio) limpio.amount = Math.max(0, Math.round(Number(limpio.amount) || 0))
  if ('note' in limpio) limpio.note = limpio.note.trim()
  await db.transactions.update(id, limpio)
}

export async function deleteTransaction(id) {
  await db.transactions.delete(id)
}

/* -------------------------------------------------------------------- metas */

/**
 * Las tablas que hacen falta para saber cuánto dinero libre hay. Cualquier
 * operación que aparte dinero tiene que abrirlas todas de golpe.
 */
const TABLAS_DINERO = () => [db.settings, db.transactions, db.goals, db.goalMoves]

/** Anota una línea en la bitácora de la meta. */
function nuevoMovimientoDeMeta({ goalId, kind, amount, note = '', txId = null, date }) {
  return {
    id: uid(),
    goalId,
    kind, // 'abono' | 'retiro' | 'uso'
    amount: Math.max(0, Math.round(Number(amount) || 0)),
    note: note.trim(),
    txId,
    date: date ?? today(),
    createdAt: now(),
    updatedAt: now(),
  }
}

/**
 * Crea una meta. Nace SIEMPRE en cero: lo apartado solo se mueve con abonos y
 * retiros, que son los que respetan el tope. Si quieres apartar algo de una vez
 * al crearla, pásale `apartarAhora` y se hace como un abono normal (con su
 * validación y su línea en la bitácora).
 */
export async function addGoal({ name, target, deadline = null, apartarAhora = 0 }) {
  const id = uid()
  const count = await db.goals.count()
  await db.goals.add({
    id,
    name,
    target: Math.max(0, Math.round(target)),
    saved: 0,
    deadline, // 'AAAA-MM-DD' o null
    order: count,
    updatedAt: now(),
  })

  const inicial = Math.round(Number(apartarAhora) || 0)
  if (inicial > 0) {
    const r = await abonarMeta(id, inicial)
    // Si no alcanzaba, la meta se queda creada pero en cero y la pantalla te
    // dice cuánto faltó. Borrarla sola sería peor: perderías el nombre y la
    // fecha que acabas de escribir.
    return { id, abono: r }
  }
  return { id, abono: null }
}

export async function updateGoal(id, patch) {
  // `saved` no se toca por aquí a propósito: es la puerta que se colaba y
  // permitía apartar dinero que no existe. Usa abonarMeta / retirarMeta.
  const { saved, ...limpio } = patch
  if ('target' in limpio) limpio.target = Math.max(0, Math.round(Number(limpio.target) || 0))
  await db.goals.update(id, { ...limpio, updatedAt: now() })
}

/** Borra la meta y su bitácora. Lo que tenía apartado vuelve solo a ser libre. */
export async function deleteGoal(id) {
  await db.transaction('rw', db.goals, db.goalMoves, async () => {
    await db.goals.delete(id)
    await db.goalMoves.where('goalId').equals(id).delete()
  })
}

/**
 * APARTAR. La regla de oro de la app vive en estas líneas: no puedes apartar
 * más dinero del que tienes libre.
 *
 * Regresa { ok, apartado, libre, faltante } — nunca lanza un error — para que
 * la pantalla pueda decirte exactamente cuánto te faltó.
 */
export async function abonarMeta(id, amount, { note = '', date } = {}) {
  const monto = Math.round(Number(amount) || 0)
  if (monto <= 0) return { ok: false, motivo: 'vacio', faltante: 0 }

  return db.transaction('rw', ...TABLAS_DINERO(), async () => {
    const goal = await db.goals.get(id)
    if (!goal) return { ok: false, motivo: 'no-existe', faltante: 0 }

    const [settings, transactions, goals] = await Promise.all([
      db.settings.get('general'),
      db.transactions.toArray(),
      db.goals.toArray(),
    ])
    const { libre } = patrimonio({ settings: settings ?? DEFAULT_SETTINGS, transactions, goals })

    if (monto > libre) {
      return { ok: false, motivo: 'no-alcanza', libre, faltante: monto - libre }
    }

    await db.goals.update(id, { saved: goal.saved + monto, updatedAt: now() })
    await db.goalMoves.add(nuevoMovimientoDeMeta({ goalId: id, kind: 'abono', amount: monto, note, date }))
    return { ok: true, apartado: goal.saved + monto, libre: libre - monto, faltante: 0 }
  })
}

/**
 * RETIRAR. Lo apartado vuelve a ser dinero libre. El dinero no se mueve de
 * ningún lado: solo se le quita la etiqueta. El tope es lo que la meta tenga.
 */
export async function retirarMeta(id, amount, { note = '', date } = {}) {
  const monto = Math.round(Number(amount) || 0)
  if (monto <= 0) return { ok: false, motivo: 'vacio', faltante: 0 }

  return db.transaction('rw', db.goals, db.goalMoves, async () => {
    const goal = await db.goals.get(id)
    if (!goal) return { ok: false, motivo: 'no-existe', faltante: 0 }
    if (monto > goal.saved) {
      return { ok: false, motivo: 'no-alcanza', faltante: monto - goal.saved, tope: goal.saved }
    }

    await db.goals.update(id, { saved: goal.saved - monto, updatedAt: now() })
    await db.goalMoves.add(nuevoMovimientoDeMeta({ goalId: id, kind: 'retiro', amount: monto, note, date }))
    return { ok: true, apartado: goal.saved - monto, faltante: 0 }
  })
}

/**
 * USAR LA META: ya compraste la laptop. Este es el único movimiento de metas
 * donde el dinero SÍ se va de tu patrimonio, así que hace dos cosas de un
 * jalón y de forma atómica (o pasan las dos, o no pasa ninguna):
 *
 *   1. registra un gasto de verdad en `transactions` — el total baja
 *   2. saca ese dinero de lo apartado en la meta — deja de tener dueño
 *
 * Si lo hicieras a mano en dos pasos y se te olvidara uno, las cuentas
 * quedarían chuecas para siempre. Por eso es un botón.
 */
export async function usarMeta(id, { amount, note = '', envelopeId = null, date } = {}) {
  return db.transaction('rw', db.goals, db.goalMoves, db.transactions, async () => {
    const goal = await db.goals.get(id)
    if (!goal) return { ok: false, motivo: 'no-existe' }

    const monto = Math.min(goal.saved, Math.round(Number(amount ?? goal.saved) || 0))
    if (monto <= 0) return { ok: false, motivo: 'vacio' }

    const cuando = date ?? today()
    const txId = uid()
    await db.transactions.add({
      id: txId,
      amount: monto,
      type: 'gasto',
      envelopeId,
      note: note.trim() || goal.name,
      date: cuando,
      createdAt: now(),
      updatedAt: now(),
    })
    await db.goals.update(id, { saved: goal.saved - monto, updatedAt: now() })
    await db.goalMoves.add(
      nuevoMovimientoDeMeta({ goalId: id, kind: 'uso', amount: monto, note, txId, date: cuando }),
    )
    return { ok: true, gastado: monto, restante: goal.saved - monto }
  })
}


/* ------------------------------------------------------------------ hábitos */

/**
 * Un hábito suelto. `schedule` dice qué días toca:
 *   { type: 'diario' }
 *   { type: 'semana', weekdays: [1, 3, 5] }   ← 0 = domingo … 6 = sábado
 *   { type: 'cadaN',  n: 3 }                  ← cada 3 días, contando desde startDate
 *
 * `active` va como 1 / 0 y no como true / false porque IndexedDB no sabe
 * indexar booleanos. Es una rareza del navegador, no un capricho.
 */
export async function addHabit({ name, schedule = { type: 'diario' }, startDate, color = 'brand' }) {
  const count = await db.habits.count()
  const id = uid()
  await db.habits.add({
    id,
    name: name.trim() || 'Hábito',
    schedule,
    startDate: startDate ?? today(),
    color,
    active: 1,
    order: count,
    createdAt: now(),
    updatedAt: now(),
  })
  return id
}

export async function updateHabit(id, patch) {
  await db.habits.update(id, { ...patch, updatedAt: now() })
}

/** Borra el hábito Y su historial de palomitas: si no, quedarían huérfanas. */
export async function deleteHabit(id) {
  await db.transaction('rw', db.habits, db.checks, async () => {
    await db.habits.delete(id)
    await db.checks.where('targetId').equals(id).delete()
  })
}

/* ------------------------------------------------------------------- ciclos */

/**
 * Un ciclo rotativo. `startDate` es el ancla: desde ahí se cuenta la rotación.
 * `weekdays` son los días en los que el ciclo trabaja (por defecto todos).
 */
export async function addCycle({ name, startDate, weekdays = [0, 1, 2, 3, 4, 5, 6] }) {
  const count = await db.cycles.count()
  const id = uid()
  await db.cycles.add({
    id,
    name: name.trim() || 'Ciclo',
    startDate: startDate ?? today(),
    weekdays,
    order: count,
    createdAt: now(),
    updatedAt: now(),
  })
  return id
}

export async function updateCycle(id, patch) {
  await db.cycles.update(id, { ...patch, updatedAt: now() })
}

export async function deleteCycle(id) {
  await db.transaction('rw', db.cycles, db.routines, db.checks, async () => {
    const rutinas = await db.routines.where('cycleId').equals(id).toArray()
    await db.cycles.delete(id)
    await db.routines.where('cycleId').equals(id).delete()
    for (const r of rutinas) await db.checks.where('targetId').equals(r.id).delete()
  })
}

/* ------------------------------------------------------------------ rutinas */

/**
 * Una rutina dentro de un ciclo. `steps` es la lista de pasos o ejercicios:
 * [{ id, name }]. `rest: true` marca un día de descanso, que cuenta como
 * cumplido solo.
 */
export async function addRoutine({ cycleId, name, steps = [], rest = false }) {
  const count = await db.routines.where('cycleId').equals(cycleId).count()
  const id = uid()
  await db.routines.add({
    id,
    cycleId,
    name: name.trim() || 'Rutina',
    steps,
    rest,
    order: count,
    createdAt: now(),
    updatedAt: now(),
  })
  return id
}

export async function updateRoutine(id, patch) {
  await db.routines.update(id, { ...patch, updatedAt: now() })
}

export async function deleteRoutine(id) {
  await db.transaction('rw', db.routines, db.checks, async () => {
    await db.routines.delete(id)
    await db.checks.where('targetId').equals(id).delete()
  })
}

/** Mueve una rutina arriba o abajo. El orden ES la rotación, así que importa. */
export async function moverRutina(cycleId, id, direccion) {
  const lista = await db.routines.where('cycleId').equals(cycleId).sortBy('order')
  const i = lista.findIndex((r) => r.id === id)
  const j = i + direccion
  if (i < 0 || j < 0 || j >= lista.length) return
  ;[lista[i], lista[j]] = [lista[j], lista[i]]
  await db.transaction('rw', db.routines, async () => {
    for (let k = 0; k < lista.length; k++) {
      await db.routines.update(lista[k].id, { order: k, updatedAt: now() })
    }
  })
}

/* ----------------------------------------------------------------- palomitas */

/** Busca la palomita de algo en una fecha. Devuelve undefined si no existe. */
export async function getCheck(targetId, date) {
  return db.checks.where('[targetId+date]').equals([targetId, date]).first()
}

/**
 * Prende o apaga la palomita de un hábito o de una rutina completa.
 * Si la apagas, la fila se borra: no guardamos "no lo hice", solo lo hecho.
 */
export async function alternarMarca({ targetId, kind, date, steps = [] }) {
  const actual = await getCheck(targetId, date)
  if (actual?.done) {
    await db.checks.delete(actual.id)
    return false
  }
  if (actual) {
    await db.checks.update(actual.id, { done: 1, steps, updatedAt: now() })
  } else {
    await db.checks.add({
      id: uid(),
      targetId,
      kind,
      date,
      done: 1,
      steps,
      createdAt: now(),
      updatedAt: now(),
    })
  }
  return true
}

/**
 * Marca o desmarca un paso suelto de una rutina (un ejercicio, por ejemplo).
 * Cuando caen todos los pasos, la rutina se da por hecha sola. Si quitas uno,
 * regresa a "en progreso" sin perder los demás.
 */
export async function alternarPaso({ routineId, date, stepId, totalPasos }) {
  const actual = await getCheck(routineId, date)
  const previos = actual?.steps ?? []
  const steps = previos.includes(stepId)
    ? previos.filter((s) => s !== stepId)
    : [...previos, stepId]
  const done = totalPasos > 0 && steps.length >= totalPasos ? 1 : 0

  if (!actual) {
    await db.checks.add({
      id: uid(),
      targetId: routineId,
      kind: 'rutina',
      date,
      done,
      steps,
      createdAt: now(),
      updatedAt: now(),
    })
    return
  }
  // Sin pasos marcados y sin terminar: ya no hay nada que guardar.
  if (steps.length === 0 && !done) await db.checks.delete(actual.id)
  else await db.checks.update(actual.id, { steps, done, updatedAt: now() })
}

/* -------------------------------------------------------------- ejemplo */

/**
 * Crea un ciclo de ejemplo (gimnasio A / B / C con descanso) y dos hábitos.
 * Se llama desde el botón de la pantalla vacía, no al arrancar: prefiero que
 * la app no invente datos que tú no pediste.
 */
export async function crearEjemploHabitos() {
  const hoy = today()
  const cycleId = await addCycle({ name: 'Gimnasio', startDate: hoy })
  const rutinas = [
    { name: 'A · Empuje', steps: ['Press banca', 'Press militar', 'Fondos'] },
    { name: 'B · Jalón', steps: ['Dominadas', 'Remo', 'Curl'] },
    { name: 'Descanso', steps: [], rest: true },
    { name: 'C · Pierna', steps: ['Sentadilla', 'Peso muerto', 'Pantorrilla'] },
    { name: 'Descanso', steps: [], rest: true },
  ]
  for (const r of rutinas) {
    await addRoutine({
      cycleId,
      name: r.name,
      rest: r.rest ?? false,
      steps: r.steps.map((name) => ({ id: uid(), name })),
    })
  }
  await addHabit({ name: 'Tomar 2 L de agua', schedule: { type: 'diario' }, startDate: hoy })
  await addHabit({ name: 'Leer 20 minutos', schedule: { type: 'diario' }, startDate: hoy })
  await addHabit({ name: 'Llamar a casa', schedule: { type: 'semana', weekdays: [0] }, startDate: hoy })
}

/* --------------------------------------------------------------- pendientes */

/**
 * Anota un pendiente. `since` es desde cuándo espera: por defecto hoy, pero se
 * puede poner una fecha vieja para algo que llevas cargando desde antes.
 */
export async function addTodo({ name, note = '', importance = 'normal', since = null }) {
  const id = uid()
  await db.todos.add({
    id,
    name: name.trim() || 'Pendiente',
    note: note.trim(),
    importance,
    since: since ?? today(),
    snoozeUntil: null,
    done: 0,
    doneAt: null,
    createdAt: now(),
    updatedAt: now(),
  })
  return id
}

export async function updateTodo(id, patch) {
  const limpio = { ...patch, updatedAt: now() }
  if ('name' in limpio) limpio.name = limpio.name.trim() || 'Pendiente'
  if ('note' in limpio) limpio.note = limpio.note.trim()
  await db.todos.update(id, limpio)
}

export async function deleteTodo(id) {
  await db.todos.delete(id)
}

/**
 * Marca o desmarca un pendiente. Al marcarlo se guarda la fecha y se le quita
 * el "posponer": ya no tiene sentido esconder algo que ya hiciste.
 *
 * Desmarcar lo devuelve a la bandeja tal como estaba, sin castigo y sin perder
 * desde cuándo esperaba. Equivocarse de fila no debería costar nada.
 */
export async function alternarPendiente(id) {
  const t = await db.todos.get(id)
  if (!t) return false
  const hecho = t.done === 1
  await db.todos.update(id, {
    done: hecho ? 0 : 1,
    doneAt: hecho ? null : today(),
    snoozeUntil: hecho ? t.snoozeUntil : null,
    updatedAt: now(),
  })
  return !hecho
}

/** Lo esconde de la bandeja hasta esa fecha ('AAAA-MM-DD'). */
export async function posponerPendiente(id, fecha) {
  await db.todos.update(id, { snoozeUntil: fecha, updatedAt: now() })
}

/** Lo regresa a la bandeja ahora mismo, sin esperar a que llegue el día. */
export async function despertarPendiente(id) {
  await db.todos.update(id, { snoozeUntil: null, updatedAt: now() })
}

/** Borra de golpe una lista de pendientes ya hechos (el botón "limpiar"). */
export async function limpiarPendientes(ids = []) {
  if (ids.length === 0) return
  await db.todos.bulkDelete(ids)
}

/**
 * Tres pendientes de ejemplo, con antigüedades distintas para que se vea de
 * inmediato cómo ordena la lista. Se llama desde el botón de la pantalla
 * vacía, no al arrancar: la app no inventa datos que no pediste.
 */
export async function crearEjemploPendientes() {
  const hoy = today()
  const hace = (n) => {
    const d = new Date(`${hoy}T00:00:00`)
    d.setDate(d.getDate() - n)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  await addTodo({ name: 'Sacar cita con el dentista', importance: 'alta', since: hace(9) })
  await addTodo({ name: 'Cambiar la llanta de la bici', importance: 'normal', since: hace(24) })
  await addTodo({
    name: 'Ordenar las fotos del viaje',
    importance: 'baja',
    since: hace(3),
    note: 'Sin prisa. Cuando haya un domingo lento.',
  })
}

/* ------------------------------------------------------------------ agenda */

/**
 * Crea un bloque de agenda. Dos formas posibles, y `repite` decide cuál:
 *
 *   una sola vez → addBlock({ name, start: '14:00', mins: 60, date: '2026-08-20' })
 *   se repite    → addBlock({ name, start: '14:00', mins: 90, repite: 1,
 *                             weekdays: [2, 4], startDate, endDate })
 *
 * `start` puede ser null: eso es un bloque "flexible", algo que pasa ese día
 * pero sin hora concreta. La agenda lo pone en su propio grupo en vez de
 * colarlo en la línea de tiempo fingiendo un horario que no tiene.
 */
export async function addBlock({
  name,
  note = '',
  start = null,
  mins = 60,
  repite = 0,
  date = null,
  weekdays = [],
  startDate = null,
  endDate = null,
}) {
  const id = uid()
  const serie = repite === 1
  await db.blocks.add({
    id,
    name: String(name ?? '').trim() || 'Bloque',
    note: String(note ?? '').trim(),
    start: esHora(start) ? start : null,
    mins: Math.max(0, Math.round(Number(mins) || 0)),
    repite: serie ? 1 : 0,
    // Solo se llena lo que le toca a cada forma. Un bloque con fecha suelta Y
    // regla al mismo tiempo sería imposible de interpretar después.
    date: serie ? null : (date ?? today()),
    weekdays: serie ? [...weekdays].sort((a, b) => a - b) : [],
    startDate: serie ? (startDate ?? today()) : null,
    endDate: serie ? (endDate || null) : null,
    createdAt: now(),
    updatedAt: now(),
  })
  return id
}

export async function updateBlock(id, patch) {
  const limpio = { ...patch, updatedAt: now() }
  if ('name' in limpio) limpio.name = String(limpio.name ?? '').trim() || 'Bloque'
  if ('note' in limpio) limpio.note = String(limpio.note ?? '').trim()
  if ('start' in limpio) limpio.start = esHora(limpio.start) ? limpio.start : null
  if ('mins' in limpio) limpio.mins = Math.max(0, Math.round(Number(limpio.mins) || 0))
  if ('weekdays' in limpio) limpio.weekdays = [...(limpio.weekdays ?? [])].sort((a, b) => a - b)
  if ('endDate' in limpio) limpio.endDate = limpio.endDate || null

  // Al cambiar de forma se limpian los campos de la otra, por la misma razón
  // de arriba: que nunca queden los dos juegos de datos a la vez.
  if ('repite' in limpio) {
    limpio.repite = limpio.repite === 1 ? 1 : 0
    if (limpio.repite === 1) {
      limpio.date = null
      limpio.startDate = limpio.startDate ?? today()
    } else {
      limpio.date = limpio.date ?? today()
      limpio.startDate = null
      limpio.endDate = null
      limpio.weekdays = []
    }
  }
  await db.blocks.update(id, limpio)
}

/** Borra el bloque Y sus excepciones: si no, quedarían huérfanas para siempre. */
export async function deleteBlock(id) {
  await db.transaction('rw', db.blocks, db.blockDays, async () => {
    await db.blocks.delete(id)
    await db.blockDays.where('blockId').equals(id).delete()
  })
}

/* ------------------------------------------------------ un día en concreto */

/**
 * El corazón de las excepciones. Recibe qué cambió de un bloque en un día y
 * guarda, actualiza o BORRA la fila de `blockDays` según convenga.
 *
 * Lo importante es la última parte: si después del cambio el día vuelve a ser
 * "normal" (sin marcar, sin mover, sin cancelar y sin hora propia), la fila se
 * borra en vez de quedarse llena de ceros. Así la tabla solo tiene lo que de
 * verdad se salió de la regla, y deshacer algo deja la base como si nunca
 * hubiera pasado.
 */
const DIA_NEUTRO = { done: 0, doneAt: null, cancelado: 0, movedTo: null, start: null, mins: null }

async function parcheDia(blockId, fecha, patch) {
  const actual = await db.blockDays.where('[blockId+date]').equals([blockId, fecha]).first()
  const base = actual
    ? {
        done: actual.done ?? 0,
        doneAt: actual.doneAt ?? null,
        cancelado: actual.cancelado ?? 0,
        movedTo: actual.movedTo ?? null,
        start: actual.start ?? null,
        mins: actual.mins ?? null,
      }
    : { ...DIA_NEUTRO }

  const nuevo = { ...base, ...patch }
  const esNeutro =
    nuevo.done !== 1 &&
    nuevo.cancelado !== 1 &&
    !nuevo.movedTo &&
    !nuevo.start &&
    (nuevo.mins === null || nuevo.mins === undefined)

  if (esNeutro) {
    if (actual) await db.blockDays.delete(actual.id)
    return
  }
  if (actual) await db.blockDays.update(actual.id, { ...nuevo, updatedAt: now() })
  else {
    await db.blockDays.add({
      id: uid(),
      blockId,
      date: fecha,
      ...nuevo,
      createdAt: now(),
      updatedAt: now(),
    })
  }
}

/**
 * Marca o desmarca un bloque en un día. `fecha` es siempre la fecha ORIGINAL de
 * la ocurrencia (la que le da identidad), aunque la hayas movido a otro día.
 *
 * Se puede marcar un día que ya pasó, y eso no es un caso raro: es justo lo que
 * hace falta cuando sí lo hiciste pero se te olvidó marcarlo. No hay penalización
 * ni límite de tiempo para hacerlo.
 */
export async function alternarBloque(blockId, fecha) {
  const actual = await db.blockDays.where('[blockId+date]').equals([blockId, fecha]).first()
  const hecho = actual?.done === 1
  await parcheDia(blockId, fecha, { done: hecho ? 0 : 1, doneAt: hecho ? null : now() })
  return !hecho
}

/** Pasa esta ocurrencia a otro día, sin tocar el resto de la serie. */
export async function moverBloque(blockId, fecha, hacia) {
  await parcheDia(blockId, fecha, { movedTo: hacia && hacia !== fecha ? hacia : null })
}

/**
 * "Pásalo a otro día", que se comporta distinto según la forma del bloque:
 *
 *  · Si se repite, se guarda una excepción y la regla no se toca: mueves ESA
 *    clase, no el semestre entero.
 *  · Si es de una sola vez, no hace falta excepción ninguna: se le cambia la
 *    fecha y ya. Su marca se muda con él para que no quede huérfana en un día
 *    en el que ya no hay nada.
 */
export async function moverOcurrencia(block, fecha, hacia) {
  if (!block || !hacia || hacia === fecha) return
  if (block.repite === 1) {
    await moverBloque(block.id, fecha, hacia)
    return
  }
  await db.transaction('rw', db.blocks, db.blockDays, async () => {
    await db.blocks.update(block.id, { date: hacia, updatedAt: now() })
    const marca = await db.blockDays.where('[blockId+date]').equals([block.id, fecha]).first()
    if (marca) await db.blockDays.update(marca.id, { date: hacia, updatedAt: now() })
  })
}

/** "Esta semana no hay clase": quita solo esta ocurrencia, la serie sigue viva. */
export async function cancelarBloque(blockId, fecha) {
  await parcheDia(blockId, fecha, { cancelado: 1 })
}

/** "Esta semana la clase es a las 4": cambia la hora solo de este día. */
export async function cambiarHoraDelDia(blockId, fecha, { start, mins } = {}) {
  await parcheDia(blockId, fecha, {
    start: esHora(start) ? start : null,
    mins: Number.isFinite(mins) ? Math.max(0, Math.round(mins)) : null,
  })
}

/** Devuelve el día a como lo dice la regla, sin perder si estaba marcado. */
export async function restaurarDia(blockId, fecha) {
  await parcheDia(blockId, fecha, { cancelado: 0, movedTo: null, start: null, mins: null })
}

/* ------------------------------------------------------------- intenciones */

/**
 * Las intenciones del día: máximo tres, sin hora. El tope no es decorativo —
 * una lista de veinte intenciones ya no es una intención. Si no cabe, la
 * función devuelve null y la interfaz simplemente deja de ofrecer el hueco.
 */
export async function addIntention({ date, text }) {
  const delDia = await db.intentions.where('date').equals(date).toArray()
  if (delDia.length >= MAX_INTENCIONES) return null
  const id = uid()
  await db.intentions.add({
    id,
    date,
    text: String(text ?? '').trim() || 'Intención',
    order: delDia.reduce((max, i) => Math.max(max, (i.order ?? 0) + 1), 0),
    done: 0,
    doneAt: null,
    createdAt: now(),
    updatedAt: now(),
  })
  return id
}

export async function updateIntention(id, patch) {
  const limpio = { ...patch, updatedAt: now() }
  if ('text' in limpio) limpio.text = String(limpio.text ?? '').trim() || 'Intención'
  await db.intentions.update(id, limpio)
}

export async function deleteIntention(id) {
  await db.intentions.delete(id)
}

export async function alternarIntencion(id) {
  const i = await db.intentions.get(id)
  if (!i) return false
  const hecha = i.done === 1
  await db.intentions.update(id, {
    done: hecha ? 0 : 1,
    doneAt: hecha ? null : now(),
    updatedAt: now(),
  })
  return !hecha
}

/**
 * Un día de ejemplo: una clase que se repite, dos citas de hoy, un bloque sin
 * hora fija y dos intenciones. Se llama desde el botón de la pantalla vacía,
 * no al arrancar: la app no inventa datos que no pediste.
 */
export async function crearEjemploAgenda() {
  const hoy = today()
  await addBlock({
    name: 'Clase de inglés',
    start: '19:00',
    mins: 90,
    repite: 1,
    weekdays: [2, 4], // martes y jueves
    startDate: hoy,
    note: 'Se repite sola: es una regla, no 40 filas en la base.',
  })
  await addBlock({ name: 'Llamada del trabajo', start: '10:30', mins: 30, date: hoy })
  await addBlock({ name: 'Comida con Ana', start: '14:00', mins: 60, date: hoy })
  await addBlock({ name: 'Pasar a la farmacia', start: null, mins: 0, date: hoy })
  await addIntention({ date: hoy, text: 'Terminar el reporte' })
  await addIntention({ date: hoy, text: 'Caminar 30 minutos' })
}

/* ------------------------------------------------------------- primera vez */

export async function seedIfEmpty() {
  const yaHaySobres = await db.envelopes.count()
  if (yaHaySobres > 0) return

  // Los ajustes solo se crean si NO existen. Antes esto era un `put` a secas,
  // y como la señal de "primera vez" es no tener sobres, el día que te
  // quedaras sin sobres te borraba de un golpe tu ingreso mensual y —ahora—
  // tu saldo inicial. Los ajustes no le pertenecen a los sobres.
  const yaHayAjustes = await db.settings.get('general')
  if (!yaHayAjustes) await db.settings.put(DEFAULT_SETTINGS)
  const base = [
    { name: 'Renta', kind: 'fijo', budget: 0 },
    { name: 'Transporte', kind: 'fijo', budget: 0 },
    { name: 'Servicios', kind: 'fijo', budget: 0 },
    { name: 'Comida', kind: 'libre', budget: 0 },
    { name: 'Antojos', kind: 'libre', budget: 0 },
    { name: 'Otros', kind: 'libre', budget: 0 },
  ]
  await db.envelopes.bulkAdd(
    base.map((e, i) => ({ id: uid(), ...e, order: i, updatedAt: now() })),
  )
}

/* ------------------------------------------------------------- respaldo */

/** Baja un archivo .json con TODO. Es tu única red de seguridad: úsalo seguido. */
export async function exportBackup() {
  const data = {
    app: 'betterme',
    version: 5,
    exportedAt: now(),
    settings: await db.settings.toArray(),
    envelopes: await db.envelopes.toArray(),
    transactions: await db.transactions.toArray(),
    goals: await db.goals.toArray(),
    goalMoves: await db.goalMoves.toArray(),
    habits: await db.habits.toArray(),
    cycles: await db.cycles.toArray(),
    routines: await db.routines.toArray(),
    checks: await db.checks.toArray(),
    todos: await db.todos.toArray(),
    blocks: await db.blocks.toArray(),
    blockDays: await db.blockDays.toArray(),
    intentions: await db.intentions.toArray(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `betterme-${today()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Reemplaza todo el contenido actual por el del archivo de respaldo. */
export async function importBackup(file) {
  const text = await file.text()
  const data = JSON.parse(text)
  if (data.app !== 'betterme') throw new Error('Ese archivo no es un respaldo de BetterMe.')

  const tablas = [
    db.settings, db.envelopes, db.transactions, db.goals, db.goalMoves,
    db.habits, db.cycles, db.routines, db.checks,
    db.todos,
    db.blocks, db.blockDays, db.intentions,
  ]

  await db.transaction('rw', tablas, async () => {
    await Promise.all(tablas.map((t) => t.clear()))
    // Un respaldo viejo simplemente no trae las tablas nuevas: el de la
    // versión 1 no tiene hábitos, el de la 2 no tiene pendientes, el de la 3
    // no tiene agenda y el de la 4 no tiene la bitácora de metas. Se restaura
    // lo que sí venga y lo demás se queda vacío, sin reventar. Por eso la
    // lista se recorre por nombre en vez de asumir que el archivo trae todo.
    for (const nombre of [
      'settings', 'envelopes', 'transactions', 'goals', 'goalMoves',
      'habits', 'cycles', 'routines', 'checks', 'todos',
      'blocks', 'blockDays', 'intentions',
    ]) {
      if (data[nombre]?.length) await db[nombre].bulkAdd(data[nombre])
    }

    // Un respaldo de la versión 4 o anterior trae metas con dinero pero sin
    // bitácora. Se le siembra su primer abono, igual que hace el `upgrade`,
    // para que la meta no se vea como si el dinero hubiera aparecido solo.
    if (!data.goalMoves?.length && data.goals?.length) {
      const semilla = data.goals
        .filter((g) => (g.saved ?? 0) > 0)
        .map((g) =>
          nuevoMovimientoDeMeta({
            goalId: g.id,
            kind: 'abono',
            amount: g.saved,
            note: 'Lo que ya llevabas',
          }),
        )
      if (semilla.length) await db.goalMoves.bulkAdd(semilla)
    }
  })
}
