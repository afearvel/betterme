import { Clock } from 'lucide-react'
import { alternarPendiente, deleteTodo } from '../../db/db.js'
import { today } from '../../lib/format.js'
import { agruparPorImportancia, importanciaDe, sugiereSoltar } from '../../lib/todos.js'
import { Card, Empty } from '../../components/ui.jsx'
import { Casilla, Espera, PuntoImportancia } from './piezas.jsx'

/**
 * La bandeja: lo que está esperando hoy, agrupado por la importancia que tú
 * pusiste y, dentro de cada grupo, lo más viejo hasta arriba.
 *
 * No hay flechas para acomodar ni números de prioridad: el orden se calcula
 * solo con esos dos datos, así que la lista no se vuelve otra tarea que
 * mantener.
 */
export default function ListaPendientes({ activos = [], hoy = today(), onEditar, onPosponer }) {
  if (activos.length === 0) {
    return <Empty>Nada esperando. Está bien que la bandeja esté vacía.</Empty>
  }

  const grupos = agruparPorImportancia(activos)

  return (
    <div className="space-y-4">
      {grupos.map((g) => (
        <div key={g.id} className="space-y-2">
          {/* La etiqueta del grupo solo sale si hay más de un nivel en uso:
              con una sola lista, "Normal" no le dice nada a nadie. */}
          {grupos.length > 1 && <p className="px-1 text-xs text-muted">{g.label}</p>}
          {g.items.map((t) => (
            <Fila
              key={t.id}
              todo={t}
              hoy={hoy}
              onEditar={() => onEditar(t)}
              onPosponer={() => onPosponer(t)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function Fila({ todo, hoy, onEditar, onPosponer }) {
  return (
    <Card className="space-y-2 p-3">
      <div className="flex items-center gap-3">
        <Casilla
          hecho={false}
          label={`Marcar ${todo.name} como hecho`}
          onClick={() => alternarPendiente(todo.id)}
        />

        {/* El nombre se parte en varias líneas en vez de cortarse con "…":
            en una lista de tareas, media palabra no sirve de nada. La nota sí
            se corta, porque es un extra y puede ser larga. */}
        <button type="button" onClick={onEditar} className="min-w-0 flex-1 text-left">
          <span className="flex items-start gap-2">
            <span className="pt-2">
              <PuntoImportancia importance={importanciaDe(todo)} />
            </span>
            <span className="font-semibold break-words">{todo.name}</span>
          </span>
          <span className="mt-0.5 flex min-w-0 items-center gap-2">
            <Espera todo={todo} hoy={hoy} />
            {todo.note && <span className="truncate text-xs text-muted">· {todo.note}</span>}
          </span>
        </button>

        <button
          type="button"
          onClick={onPosponer}
          aria-label={`Guardar ${todo.name} para después`}
          className="shrink-0 rounded-full p-2 text-muted active:bg-line"
        >
          <Clock size={20} />
        </button>
      </div>

      {sugiereSoltar(todo, hoy) && <Soltar todo={todo} />}
    </Card>
  )
}

/**
 * El gesto que hace que esta bandeja no acumule culpa: si algo lleva mes y
 * medio ahí, lo más probable es que ya no lo quieras hacer, y eso es una
 * respuesta válida. La app lo dice sin reproche y te da la salida.
 */
function Soltar({ todo }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
      <span className="text-xs text-muted">Lleva rato aquí. ¿Todavía lo quieres?</span>
      <button
        type="button"
        onClick={() => deleteTodo(todo.id)}
        className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-ink2 active:bg-line"
      >
        Ya no
      </button>
    </div>
  )
}
