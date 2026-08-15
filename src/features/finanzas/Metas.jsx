import { useState } from 'react'
import { Plus } from 'lucide-react'
import { addGoal } from '../../db/db.js'
import { money } from '../../lib/format.js'
import { hitosDeMeta, planDeMeta } from '../../lib/finance.js'
import { revisarApartado } from '../../lib/patrimonio.js'
import { Bar, Button, Card, Empty, Field, Input, Sheet } from '../../components/ui.jsx'
import { Punto, tonoDeMeta } from './BarraReparto.jsx'
import HojaMeta from './HojaMeta.jsx'

const vacio = { name: '', target: '', apartar: '', deadline: '' }

/**
 * Metas de ahorro. Cada meta es un pedazo de tu dinero con etiqueta.
 *
 * Lo apartado NO se escribe a mano: se mueve con Abonar y Retirar, que son los
 * únicos caminos que respetan el tope del dinero libre. Ese era el hoyo por
 * donde se colaba el poder apartar dinero que no existe.
 */
export default function Metas({ goals = [], libre = 0, envelopes = [] }) {
  const [nueva, setNueva] = useState(false)
  const [form, setForm] = useState(vacio)
  const [error, setError] = useState('')
  const [abierta, setAbierta] = useState(null)

  const revision = revisarApartado({ libre, monto: form.apartar })

  async function crear() {
    if (form.apartar && !revision.ok) {
      setError(`Solo tienes ${money(libre)} libre. Te faltan ${money(revision.faltante)}.`)
      return
    }
    await addGoal({
      name: form.name.trim() || 'Meta',
      target: Number(form.target) || 0,
      deadline: form.deadline || null,
      apartarAhora: Number(form.apartar) || 0,
    })
    setForm(vacio)
    setError('')
    setNueva(false)
  }

  // La hoja se vuelve a sacar de `goals` en cada pintado en vez de guardar una
  // copia: así, cuando abonas, el número de adentro se actualiza solo.
  const metaAbierta = goals.find((g) => g.id === abierta) ?? null

  return (
    <>
      <div className="space-y-3">
        {goals.length === 0 && <Empty>Sin metas por ahora. Empieza con algo pequeño.</Empty>}

        {goals.map((g, i) => {
          const p = planDeMeta(g)
          const hitos = hitosDeMeta(g)
          return (
            <Card key={g.id} className="space-y-3">
              <button type="button" onClick={() => setAbierta(g.id)} className="w-full text-left">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 font-semibold">
                    <Punto className={tonoDeMeta(i)} />
                    <span className="truncate">{g.name}</span>
                  </span>
                  <span className="tabular shrink-0 text-sm text-ink2">
                    {money(g.saved)} <span className="text-muted">/ {money(g.target)}</span>
                  </span>
                </div>
              </button>

              <Bar value={p.avance} tone={p.listo ? 'good' : 'brand'} />

              {/* Sub-hitos: 25 / 50 / 75 / 100 % */}
              <div className="grid grid-cols-4 gap-1 text-center text-[11px]">
                {hitos.map((h) => (
                  <div key={h.pct} className={h.logrado ? 'font-semibold text-good' : 'text-muted'}>
                    <div>{Math.round(h.pct * 100)}%</div>
                    <div className="tabular">{money(h.monto)}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                <div className="min-w-0 flex-1 text-xs">
                  {p.listo ? (
                    <span className="font-semibold text-good">¡Completada! Ya puedes usarla.</span>
                  ) : p.porMes ? (
                    <span className="text-ink2">
                      <span className="tabular font-semibold text-ink">{money(p.porMes)}</span> al mes ·{' '}
                      <span className="tabular font-semibold text-ink">{money(p.porSemana)}</span> por semana
                    </span>
                  ) : (
                    <span className="text-muted">Faltan {money(p.falta)} · sin fecha límite</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="shrink-0 px-3 py-2 text-sm"
                  onClick={() => setAbierta(g.id)}
                >
                  Mover
                </Button>
              </div>
            </Card>
          )
        })}

        <Button
          variant="ghost"
          onClick={() => {
            setForm(vacio)
            setError('')
            setNueva(true)
          }}
          className="flex w-full items-center justify-center gap-2"
        >
          <Plus size={18} /> Nueva meta
        </Button>

        <p className="px-1 text-xs text-muted">
          Te quedan <span className="tabular font-semibold text-ink2">{money(libre)}</span> sin
          apartar.
        </p>
      </div>

      <Sheet open={nueva} onClose={() => setNueva(false)} title="Nueva meta">
        <div className="space-y-4">
          <Field label="Nombre">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Laptop nueva"
              autoFocus
            />
          </Field>
          <Field label="Cuánto necesitas">
            <Input
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value.replace(/[^\d]/g, '') })}
              inputMode="numeric"
              placeholder="25000"
            />
          </Field>
          <Field
            label="Apartar ahora (opcional)"
            hint={`Sale de tu dinero libre, y tienes ${money(libre)}.`}
          >
            <Input
              value={form.apartar}
              onChange={(e) => {
                setForm({ ...form, apartar: e.target.value.replace(/[^\d]/g, '') })
                setError('')
              }}
              inputMode="numeric"
              placeholder="0"
            />
          </Field>
          <Field
            label="Fecha objetivo"
            hint="Opcional. Si la pones, la app calcula el ritmo por mes y por semana."
          >
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </Field>

          {Boolean(form.apartar) && !revision.ok && (
            <p className="rounded-xl bg-crit/10 p-3 text-xs text-crit">
              Solo tienes {money(libre)} libre. Te faltan {money(revision.faltante)} para apartar
              esa cantidad.
            </p>
          )}
          {error && <p className="text-xs text-crit">{error}</p>}

          <Button
            onClick={crear}
            disabled={Boolean(form.apartar) && !revision.ok}
            className="w-full"
          >
            Crear meta
          </Button>
        </div>
      </Sheet>

      <HojaMeta
        goal={metaAbierta}
        libre={libre}
        envelopes={envelopes}
        onClose={() => setAbierta(null)}
      />
    </>
  )
}
