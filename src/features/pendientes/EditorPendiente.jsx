import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { addTodo, deleteTodo, updateTodo } from '../../db/db.js'
import { today } from '../../lib/format.js'
import { IMPORTANCIAS, diasEsperando, textoEspera } from '../../lib/todos.js'
import { Button, Chip, Field, Input, Sheet } from '../../components/ui.jsx'

const vacio = { name: '', note: '', importance: 'normal', since: today() }

/** Hoja para crear o corregir un pendiente. */
export default function EditorPendiente({ open, todo, onClose, hoy = today() }) {
  const [form, setForm] = useState(vacio)

  useEffect(() => {
    if (!open) return
    if (!todo) return setForm({ ...vacio, since: hoy })
    setForm({
      name: todo.name ?? '',
      note: todo.note ?? '',
      importance: todo.importance ?? 'normal',
      since: todo.since ?? hoy,
    })
  }, [open, todo, hoy])

  async function guardar() {
    const datos = {
      name: form.name,
      note: form.note,
      importance: form.importance,
      since: form.since || hoy,
    }
    if (todo) await updateTodo(todo.id, datos)
    else await addTodo(datos)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={todo ? 'Editar pendiente' : 'Nuevo pendiente'}>
      <div className="space-y-4">
        <Field label="Qué es">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Sacar cita con el dentista"
            autoFocus={!todo}
          />
        </Field>

        <Field label="Nota" hint="Opcional: el teléfono al que hay que hablar, dónde quedó la pieza…">
          {/* textarea a mano y no <Input> porque una nota necesita varias
              líneas. Las clases son las mismas para que se vea igual. */}
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-xl border border-line bg-plane px-3 py-3 text-ink outline-none focus:border-brand"
          />
        </Field>

        <Field label="Importancia" hint="Solo decide qué tan arriba sale en la lista.">
          <div className="flex gap-2">
            {IMPORTANCIAS.map((i) => (
              <Chip
                key={i.id}
                active={form.importance === i.id}
                onClick={() => setForm({ ...form, importance: i.id })}
                className="flex-1"
              >
                {i.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field
          label="Esperando desde"
          hint="No es fecha límite: aquí nada vence. Solo mide la espera, y dentro de cada nivel lo más viejo sube."
        >
          <Input
            type="date"
            value={form.since}
            max={hoy}
            onChange={(e) => setForm({ ...form, since: e.target.value || hoy })}
          />
        </Field>

        {todo && (
          <p className="text-xs text-muted">{textoEspera(diasEsperando(todo, hoy))}.</p>
        )}

        <div className="flex gap-2">
          <Button onClick={guardar} disabled={!form.name.trim()} className="flex-1">
            Guardar
          </Button>
          {todo && (
            <Button
              variant="danger"
              aria-label="Borrar pendiente"
              onClick={async () => {
                await deleteTodo(todo.id)
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
