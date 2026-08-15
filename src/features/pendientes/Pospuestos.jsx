import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { despertarPendiente } from '../../db/db.js'
import { today } from '../../lib/format.js'
import { textoRegreso } from '../../lib/todos.js'
import { Card } from '../../components/ui.jsx'

/**
 * Los guardados para después. Van plegados para no estorbar, pero el número
 * siempre se ve: nada desaparece a tus espaldas en esta app.
 */
export default function Pospuestos({ pospuestos = [], hoy = today() }) {
  const [abierto, setAbierto] = useState(false)

  if (pospuestos.length === 0) return null

  return (
    <Card className="space-y-3 p-3">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="text-sm text-ink2">
          {pospuestos.length} guardado{pospuestos.length === 1 ? '' : 's'} para después
        </span>
        {abierto ? (
          <ChevronUp size={18} className="text-muted" />
        ) : (
          <ChevronDown size={18} className="text-muted" />
        )}
      </button>

      {abierto && (
        <ul className="space-y-2 border-t border-line pt-3">
          {pospuestos.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{t.name}</p>
                <p className="text-xs text-muted">{textoRegreso(t, hoy)}</p>
              </div>
              <button
                type="button"
                onClick={() => despertarPendiente(t.id)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-ink2 active:bg-line"
              >
                Traer
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
