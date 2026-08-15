import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getSettings } from '../db/db.js'
import { currentMonth, lastMonths, monthLabel } from '../lib/format.js'
import { gastoPorSobre, resumenDiario, serieMensual } from '../lib/finance.js'
import { Section } from '../components/ui.jsx'
import RegistroRapido from '../features/finanzas/RegistroRapido.jsx'
import GastoLibre from '../features/finanzas/GastoLibre.jsx'
import Sobres from '../features/finanzas/Sobres.jsx'
import Metas from '../features/finanzas/Metas.jsx'
import GraficaMeses from '../features/finanzas/GraficaMeses.jsx'
import Movimientos from '../features/finanzas/Movimientos.jsx'
import EditarMovimiento from '../features/finanzas/EditarMovimiento.jsx'

export default function Finanzas() {
  const [editando, setEditando] = useState(null)

  // useLiveQuery vuelve a pintar solo cuando cambia la base de datos.
  // No hay que refrescar nada a mano.
  const envelopes = useLiveQuery(() => db.envelopes.orderBy('order').toArray(), [], [])
  const transactions = useLiveQuery(() => db.transactions.toArray(), [], [])
  const goals = useLiveQuery(() => db.goals.orderBy('order').toArray(), [], [])
  const settings = useLiveQuery(() => getSettings(), [], null)

  const resumen = resumenDiario({ settings, envelopes, transactions })
  const gastos = gastoPorSobre(transactions, currentMonth())
  const serie = serieMensual(transactions, lastMonths(6))

  return (
    <div className="space-y-6">
      <RegistroRapido envelopes={envelopes} />

      <Section title={`Hoy · ${monthLabel(currentMonth())}`}>
        <GastoLibre r={resumen} />
      </Section>

      <Section title="Sobres">
        <Sobres envelopes={envelopes} gastos={gastos} />
      </Section>

      <Section title="Metas de ahorro">
        <Metas goals={goals} />
      </Section>

      <Section title="Últimos 6 meses">
        <GraficaMeses data={serie} />
      </Section>

      <Section
        title="Movimientos"
        action={
          <Link to="/historial" className="text-xs text-brand">
            Ver todo →
          </Link>
        }
      >
        <Movimientos
          transactions={transactions}
          envelopes={envelopes}
          limite={8}
          onSelect={setEditando}
        />
      </Section>

      <EditarMovimiento tx={editando} envelopes={envelopes} onClose={() => setEditando(null)} />
    </div>
  )
}
