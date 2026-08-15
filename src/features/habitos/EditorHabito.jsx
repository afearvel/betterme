import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { addHabit, deleteHabit, updateHabit } from '../../db/db.js'
import { SEMANA, today } from '../../lib/format.js'
import { Button, Card, Chip, Field, Input, Sheet, Toggle } from '../../components/ui.jsx'

const vacio = {
  name: '',
  tipo: 'diario',
  weekdays: [1, 3, 5],
  n: '3',
  startDate: today(),
  active: true,
}

/** Hoja para crear o editar un hábito suelto (los que no van en un ciclo). */
export default function EditorHabito({ open, habit, onClose }) {
  const [form, setForm] = useState(vacio)

  useEffect(() => {
    if (!open) return
    if (!habit) return setForm({ ...vacio, startDate: today() })

    const s = habit.schedule ?? { type: 'diario' }
    setForm({
      name: habit.name,
      tipo: s.type,
      weekdays: s.weekdays ?? [1, 3, 5],
      n: String(s.n ?? 3),
      startDate: habit.startDate ?? today(),
      active: habit.active !== 0,
    })
  }, [open, habit])

  function alternarDia(n) {
    const hay = form.weekdays.includes(n)
    const nuevos = hay ? form.weekdays.filter((d) => d !== n) : [...form.weekdays, n]
    if (nuevos.length === 0) return
    setForm({ ...form, weekdays: nuevos.sort() })
  }

  async function guardar() {
    // El horario se arma según el tipo elegido: así nunca se guardan campos
    // sueltos que no aplican y la lógica no tiene que adivinar nada.
    const schedule =
      form.tipo === 'semana'
        ? { type: 'semana', weekdays: form.weekdays }
        : form.tipo === 'cadaN'
          ? { type: 'cadaN', n: Math.max(1, Number(form.n) || 1) }
          : { type: 'diario' }

    const datos = {
      name: form.name.trim() || 'Hábito',
      schedule,
      startDate: form.startDate || today(),
      active: form.active ? 1 : 0,
    }

    if (habit) await updateHabit(habit.id, datos)
    else await addHabit(datos)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={habit ? 'Editar hábito' : 'Nuevo hábito'}>
      <div className="space-y-4">
        <Field label="Nombre">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Leer 20 minutos"
            autoFocus={!habit}
          />
        </Field>

        <Field label="Cada cuándo">
          <div className="flex gap-2">
            <Chip active={form.tipo === 'diario'} onClick={() => setForm({ ...form, tipo: 'diario' })} className="flex-1">
              Diario
            </Chip>
            <Chip active={form.tipo === 'semana'} onClick={() => setForm({ ...form, tipo: 'semana' })} className="flex-1">
              Días fijos
            </Chip>
            <Chip active={form.tipo === 'cadaN'} onClick={() => setForm({ ...form, tipo: 'cadaN' })} className="flex-1">
              Cada N días
            </Chip>
          </div>
        </Field>

        {form.tipo === 'semana' && (
          <Field label="Qué días">
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
        )}

        {form.tipo === 'cadaN' && (
          <Field label="Cada cuántos días" hint="Se cuenta desde la fecha de inicio de abajo.">
            <Input
              value={form.n}
              onChange={(e) => setForm({ ...form, n: e.target.value.replace(/[^\d]/g, '') })}
              inputMode="numeric"
              placeholder="3"
            />
          </Field>
        )}

        <Field label="Empieza el" hint="Antes de esta fecha el hábito no cuenta ni para la racha ni para el porcentaje.">
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value || today() })}
          />
        </Field>

        {habit && (
          <Card className="p-3">
            <Toggle
              checked={!form.active}
              onChange={(v) => setForm({ ...form, active: !v })}
              label="Pausar"
              hint="Deja de aparecer y de contar, pero conserva su historial. Útil cuando no quieres borrarlo."
            />
          </Card>
        )}

        <div className="flex gap-2">
          <Button onClick={guardar} className="flex-1">
            Guardar
          </Button>
          {habit && (
            <Button
              variant="danger"
              aria-label="Borrar hábito"
              onClick={async () => {
                await deleteHabit(habit.id)
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
