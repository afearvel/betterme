import { Link } from 'react-router-dom'
import { Bar, Card } from '../../components/ui.jsx'
import { money } from '../../lib/format.js'

/**
 * El número que de verdad importa: cuánto puedo gastar hoy.
 * Un solo dato grande (hero number), no una gráfica — es una sola cifra.
 */
export default function GastoLibre({ r }) {
  if (!r.configurado) {
    return (
      <Card className="space-y-2 text-center text-sm text-muted">
        <p>Falta decirle a la app cuánto ganas al mes para calcular tu gasto libre diario.</p>
        <Link to="/ajustes" className="inline-block font-semibold text-brand">
          Configurar ingreso →
        </Link>
      </Card>
    )
  }

  const sobregiro = r.restanteHoy < 0
  const usado = r.diario > 0 ? r.gastadoHoy / r.diario : 0

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm text-ink2">Te queda hoy</p>
        <p
          className={`tabular text-5xl font-semibold ${sobregiro ? 'text-crit' : 'text-ink'}`}
        >
          {money(r.restanteHoy)}
        </p>
        <p className="mt-1 text-sm text-muted">
          de {money(r.diario)} al día · llevas {money(r.gastadoHoy)}
        </p>
      </div>

      <Bar value={usado} tone={sobregiro ? 'crit' : usado > 0.8 ? 'warn' : 'brand'} />

      <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
        <span className="text-muted">Colchón del mes</span>
        <span className={`tabular font-semibold ${r.colchon < 0 ? 'text-crit' : 'text-good'}`}>
          {r.colchon >= 0 ? '+' : ''}
          {money(r.colchon)}
        </span>
      </div>
      <p className="-mt-2 text-xs text-muted">
        {r.colchon >= 0
          ? 'Vas por debajo de tu ritmo planeado. Ese margen es tuyo.'
          : 'Vas por arriba de tu ritmo. No pasa nada: se compensa los próximos días.'}
      </p>
    </Card>
  )
}
