import { useState } from 'react'
import { ChevronDown, ChevronUp, Undo2 } from 'lucide-react'
import { alternarPendiente, limpiarPendientes } from '../../db/db.js'
import { relativeDay, today } from '../../lib/format.js'
import { hechosViejos } from '../../lib/todos.js'
import { Button, Card } from '../../components/ui.jsx'

/**
 * Lo que ya cerraste. Se queda a la vista a propósito: en una app que se niega
 * a regañarte, esta lista es lo único que lleva la cuenta, y lo que cuenta es
 * lo que sí hiciste.
 *
 * Deshacer siempre está a un toque, por si marcaste la fila equivocada.
 */
export default function Hechos({ hechos = [], hoy = today() }) {
  const [abierto, setAbierto] = useState(false)

  if (hechos.length === 0) return null

  const viejos = hechosViejos(hechos, hoy, 30)
  const visibles = abierto ? hechos : hechos.slice(0, 3)

  return (
    <Card className="space-y-3">
      <ul className="space-y-2">
        {visibles.map((t) => (
          <li key={t.id} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink2 line-through decoration-muted">{t.name}</p>
              <p className="text-xs text-muted">{t.doneAt ? relativeDay(t.doneAt) : ''}</p>
            </div>
            <button
              type="button"
              onClick={() => alternarPendiente(t.id)}
              aria-label={`Regresar ${t.name} a la lista`}
              className="shrink-0 rounded-full p-2 text-muted active:bg-line"
            >
              <Undo2 size={18} />
            </button>
          </li>
        ))}
      </ul>

      {hechos.length > 3 && (
        <button
          type="button"
          onClick={() => setAbierto(!abierto)}
          aria-expanded={abierto}
          className="flex w-full items-center justify-center gap-1 text-xs text-muted"
        >
          {abierto ? (
            <>
              Ver menos <ChevronUp size={14} />
            </>
          ) : (
            <>
              Ver los {hechos.length} <ChevronDown size={14} />
            </>
          )}
        </button>
      )}

      {viejos.length > 0 && (
        <Button
          variant="ghost"
          onClick={() => limpiarPendientes(viejos.map((t) => t.id))}
          className="w-full text-sm"
        >
          Borrar los {viejos.length} de hace más de un mes
        </Button>
      )}
    </Card>
  )
}
