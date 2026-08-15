import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { TriangleAlert } from 'lucide-react'
import { db, getSettings } from '../db/db.js'
import { money } from '../lib/format.js'
import { patrimonio, repartoDelTotal } from '../lib/patrimonio.js'
import { Card, Empty, Section } from '../components/ui.jsx'
import BarraReparto, { Punto, tonoDeMeta } from '../features/finanzas/BarraReparto.jsx'

/**
 * La pantalla del patrimonio: de dónde sale el total y en qué está repartido.
 *
 * Todo se lee con useLiveQuery, así que cualquier cambio en cualquier pantalla
 * —registrar un gasto, abonar a una meta, corregir el saldo inicial— se refleja
 * aquí al instante. No hay que refrescar nada ni volver a entrar.
 */
export default function Patrimonio() {
  const settings = useLiveQuery(() => getSettings(), [], null)
  const transactions = useLiveQuery(() => db.transactions.toArray(), [], [])
  const goals = useLiveQuery(() => db.goals.orderBy('order').toArray(), [], [])

  const p = patrimonio({ settings, transactions, goals })
  const partes = repartoDelTotal({ goals, total: p.total, apartado: p.apartado, libre: p.libre })
  const conDinero = goals.filter((g) => (g.saved ?? 0) > 0)

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div>
          <p className="text-sm text-ink2">Tu dinero, todo junto</p>
          <p className={`tabular text-5xl font-semibold ${p.enRojo ? 'text-crit' : 'text-ink'}`}>
            {money(p.total)}
          </p>
        </div>

        <BarraReparto partes={partes} alto="h-4" />

        <div className="space-y-2 text-sm">
          {conDinero.map((g, i) => (
            <Renglon
              key={g.id}
              punto={tonoDeMeta(i)}
              nombre={g.name}
              monto={g.saved}
              pct={p.total > 0 ? g.saved / p.total : 0}
            />
          ))}
          {conDinero.length === 0 && (
            <p className="text-sm text-muted">
              Todavía no apartas nada. Todo tu dinero está libre.
            </p>
          )}
          <Renglon
            punto="bg-libre"
            nombre="Libre"
            monto={p.libre}
            pct={p.total > 0 ? p.libre / p.total : 0}
            fuerte
            rojo={p.sobreapartado}
          />
        </div>

        {p.sobreapartado && (
          <p className="flex items-start gap-2 rounded-xl bg-crit/10 p-3 text-xs text-crit">
            <TriangleAlert size={16} className="mt-px shrink-0" />
            <span>
              Estás repartiendo {money(-p.libre)} que ya no tienes. Pasa cuando borras un ingreso,
              bajas el saldo inicial o decides registrar un gasto de todos modos. Retira ese tanto
              de alguna meta y vuelve a cuadrar.
            </span>
          </p>
        )}
      </Card>

      <Section title="De dónde sale ese total">
        <Card className="space-y-1 text-sm text-ink2">
          <Linea
            etiqueta="Saldo inicial"
            valor={money(p.inicial)}
            extra={
              <Link to="/ajustes" className="text-xs text-brand">
                ajustar
              </Link>
            }
          />
          <Linea etiqueta="+ Todo lo que has ingresado" valor={money(p.ingresos)} />
          <Linea etiqueta="− Todo lo que has gastado" valor={money(p.gastos)} />
          <div className="border-t border-line pt-2">
            <Linea etiqueta="= Tu dinero" valor={money(p.total)} fuerte />
          </div>
          <p className="pt-2 text-xs text-muted">
            Son todos los movimientos desde que empezaste, no los de este mes. El saldo inicial es
            lo que ya tenías el día uno: sin él, el total arrancaría en cero.
          </p>
        </Card>
      </Section>

      <Section title="Cómo funciona apartar">
        <Card className="space-y-2 text-xs text-muted">
          <p>
            Apartar dinero en una meta <strong className="text-ink2">no lo gasta</strong>: solo le
            pone una etiqueta. Por eso abonar nunca cambia tu total, cambia el reparto.
          </p>
          <p>
            Como no puedes repartir dinero que no existe, la app no te deja apartar más de lo que
            tengas libre. Cuando de verdad gastes el dinero de una meta, usa el botón{' '}
            <strong className="text-ink2">Usar meta</strong>: registra el gasto y vacía lo apartado
            en un solo paso.
          </p>
        </Card>
      </Section>

      {goals.length === 0 && (
        <Empty>
          Cuando abras metas de ahorro, aquí vas a ver en qué está repartido tu dinero.
        </Empty>
      )}
    </div>
  )
}

function Renglon({ punto, nombre, monto, pct, fuerte, rojo }) {
  return (
    <div className="flex items-center gap-2">
      <Punto className={punto} />
      <span className={`min-w-0 flex-1 truncate ${fuerte ? 'font-semibold text-ink' : ''}`}>
        {nombre}
      </span>
      <span className="tabular shrink-0 text-xs text-muted">{Math.round(pct * 100)}%</span>
      <span
        className={`tabular w-24 shrink-0 text-right ${
          rojo ? 'font-semibold text-crit' : fuerte ? 'font-semibold text-ink' : ''
        }`}
      >
        {money(monto)}
      </span>
    </div>
  )
}

function Linea({ etiqueta, valor, extra, fuerte }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={fuerte ? 'font-semibold text-ink' : ''}>
        {etiqueta} {extra}
      </span>
      <span className={`tabular ${fuerte ? 'font-semibold text-ink' : ''}`}>{valor}</span>
    </div>
  )
}
