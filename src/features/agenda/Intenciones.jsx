import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { MAX_INTENCIONES, hayEspacio, textoIntenciones } from '../../lib/agenda.js'
import { addIntention, alternarIntencion, deleteIntention } from '../../db/db.js'
import { Card } from '../../components/ui.jsx'

/**
 * Las intenciones del día: hasta tres, sin hora.
 *
 * Responden "¿qué haría que hoy valiera la pena?", no "¿a qué hora?". Por eso
 * viven arriba de la línea de tiempo y no dentro de ella: si el día se
 * desordena y todos los horarios se caen, esto sigue en pie.
 *
 * El tope de tres no es decoración. Una lista de veinte intenciones ya no es
 * una intención: es una lista de deseos. Cuando se llenan las tres, la caja de
 * escribir simplemente desaparece, sin regañar ni explicar de más.
 */
export default function Intenciones({ intenciones, fecha, esDeHoy = true, soloLectura = false }) {
  const [texto, setTexto] = useState('')

  const agregar = async () => {
    const limpio = texto.trim()
    if (!limpio) return
    await addIntention({ date: fecha, text: limpio })
    setTexto('')
  }

  if (soloLectura && intenciones.length === 0) return null

  return (
    <Card className="space-y-3">
      <p className="text-sm text-muted">{textoIntenciones(intenciones, esDeHoy)}</p>

      {intenciones.length > 0 && (
        <ul className="space-y-2">
          {intenciones.map((i) => (
            <li key={i.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => alternarIntencion(i.id)}
                aria-pressed={i.done === 1}
                aria-label={i.done === 1 ? `Desmarcar ${i.text}` : `Marcar ${i.text}`}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  i.done === 1
                    ? 'border-good bg-good/20 text-good'
                    : 'border-line bg-plane text-muted active:bg-line'
                }`}
              >
                <Check size={16} strokeWidth={i.done === 1 ? 3 : 2} />
              </button>

              <span
                className={`min-w-0 flex-1 break-words text-[15px] ${
                  i.done === 1 ? 'text-muted line-through' : 'text-ink'
                }`}
              >
                {i.text}
              </span>

              {!soloLectura && (
                <button
                  type="button"
                  onClick={() => deleteIntention(i.id)}
                  aria-label={`Quitar ${i.text}`}
                  className="shrink-0 rounded-full p-2 text-muted active:bg-line"
                >
                  <X size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!soloLectura && hayEspacio(intenciones) && (
        <div className="flex gap-2">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregar()}
            placeholder={
              intenciones.length === 0
                ? 'Escribe una…'
                : `Otra más (van ${intenciones.length} de ${MAX_INTENCIONES})`
            }
            className="min-w-0 flex-1 rounded-xl border border-line bg-plane px-3 py-2.5 text-ink outline-none focus:border-brand"
          />
          <button
            type="button"
            onClick={agregar}
            disabled={!texto.trim()}
            aria-label="Agregar intención"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-colors disabled:opacity-40"
          >
            <Plus size={20} />
          </button>
        </div>
      )}
    </Card>
  )
}
