import { useState } from 'react'
import { despertarPendiente, posponerPendiente } from '../../db/db.js'
import { today } from '../../lib/format.js'
import { OPCIONES_POSPONER, estaPospuesto, fechaPosponer, textoRegreso } from '../../lib/todos.js'
import { Button, Chip, Field, Input, Sheet } from '../../components/ui.jsx'

/**
 * "No ahorita." Posponer solo esconde el pendiente hasta la fecha que elijas;
 * no lo marca, no lo borra y no reinicia desde cuándo espera. Cuando llega el
 * día vuelve solo a la bandeja, en el mismo lugar que le tocaba.
 */
export default function HojaPosponer({ open, todo, onClose, hoy = today() }) {
  const [fecha, setFecha] = useState('')

  if (!todo) return null

  async function aplicar(dias) {
    await posponerPendiente(todo.id, fechaPosponer(dias, hoy))
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Guardar para después">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          <b className="text-ink2">{todo.name}</b> desaparece de la lista y regresa solo ese día.
          No cuenta como hecho ni como fallado.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {OPCIONES_POSPONER.map((o) => (
            <Chip key={o.id} onClick={() => aplicar(o.dias)}>
              {o.label}
            </Chip>
          ))}
        </div>

        <Field label="O una fecha exacta">
          <div className="flex gap-2">
            <Input type="date" value={fecha} min={hoy} onChange={(e) => setFecha(e.target.value)} />
            <Button
              disabled={!fecha || fecha <= hoy}
              onClick={async () => {
                await posponerPendiente(todo.id, fecha)
                onClose()
              }}
            >
              Guardar
            </Button>
          </div>
        </Field>

        {estaPospuesto(todo, hoy) && (
          <div className="space-y-2 border-t border-line pt-4">
            <p className="text-sm text-ink2">{textoRegreso(todo, hoy)}.</p>
            <Button
              variant="ghost"
              className="w-full"
              onClick={async () => {
                await despertarPendiente(todo.id)
                onClose()
              }}
            >
              Traerlo de vuelta ahora
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  )
}
