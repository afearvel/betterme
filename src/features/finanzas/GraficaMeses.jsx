import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { money, moneyShort, monthLabel } from '../../lib/format.js'
import { Card } from '../../components/ui.jsx'

// Dos series, dos colores fijos. El color sigue a la serie, nunca al orden.
const INGRESOS = '#3987e5'
const EGRESOS = '#d95926'
const EJE = '#898781'
const REJILLA = '#2c2c2a'

function TooltipMes({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-semibold text-ink">{monthLabel(label)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-ink2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
          <span className="capitalize">{p.dataKey}</span>
          <span className="tabular ml-auto font-semibold text-ink">{money(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export default function GraficaMeses({ data = [] }) {
  const [tabla, setTabla] = useState(false)
  const hayDatos = data.some((d) => d.ingresos > 0 || d.egresos > 0)

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink2">Ingresos vs. egresos</h3>
        <button type="button" onClick={() => setTabla(!tabla)} className="text-xs text-muted underline">
          {tabla ? 'ver gráfica' : 'ver tabla'}
        </button>
      </div>

      {!hayDatos ? (
        <p className="py-6 text-center text-sm text-muted">Registra algunos movimientos y aquí verás la comparación.</p>
      ) : tabla ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="pb-1 font-medium">Mes</th>
              <th className="pb-1 text-right font-medium">Ingresos</th>
              <th className="pb-1 text-right font-medium">Egresos</th>
              <th className="pb-1 text-right font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {data.map((d) => (
              <tr key={d.ym} className="border-t border-line">
                <td className="py-1.5">{monthLabel(d.ym)}</td>
                <td className="py-1.5 text-right">{money(d.ingresos)}</td>
                <td className="py-1.5 text-right">{money(d.egresos)}</td>
                <td className={`py-1.5 text-right font-semibold ${d.balance < 0 ? 'text-crit' : 'text-good'}`}>
                  {money(d.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barGap={2}>
              <CartesianGrid stroke={REJILLA} vertical={false} />
              <XAxis
                dataKey="ym"
                tickFormatter={monthLabel}
                tick={{ fill: EJE, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: REJILLA }}
              />
              <YAxis
                tickFormatter={moneyShort}
                tick={{ fill: EJE, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={54}
              />
              <Tooltip content={<TooltipMes />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Legend
                iconType="circle"
                iconSize={8}
                payload={[
                  { value: 'Ingresos', type: 'circle', id: 'ingresos', color: INGRESOS },
                  { value: 'Egresos', type: 'circle', id: 'egresos', color: EGRESOS },
                ]}
                wrapperStyle={{ fontSize: 12, color: EJE, paddingTop: 4 }}
              />
              <Bar dataKey="ingresos" name="Ingresos" fill={INGRESOS} radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="egresos" name="Egresos" fill={EGRESOS} radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
