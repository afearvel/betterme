import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Moon, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  addCycle, addRoutine, deleteCycle, deleteRoutine, moverRutina, uid, updateCycle, updateRoutine,
} from '../../db/db.js'
import { SEMANA, today } from '../../lib/format.js'
import { Button, Card, Chip, Field, Input, Sheet, Toggle } from '../../components/ui.jsx'

const cicloVacio = { name: '', startDate: today(), weekdays: [0, 1, 2, 3, 4, 5, 6] }

/**
 * Hoja para crear o editar un ciclo. Un ciclo son tres cosas:
 *   · un nombre
 *   · una fecha de arranque (el "ancla" desde donde se cuenta la rotación)
 *   · una lista ORDENADA de rutinas — ese orden es la rotación
 *
 * `cycle` viene como objeto para editar, o como null para crear uno nuevo.
 */
export default function EditorCiclo({ open, cycle, routines = [], onClose }) {
  const [form, setForm] = useState(cicloVacio)
  const [rutinaAbierta, setRutinaAbierta] = useState(null) // objeto rutina, o 'nueva'

  // Cada vez que se abre la hoja, el formulario se recarga con lo que hay.
  useEffect(() => {
    if (!open) return
    setForm(
      cycle
        ? { name: cycle.name, startDate: cycle.startDate, weekdays: cycle.weekdays ?? [0, 1, 2, 3, 4, 5, 6] }
        : cicloVacio,
    )
  }, [open, cycle])

  const misRutinas = cycle ? routines.filter((r) => r.cycleId === cycle.id) : []

  function alternarDia(n) {
    const hay = form.weekdays.includes(n)
    const nuevos = hay ? form.weekdays.filter((d) => d !== n) : [...form.weekdays, n]
    if (nuevos.length === 0) return // al menos un día, si no el ciclo nunca correría
    setForm({ ...form, weekdays: nuevos.sort() })
  }

  async function guardar() {
    const datos = {
      name: form.name.trim() || 'Ciclo',
      startDate: form.startDate || today(),
      weekdays: form.weekdays,
    }
    if (cycle) await updateCycle(cycle.id, datos)
    else await addCycle(datos)
    onClose()
  }

  async function borrar() {
    if (cycle) await deleteCycle(cycle.id)
    onClose()
  }

  return (
    <>
      <Sheet open={open} onClose={onClose} title={cycle ? 'Editar ciclo' : 'Nuevo ciclo'}>
        <div className="space-y-4">
          <Field label="Nombre">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Gimnasio"
              autoFocus={!cycle}
            />
          </Field>

          <Field
            label="Empieza el"
            hint="Desde este día se cuenta la rotación. Si lo cambias, se recorre qué rutina toca cada día — el historial de lo ya marcado no se toca."
          >
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value || today() })}
            />
          </Field>

          <Field label="Días que corre el ciclo" hint="Los días apagados no cuentan: la rotación se congela y sigue donde iba.">
            <div className="flex gap-1.5">
              {SEMANA.map((d) => (
                <Chip
                  key={d.n}
                  active={form.weekdays.includes(d.n)}
                  onClick={() => alternarDia(d.n)}
                  className="flex-1 px-0 text-center"
                >
                  {d.corto}
                </Chip>
              ))}
            </div>
          </Field>

          {cycle ? (
            <Field label="Rutinas en rotación" hint="El orden de esta lista es el orden en que se turnan, un día cada una.">
              <div className="space-y-2">
                {misRutinas.length === 0 && (
                  <p className="text-xs text-muted">
                    Todavía no hay rutinas. Agrega al menos una para que el ciclo empiece a correr.
                  </p>
                )}

                {misRutinas.map((r, i) => (
                  <Card key={r.id} className="flex items-center gap-2 p-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-line/60 text-xs font-semibold text-ink2">
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRutinaAbierta(r)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      {r.rest && <Moon size={14} className="shrink-0 text-muted" />}
                      <span className="truncate text-sm">{r.name}</span>
                      {r.steps?.length > 0 && (
                        <span className="shrink-0 text-xs text-muted">{r.steps.length} pasos</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => moverRutina(cycle.id, r.id, -1)}
                      disabled={i === 0}
                      aria-label="Subir"
                      className="rounded-lg p-1.5 text-muted disabled:opacity-20"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moverRutina(cycle.id, r.id, 1)}
                      disabled={i === misRutinas.length - 1}
                      aria-label="Bajar"
                      className="rounded-lg p-1.5 text-muted disabled:opacity-20"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRutinaAbierta(r)}
                      aria-label="Editar rutina"
                      className="rounded-lg p-1.5 text-muted"
                    >
                      <Pencil size={15} />
                    </button>
                  </Card>
                ))}

                <Button
                  variant="ghost"
                  onClick={() => setRutinaAbierta('nueva')}
                  className="flex w-full items-center justify-center gap-2 py-2 text-sm"
                >
                  <Plus size={16} /> Nueva rutina
                </Button>
              </div>
            </Field>
          ) : (
            <p className="text-xs text-muted">
              Guarda el ciclo y enseguida podrás agregarle sus rutinas.
            </p>
          )}

          <div className="flex gap-2">
            <Button onClick={guardar} className="flex-1">
              Guardar
            </Button>
            {cycle && (
              <Button variant="danger" onClick={borrar} aria-label="Borrar ciclo">
                <Trash2 size={18} />
              </Button>
            )}
          </div>
        </div>
      </Sheet>

      <EditorRutina
        open={rutinaAbierta !== null}
        cycleId={cycle?.id}
        routine={rutinaAbierta === 'nueva' ? null : rutinaAbierta}
        onClose={() => setRutinaAbierta(null)}
      />
    </>
  )
}

/* -------------------------------------------------------------------------- */

const rutinaVacia = { name: '', rest: false, steps: [] }

/**
 * Hoja de una rutina suelta. Los pasos son opcionales: si no pones ninguno,
 * la rutina se marca completa de un solo toque.
 */
function EditorRutina({ open, cycleId, routine, onClose }) {
  const [form, setForm] = useState(rutinaVacia)

  useEffect(() => {
    if (!open) return
    setForm(
      routine
        ? { name: routine.name, rest: Boolean(routine.rest), steps: routine.steps ?? [] }
        : rutinaVacia,
    )
  }, [open, routine])

  const cambiarPaso = (id, name) =>
    setForm({ ...form, steps: form.steps.map((s) => (s.id === id ? { ...s, name } : s)) })

  const quitarPaso = (id) => setForm({ ...form, steps: form.steps.filter((s) => s.id !== id) })

  const agregarPaso = () =>
    setForm({ ...form, steps: [...form.steps, { id: uid(), name: '' }] })

  async function guardar() {
    const datos = {
      name: form.name.trim() || (form.rest ? 'Descanso' : 'Rutina'),
      rest: form.rest,
      // Los pasos vacíos se tiran solos al guardar: nadie quiere renglones fantasma.
      steps: form.rest ? [] : form.steps.filter((s) => s.name.trim()).map((s) => ({ ...s, name: s.name.trim() })),
    }
    if (routine) await updateRoutine(routine.id, datos)
    else await addRoutine({ cycleId, ...datos })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={routine ? 'Editar rutina' : 'Nueva rutina'}>
      <div className="space-y-4">
        <Field label="Nombre">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="A · Empuje"
            autoFocus
          />
        </Field>

        <Card className="p-3">
          <Toggle
            checked={form.rest}
            onChange={(v) => setForm({ ...form, rest: v })}
            label="Día de descanso"
            hint="Ocupa su lugar en la rotación y se cuenta como cumplido solo. Así descansas sin romper la racha."
          />
        </Card>

        {!form.rest && (
          <Field label="Pasos" hint="Opcional. Ejercicios, secciones, lo que sea. Al palomear todos, la rutina se da por hecha.">
            <div className="space-y-2">
              {form.steps.map((s) => (
                <div key={s.id} className="flex gap-2">
                  <Input
                    value={s.name}
                    onChange={(e) => cambiarPaso(s.id, e.target.value)}
                    placeholder="Press banca"
                  />
                  <button
                    type="button"
                    onClick={() => quitarPaso(s.id)}
                    aria-label="Quitar paso"
                    className="shrink-0 rounded-xl px-3 text-muted"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <Button
                variant="ghost"
                onClick={agregarPaso}
                className="flex w-full items-center justify-center gap-2 py-2 text-sm"
              >
                <Plus size={16} /> Agregar paso
              </Button>
            </div>
          </Field>
        )}

        <div className="flex gap-2">
          <Button onClick={guardar} className="flex-1">
            Guardar
          </Button>
          {routine && (
            <Button
              variant="danger"
              aria-label="Borrar rutina"
              onClick={async () => {
                await deleteRoutine(routine.id)
                onClose()
              }}
            >
              <Trash2 size={18} />
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  )
}
