import { Sparkles } from 'lucide-react'
import { fechaLarga } from '../../lib/format.js'
import { Bar, Card } from '../../components/ui.jsx'

/** La foto del día: cuánto llevas y cuántos días seguidos lo has cerrado todo. */
export default function HoyResumen({ iso, resumen, rachaCompletos = 0 }) {
  const { total, hechos, pct, completo } = resumen

  return (
    <Card className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          {/* first-letter:uppercase y no `capitalize`: `capitalize` pondría
              mayúscula en CADA palabra ("Sábado 15 De Agosto"). */}
          <p className="truncate text-sm text-muted first-letter:uppercase">{fechaLarga(iso)}</p>
          <p className="tabular text-3xl font-semibold">
            {hechos}
            <span className="text-xl text-muted"> / {total}</span>
          </p>
        </div>
        {rachaCompletos > 0 && (
          <span className="tabular shrink-0 text-right text-xs text-warn">
            <Sparkles size={14} className="mb-0.5 inline" />{' '}
            <span className="font-semibold">{rachaCompletos}</span>
            <span className="block text-muted">
              {rachaCompletos === 1 ? 'día completo' : 'días completos'}
            </span>
          </span>
        )}
      </div>

      <Bar value={pct} tone={completo ? 'good' : 'brand'} />

      <p className="text-xs text-muted">
        {total === 0
          ? 'Hoy no tienes nada programado.'
          : completo
            ? 'Cerraste el día. Nada más que hacer.'
            : `Faltan ${total - hechos} por marcar. Sin prisa: no hay horarios.`}
      </p>
    </Card>
  )
}
