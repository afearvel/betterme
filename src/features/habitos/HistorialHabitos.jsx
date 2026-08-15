import { useState } from 'react'
import { ChevronLeft, ChevronRight, Moon } from 'lucide-react'
import {
  SEMANA, addMonth, currentMonth, diaSemanaLunes, diasDelMes, fechaLarga, monthLabel, today,
} from '../../lib/format.js'
import { estaHecho, resumenDelDia, rutinaDelDia, rutinasDe, tocaHabito } from '../../lib/habits.js'
import { Card } from '../../components/ui.jsx'

/**
 * Calendario del mes: un cuadrito por día, del color de qué tan completo quedó.
 * Nada de rojos ni de tachas — un día flojo simplemente se ve más apagado.
 */
export default function HistorialHabitos({ habits = [], cycles = [], routines = [], mapa }) {
  const hoy = today()
  const [ym, setYm] = useState(currentMonth())
  const [dia, setDia] = useState(hoy)

  const dias = diasDelMes(ym)
  // Cuántos huecos dejar antes del día 1 para que caiga en su columna.
  const huecos = diaSemanaLunes(dias[0])

  const resumenDe = (iso) => resumenDelDia({ habits, cycles, routines, mapa, iso })

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setYm(addMonth(ym, -1))}
          aria-label="Mes anterior"
          className="rounded-full p-2 text-muted active:bg-line"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold first-letter:uppercase">{monthLabel(ym)}</span>
        <button
          type="button"
          onClick={() => setYm(addMonth(ym, 1))}
          aria-label="Mes siguiente"
          disabled={ym >= currentMonth()}
          className="rounded-full p-2 text-muted active:bg-line disabled:opacity-20"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted">
        {SEMANA.map((d) => (
          <span key={d.n}>{d.corto}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: huecos }, (_, i) => (
          <span key={`hueco-${i}`} />
        ))}

        {dias.map((iso) => {
          const r = resumenDe(iso)
          const futuro = iso > hoy
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setDia(iso)}
              className={`tabular flex aspect-square items-center justify-center rounded-lg text-xs transition-colors ${
                dia === iso ? 'ring-2 ring-brand' : ''
              } ${colorDelDia(r, futuro)}`}
            >
              {Number(iso.slice(8, 10))}
            </button>
          )
        })}
      </div>

      <DetalleDelDia
        iso={dia}
        habits={habits}
        cycles={cycles}
        routines={routines}
        mapa={mapa}
        resumen={resumenDe(dia)}
      />
    </Card>
  )
}

/**
 * Verde = cumpliste todo lo que tocaba. Azul a medias = algo hiciste.
 * Gris = ese día no tocaba nada, no es un reproche.
 */
function colorDelDia(r, futuro) {
  if (futuro) return 'bg-line/20 text-muted/40'
  if (r.total === 0) return 'bg-line/30 text-muted'
  if (r.completo) return 'bg-good font-semibold text-white'
  if (r.hechos > 0) return 'bg-brand/45 text-ink'
  return 'border border-line bg-transparent text-muted'
}

function DetalleDelDia({ iso, habits, cycles, routines, mapa, resumen }) {
  const filas = []

  for (const h of habits) {
    if (!tocaHabito(h, iso)) continue
    filas.push({ id: h.id, nombre: h.name, hecho: estaHecho(mapa, h.id, iso), descanso: false })
  }

  for (const c of cycles) {
    const r = rutinaDelDia(c, rutinasDe(routines, c.id), iso)
    if (!r) continue
    filas.push({
      id: `${c.id}-${iso}`,
      nombre: `${c.name} · ${r.name}`,
      hecho: r.rest || estaHecho(mapa, r.id, iso),
      descanso: Boolean(r.rest),
    })
  }

  return (
    <div className="space-y-2 border-t border-line pt-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-ink2 first-letter:uppercase">{fechaLarga(iso)}</span>
        {resumen.total > 0 && (
          <span className="tabular shrink-0 text-xs text-muted">
            {resumen.hechos} de {resumen.total}
          </span>
        )}
      </div>

      {filas.length === 0 ? (
        <p className="text-xs text-muted">Ese día no tocaba nada.</p>
      ) : (
        <ul className="space-y-1">
          {filas.map((f) => (
            <li key={f.id} className="flex items-center gap-2 text-sm">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${f.hecho ? 'bg-good' : 'border border-line'}`}
              />
              <span className={`min-w-0 flex-1 truncate ${f.hecho ? 'text-ink2' : 'text-muted'}`}>
                {f.nombre}
              </span>
              {f.descanso && <Moon size={13} className="shrink-0 text-muted" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
