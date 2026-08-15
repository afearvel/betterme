import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getSettings } from '../db/db.js'
import { currentMonth, lastMonths, monthLabel } from '../lib/format.js'
import { gastoPorSobre, resumenDiario, serieMensual } from '../lib/finance.js'
import { patrimonio } from '../lib/patrimonio.js'
import { Section } from '../components/ui.jsx'
import Patrimonio from '../features/finanzas/Patrimonio.jsx'
import RegistroRapido from '../features/finanzas/RegistroRapido.jsx'
import GastoLibre from '../features/finanzas/GastoLibre.jsx'
import Sobres from '../features/finanzas/Sobres.jsx'
import Metas from '../features/finanzas/Metas.jsx'
import GraficaMeses from '../features/finanzas/GraficaMeses.jsx'
import Movimientos from '../features/finanzas/Movimientos.jsx'
import EditarMovimiento from '../features/finanzas/EditarMovimiento.jsx'

/**
 * La pantalla de Dinero, de arriba hacia abajo, en el orden en que uno se
 * hace las preguntas al abrir la app:
 *
 *   1. ¿Cuánto tengo?              → Patrimonio (total, apartado, libre)
 *   2. Apuntar algo                → Registro rápido
 *   3. ¿Cuánto puedo gastar hoy?   → Hoy
 *   4. ¿Para qué estoy ahorrando?  → Metas
 *   5. El plan del mes             → Sobres
 *   6. ¿Cómo voy en el tiempo?     → Gráfica e historial
 *
 * Antes lo primero era el registro rápido. Ahora manda el patrimonio: el
 * módulo dejó de ser "apuntar gastos" y pasó a ser "saber cuánto tengo".
 */
export default function Finanzas() {
  const [editando, setEditando] = useState(null)

  // useLiveQuery vuelve a pintar solo cuando cambia la base de datos.
  // Registra un gasto y el total de arriba baja en ese mismo instante, sin
  // refrescar nada: es la misma consulta viva alimentando toda la pantalla.
  const envelopes = useLiveQuery(() => db.envelopes.orderBy('order').toArray(), [], [])
  const transactions = useLiveQuery(() => db.transactions.toArray(), [], [])
  const goals = useLiveQuery(() => db.goals.orderBy('order').toArray(), [], [])
  const settings = useLiveQuery(() => getSettings(), [], null)

  const p = patrimonio({ settings, transactions, goals })
  const resumen = resumenDiario({ settings, envelopes, transactions })
  const gastos = gastoPorSobre(transactions, currentMonth())
  const serie = serieMensual(transactions, lastMonths(6))

  return (
    <div className="space-y-6">
      <Patrimonio p={p} goals={goals} />

      <RegistroRapido envelopes={envelopes} libre={p.libre} total={p.total} goals={goals} />

      <Section title={`Hoy · ${monthLabel(currentMonth())}`}>
        <GastoLibre r={resumen} />
      </Section>

      <Section
        title="Metas de ahorro"
        action={
          <Link to="/patrimonio" className="text-xs text-brand">
            Ver reparto →
          </Link>
        }
      >
        <Metas goals={goals} libre={p.libre} envelopes={envelopes} />
      </Section>

      <Section title="Sobres del mes">
        <Sobres envelopes={envelopes} gastos={gastos} />
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
