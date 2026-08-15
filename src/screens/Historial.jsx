import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db.js'
import { addMonth, currentMonth, money, monthLabel, monthOf } from '../lib/format.js'
import { totalesDelMes } from '../lib/finance.js'
import { Card } from '../components/ui.jsx'
import Movimientos from '../features/finanzas/Movimientos.jsx'
import EditarMovimiento from '../features/finanzas/EditarMovimiento.jsx'

/** Historial completo, mes por mes. */
export default function Historial() {
  const [ym, setYm] = useState(currentMonth())
  const [editando, setEditando] = useState(null)

  const envelopes = useLiveQuery(() => db.envelopes.orderBy('order').toArray(), [], [])
  const todos = useLiveQuery(() => db.transactions.toArray(), [], [])

  const delMes = todos.filter((t) => monthOf(t.date) === ym)
  const { ingresos, egresos } = totalesDelMes(todos, ym)
  const balance = ingresos - egresos
  const esMesActual = ym === currentMonth()

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setYm(addMonth(ym, -1))}
            className="rounded-lg p-2 text-ink2 active:bg-line"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="font-semibold capitalize">{monthLabel(ym)}</span>

          <button
            type="button"
            onClick={() => setYm(addMonth(ym, 1))}
            disabled={esMesActual}
            className="rounded-lg p-2 text-ink2 active:bg-line disabled:opacity-25"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
          <Dato etiqueta="Ingresos" valor={money(ingresos)} tono="text-good" />
          <Dato etiqueta="Egresos" valor={money(egresos)} />
          <Dato etiqueta="Balance" valor={money(balance)} tono={balance < 0 ? 'text-crit' : 'text-good'} />
        </div>
      </Card>

      <p className="px-1 text-xs text-muted">
        {delMes.length} movimiento{delMes.length === 1 ? '' : 's'} · toca uno para editarlo
      </p>

      <Movimientos transactions={delMes} envelopes={envelopes} onSelect={setEditando} />

      <Link to="/finanzas" className="block py-2 text-center text-sm text-brand">
        ← Volver a Dinero
      </Link>

      <EditarMovimiento tx={editando} envelopes={envelopes} onClose={() => setEditando(null)} />
    </div>
  )
}

function Dato({ etiqueta, valor, tono = 'text-ink' }) {
  return (
    <div>
      <p className="text-xs text-muted">{etiqueta}</p>
      <p className={`tabular font-semibold ${tono}`}>{valor}</p>
    </div>
  )
}
