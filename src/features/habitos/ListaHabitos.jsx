import { useState } from 'react'
import { Pause, Plus } from 'lucide-react'
import { alternarMarca } from '../../db/db.js'
import { today } from '../../lib/format.js'
import { resumenHabito, textoFrecuencia, tocaHabito } from '../../lib/habits.js'
import { Button, Card, Empty } from '../../components/ui.jsx'
import { Cumplimiento, Palomita, Racha, Tira } from './piezas.jsx'
import EditorHabito from './EditorHabito.jsx'

/**
 * Hábitos sueltos: los que no pertenecen a ningún ciclo. Se marcan sin horario,
 * de un toque, y el único juicio que emite la app es un puntito de más.
 */
export default function ListaHabitos({ habits = [], mapa, hoy = today() }) {
  const [editando, setEditando] = useState(null) // hábito, 'nuevo' o null

  const activos = habits.filter((h) => h.active !== 0)
  const deHoy = activos.filter((h) => tocaHabito(h, hoy))
  const otroDia = activos.filter((h) => !tocaHabito(h, hoy))
  const pausados = habits.filter((h) => h.active === 0)

  return (
    <>
      <div className="space-y-3">
        {habits.length === 0 && <Empty>Sin hábitos todavía.</Empty>}

        {deHoy.map((h) => (
          <Fila key={h.id} habit={h} mapa={mapa} hoy={hoy} onEditar={() => setEditando(h)} />
        ))}

        {otroDia.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="px-1 text-xs text-muted">Hoy no tocan</p>
            {otroDia.map((h) => (
              <Fila key={h.id} habit={h} mapa={mapa} hoy={hoy} apagado onEditar={() => setEditando(h)} />
            ))}
          </div>
        )}

        {pausados.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="px-1 text-xs text-muted">En pausa</p>
            {pausados.map((h) => (
              <Card key={h.id} className="flex items-center gap-3 p-3 opacity-50">
                <Pause size={16} className="shrink-0 text-muted" />
                <button type="button" onClick={() => setEditando(h)} className="min-w-0 flex-1 truncate text-left text-sm">
                  {h.name}
                </button>
              </Card>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          onClick={() => setEditando('nuevo')}
          className="flex w-full items-center justify-center gap-2"
        >
          <Plus size={18} /> Nuevo hábito
        </Button>
      </div>

      <EditorHabito
        open={editando !== null}
        habit={editando === 'nuevo' ? null : editando}
        onClose={() => setEditando(null)}
      />
    </>
  )
}

function Fila({ habit, mapa, hoy, apagado = false, onEditar }) {
  const r = resumenHabito(habit, mapa, hoy)

  return (
    <Card className={`space-y-2 ${apagado ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onEditar} className="block w-full truncate text-left font-semibold">
            {habit.name}
          </button>
          <p className="text-xs text-muted">{textoFrecuencia(habit)}</p>
        </div>

        {/* Los días que no tocan no se pueden marcar: no queremos inflar rachas
            con días que el propio hábito no pedía. */}
        {apagado ? (
          <span className="shrink-0 text-xs text-muted">—</span>
        ) : (
          <Palomita
            hecho={r.hechoHoy}
            label={`Marcar ${habit.name}`}
            onClick={() => alternarMarca({ targetId: habit.id, kind: 'habito', date: hoy })}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Tira dias={r.tira} />
          <Racha dias={r.racha} mejor={r.mejor} />
        </div>
        <Cumplimiento datos={r.ultimos30} />
      </div>
    </Card>
  )
}
