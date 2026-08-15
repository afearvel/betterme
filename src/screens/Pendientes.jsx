import { useMemo, useState } from 'react'
import { Inbox } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { crearEjemploPendientes, db } from '../db/db.js'
import { today } from '../lib/format.js'
import { resumenPendientes, separarPendientes } from '../lib/todos.js'
import { Button, Card, Section } from '../components/ui.jsx'
import CapturaRapida from '../features/pendientes/CapturaRapida.jsx'
import ListaPendientes from '../features/pendientes/ListaPendientes.jsx'
import Pospuestos from '../features/pendientes/Pospuestos.jsx'
import Hechos from '../features/pendientes/Hechos.jsx'
import EditorPendiente from '../features/pendientes/EditorPendiente.jsx'
import HojaPosponer from '../features/pendientes/HojaPosponer.jsx'

/**
 * Bandeja de pendientes: tareas de una sola vez, sin fechas límite.
 *
 * Dónde va cada cosa, para no dudar después:
 *   · Se repite con un ritmo (diario, ciertos días, cada N)  → Hábitos
 *   · Tiene día y hora                                        → Agenda
 *   · Se hace una vez y se va                                 → aquí
 */
export default function Pendientes() {
  const hoy = today()

  // useLiveQuery vuelve a pintar solo cuando cambia la base. Nada que refrescar.
  const todos = useLiveQuery(() => db.todos.toArray(), [], [])

  const [editando, setEditando] = useState(null) // pendiente, 'nuevo' o null
  const [posponiendo, setPosponiendo] = useState(null)

  // Separar y ordenar cuesta un poco; con useMemo solo se rehace cuando de
  // verdad cambió la lista, no en cada pintada de la pantalla.
  const { activos, pospuestos, hechos } = useMemo(
    () => separarPendientes(todos, hoy),
    [todos, hoy],
  )
  const resumen = useMemo(() => resumenPendientes(todos, hoy), [todos, hoy])

  if (todos.length === 0) {
    return (
      <div className="space-y-4">
        <CapturaRapida onDetalle={() => setEditando('nuevo')} />

        <Card className="space-y-3 text-center">
          <Inbox className="mx-auto text-muted" size={28} />
          <h2 className="font-semibold">Bandeja de pendientes</h2>
          <p className="text-sm text-muted">
            Cosas de <b className="text-ink2">una sola vez</b>: se hacen y se van. Lo que se repite
            con un ritmo es un <b className="text-ink2">hábito</b>, y lo que tiene día y hora va en
            la <b className="text-ink2">agenda</b>.
          </p>
          <p className="text-sm text-muted">
            Aquí no hay fechas límite. Cada pendiente solo dice cuánto lleva esperando, y a partir
            de mes y medio la app te ofrece soltarlo en vez de insistir.
          </p>
          <Button variant="ghost" onClick={crearEjemploPendientes} className="w-full">
            Crear un ejemplo para ver cómo funciona
          </Button>
          <p className="text-xs text-muted">Puedes borrarlo después sin dejar rastro.</p>
        </Card>

        <EditorPendiente
          open={editando !== null}
          todo={null}
          hoy={hoy}
          onClose={() => setEditando(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Resumen resumen={resumen} />

      <CapturaRapida onDetalle={() => setEditando('nuevo')} />

      <Section title="Esperando">
        <ListaPendientes
          activos={activos}
          hoy={hoy}
          onEditar={setEditando}
          onPosponer={setPosponiendo}
        />
      </Section>

      <Pospuestos pospuestos={pospuestos} hoy={hoy} />

      {hechos.length > 0 && (
        <Section title="Ya está">
          <Hechos hechos={hechos} hoy={hoy} />
        </Section>
      )}

      <EditorPendiente
        open={editando !== null}
        todo={editando === 'nuevo' ? null : editando}
        hoy={hoy}
        onClose={() => setEditando(null)}
      />

      <HojaPosponer
        open={posponiendo !== null}
        todo={posponiendo}
        hoy={hoy}
        onClose={() => setPosponiendo(null)}
      />
    </div>
  )
}

/**
 * La tarjeta de arriba. Fíjate en qué se dice en grande: lo que cerraste. Lo
 * que falta va en gris y sin adjetivos, porque tener cosas esperando es el
 * estado normal de una bandeja, no un problema.
 */
function Resumen({ resumen }) {
  return (
    <Card className="flex items-end justify-between gap-4">
      <div>
        <p className="text-sm text-muted">Esta semana cerraste</p>
        <p className="tabular text-3xl font-bold">{resumen.cerradosSemana}</p>
      </div>
      <p className="pb-1 text-right text-xs text-muted">
        {resumen.activos} esperando
        {resumen.pospuestos > 0 && (
          <>
            <br />
            {resumen.pospuestos} para después
          </>
        )}
      </p>
    </Card>
  )
}
