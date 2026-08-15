import { Link } from 'react-router-dom'
import { ChevronRight, TriangleAlert } from 'lucide-react'
import { money } from '../../lib/format.js'
import { repartoDelTotal } from '../../lib/patrimonio.js'
import { Card } from '../../components/ui.jsx'
import BarraReparto from './BarraReparto.jsx'

/**
 * La tarjeta de arriba de todo en Dinero: cuánto tienes, cuánto ya tiene dueño
 * y cuánto sigue libre. Es lo primero que se ve al abrir la app porque es la
 * pregunta que se hace uno al abrirla.
 *
 * Tres números y una barra. El detalle completo vive en /patrimonio: aquí solo
 * va lo que se responde de un vistazo.
 */
export default function Patrimonio({ p, goals = [] }) {
  const partes = repartoDelTotal({ goals, total: p.total, apartado: p.apartado, libre: p.libre })

  return (
    <Card className="space-y-4">
      <Link to="/patrimonio" className="block active:opacity-70">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-ink2">Tu dinero</p>
            <p className={`tabular text-5xl font-semibold ${p.enRojo ? 'text-crit' : 'text-ink'}`}>
              {money(p.total)}
            </p>
          </div>
          <ChevronRight size={20} className="mt-6 shrink-0 text-muted" />
        </div>
      </Link>

      {p.sinDatos ? (
        <p className="text-sm text-muted">
          Todavía no le dices a la app cuánto tienes.{' '}
          <Link to="/ajustes" className="font-semibold text-brand">
            Poner mi saldo inicial →
          </Link>
        </p>
      ) : (
        <>
          <BarraReparto partes={partes} />

          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">Libre</p>
              <p
                className={`tabular text-lg font-semibold ${
                  p.sobreapartado ? 'text-crit' : 'text-ink'
                }`}
              >
                {money(p.libre)}
              </p>
            </div>
            <div className="min-w-0 flex-1 border-l border-line pl-3">
              <p className="text-xs text-muted">Apartado en metas</p>
              <p className="tabular text-lg font-semibold text-ink2">{money(p.apartado)}</p>
            </div>
          </div>

          {p.sobreapartado && (
            <p className="flex items-start gap-2 rounded-xl bg-crit/10 p-3 text-xs text-crit">
              <TriangleAlert size={16} className="mt-px shrink-0" />
              <span>
                Tienes {money(p.apartado)} apartado en metas pero solo {money(p.total)} en total.
                Retira {money(-p.libre)} de alguna meta para que cuadre.
              </span>
            </p>
          )}
        </>
      )}
    </Card>
  )
}
