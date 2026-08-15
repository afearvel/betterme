import { useState } from 'react'
import { Check, Plus, Settings2 } from 'lucide-react'
import { alternarMarca, alternarPaso } from '../../db/db.js'
import { diaCorto, today } from '../../lib/format.js'
import { resumenCiclo, rutinasDe } from '../../lib/habits.js'
import { Button, Card, Empty } from '../../components/ui.jsx'
import { Cumplimiento, Descanso, Palomita, Racha, Tira } from './piezas.jsx'
import EditorCiclo from './EditorCiclo.jsx'

/**
 * Las rutinas rotativas del día. La regla que manda: lo que toca hoy lo decide
 * el calendario, no lo que hiciste ayer. Si te saltaste B, mañana toca C.
 */
export default function Ciclos({ cycles = [], routines = [], mapa, hoy = today() }) {
  const [editando, setEditando] = useState(null) // ciclo, 'nuevo' o null

  return (
    <>
      <div className="space-y-3">
        {cycles.length === 0 && (
          <Empty>Sin ciclos. Un ciclo es una serie de rutinas que se turnan día con día.</Empty>
        )}

        {cycles.map((c) => (
          <TarjetaCiclo
            key={c.id}
            cycle={c}
            routines={rutinasDe(routines, c.id)}
            mapa={mapa}
            hoy={hoy}
            onEditar={() => setEditando(c)}
          />
        ))}

        <Button
          variant="ghost"
          onClick={() => setEditando('nuevo')}
          className="flex w-full items-center justify-center gap-2"
        >
          <Plus size={18} /> Nuevo ciclo
        </Button>
      </div>

      <EditorCiclo
        open={editando !== null}
        cycle={editando === 'nuevo' ? null : editando}
        routines={routines}
        onClose={() => setEditando(null)}
      />
    </>
  )
}

function TarjetaCiclo({ cycle, routines, mapa, hoy, onEditar }) {
  const r = resumenCiclo(cycle, routines, mapa, hoy)
  const rutina = r.rutinaHoy
  const pasos = rutina?.steps ?? []
  const hechos = new Set(r.pasosHoy)

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{cycle.name}</h3>
          <Racha dias={r.racha} mejor={r.mejor} />
        </div>
        <button
          type="button"
          onClick={onEditar}
          aria-label={`Editar ${cycle.name}`}
          className="shrink-0 rounded-full p-2 text-muted active:bg-line"
        >
          <Settings2 size={18} />
        </button>
      </div>

      {routines.length === 0 ? (
        <p className="text-sm text-muted">
          Este ciclo aún no tiene rutinas. Agrégalas y la rotación arranca sola.
        </p>
      ) : !rutina ? (
        <p className="text-sm text-muted">
          {hoy < cycle.startDate
            ? `Empieza el ${cycle.startDate}.`
            : 'Hoy no corre este ciclo. Disfruta el día libre.'}
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-muted">Hoy toca</p>
              <p className="truncate text-lg font-semibold">{rutina.name}</p>
            </div>
            {rutina.rest ? (
              <Descanso />
            ) : (
              <Palomita
                size="lg"
                hecho={r.hechoHoy}
                label={`Marcar ${rutina.name}`}
                onClick={() =>
                  alternarMarca({
                    targetId: rutina.id,
                    kind: 'rutina',
                    date: hoy,
                    steps: pasos.map((p) => p.id),
                  })
                }
              />
            )}
          </div>

          {/* Los pasos son opcionales. Si la rutina no tiene, el botón de arriba
              basta; si tiene, puedes ir palomeando uno por uno. */}
          {!rutina.rest && pasos.length > 0 && (
            <ul className="space-y-1 border-t border-line pt-3">
              {pasos.map((p) => {
                const listo = hechos.has(p.id)
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() =>
                        alternarPaso({
                          routineId: rutina.id,
                          date: hoy,
                          stepId: p.id,
                          totalPasos: pasos.length,
                        })
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left active:bg-line/40"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                          listo ? 'border-good bg-good text-white' : 'border-line text-transparent'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </span>
                      <span className={`truncate text-sm ${listo ? 'text-muted line-through' : ''}`}>
                        {p.name}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <Tira dias={r.tira} />
        <Cumplimiento datos={r.ultimos30} />
      </div>

      {/* Lo que viene. Sirve para saber si mañana entrenas o descansas. */}
      {routines.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
          {r.proximos.slice(1).map((d) => (
            <div
              key={d.date}
              className="shrink-0 rounded-lg bg-line/40 px-2.5 py-1.5 text-center text-[11px]"
            >
              <div className="text-muted">{diaCorto(d.date)}</div>
              <div className="max-w-24 truncate text-ink2">{d.routine?.name ?? 'Libre'}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
