import { useEffect, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, diaSemana, fechaLarga, SEMANA } from '../../lib/format.js'
import { diasConAlgo, esHoy, rangoDias } from '../../lib/agenda.js'

/**
 * La tira de días de arriba. Se mueve con el pulgar de lado, y el día elegido
 * se centra solo cuando cambias de día con las flechas.
 *
 * La ventana normal va de una semana atrás a un mes adelante. Si te vas más
 * lejos con las flechas, la ventana se muda alrededor de donde estás para que
 * nunca te quedes sin días a los que saltar.
 */
export default function SelectorDia({ fecha, hoy, onCambiar, blocks, overrides }) {
  const tira = useRef(null)

  const dias = useMemo(() => {
    const normal = rangoDias(hoy, 7, 30)
    return normal.includes(fecha) ? normal : rangoDias(fecha, 5, 10)
  }, [fecha, hoy])

  const conAlgo = useMemo(
    () => diasConAlgo(blocks, overrides, dias),
    [blocks, overrides, dias],
  )

  // Centrar el día elegido. `block: 'nearest'` evita que la página entera
  // brinque hacia arriba: solo se mueve la tira de lado.
  useEffect(() => {
    const nodo = tira.current?.querySelector(`[data-fecha="${fecha}"]`)
    nodo?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [fecha])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onCambiar(addDays(fecha, -1))}
          className="rounded-full p-2 text-muted active:bg-line"
          aria-label="Día anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-semibold first-letter:uppercase">{fechaLarga(fecha)}</p>
          {!esHoy(fecha, hoy) && (
            <button
              type="button"
              onClick={() => onCambiar(hoy)}
              className="text-xs text-brand"
            >
              Volver a hoy
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onCambiar(addDays(fecha, 1))}
          className="rounded-full p-2 text-muted active:bg-line"
          aria-label="Día siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div
        ref={tira}
        className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {dias.map((d) => {
          const elegido = d === fecha
          const esElHoy = esHoy(d, hoy)
          const letra = SEMANA.find((s) => s.n === diaSemana(d))?.corto ?? ''
          return (
            <button
              key={d}
              type="button"
              data-fecha={d}
              onClick={() => onCambiar(d)}
              aria-current={elegido ? 'date' : undefined}
              className={`flex w-11 shrink-0 flex-col items-center gap-0.5 rounded-xl border py-2 transition-colors ${
                elegido
                  ? 'border-brand bg-brand/15'
                  : 'border-line bg-surface active:bg-line'
              }`}
            >
              <span className={`text-[10px] ${esElHoy ? 'text-brand' : 'text-muted'}`}>{letra}</span>
              <span
                className={`tabular text-base leading-none ${
                  elegido ? 'font-bold text-ink' : esElHoy ? 'font-semibold text-brand' : 'text-ink2'
                }`}
              >
                {Number(d.slice(8, 10))}
              </span>
              <span
                className={`h-1 w-1 rounded-full ${
                  conAlgo.has(d) ? (elegido ? 'bg-brand' : 'bg-muted') : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
