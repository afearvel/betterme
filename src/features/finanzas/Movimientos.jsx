import { ChevronRight } from 'lucide-react'
import { money, relativeDay } from '../../lib/format.js'
import { Card, Empty } from '../../components/ui.jsx'

/** Lista de movimientos. Tocar uno lo abre para editarlo. */
export default function Movimientos({ transactions = [], envelopes = [], limite = null, onSelect }) {
  const nombre = Object.fromEntries(envelopes.map((e) => [e.id, e.name]))
  const ordenados = [...transactions].sort((a, b) =>
    (b.createdAt ?? b.date).localeCompare(a.createdAt ?? a.date),
  )
  const lista = limite ? ordenados.slice(0, limite) : ordenados

  if (lista.length === 0) return <Empty>Aún no hay movimientos.</Empty>

  return (
    <Card className="divide-y divide-line p-0">
      {lista.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect?.(t)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-line/40"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">
              {t.note || nombre[t.envelopeId] || (t.type === 'ingreso' ? 'Ingreso' : 'Gasto')}
            </p>
            <p className="text-xs text-muted">
              {relativeDay(t.date)}
              {t.envelopeId && nombre[t.envelopeId] ? ` · ${nombre[t.envelopeId]}` : ''}
            </p>
          </div>
          <span className={`tabular font-semibold ${t.type === 'ingreso' ? 'text-good' : 'text-ink'}`}>
            {t.type === 'ingreso' ? '+' : '−'}
            {money(t.amount)}
          </span>
          <ChevronRight size={16} className="shrink-0 text-muted" />
        </button>
      ))}
    </Card>
  )
}
