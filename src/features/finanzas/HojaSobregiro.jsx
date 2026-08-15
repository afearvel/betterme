import { useState } from 'react'
import { Check, TriangleAlert } from 'lucide-react'
import { retirarMeta } from '../../db/db.js'
import { money } from '../../lib/format.js'
import { metasParaRescate, revisarGasto } from '../../lib/patrimonio.js'
import { Button, Sheet } from '../../components/ui.jsx'

/**
 * El aviso de cuando un gasto se pasa de tu dinero libre.
 *
 * El gasto NO se bloquea: ya pasó en la vida real y obligarte a mentirle a la
 * app sería peor que el problema. Lo que se hace es avisar y darte las salidas
 * que pediste: sacar la diferencia de la meta que tú elijas, cambiar el monto,
 * o cancelar.
 *
 * Los números de aquí adentro se recalculan solos: `libre` y `goals` llegan
 * vivos desde la base. Por eso, si la meta que elegiste no alcanzaba a cubrir
 * todo, la hoja se queda abierta con el faltante ya actualizado y puedes tomar
 * lo que resta de otra. Cuando el faltante llega a cero, el botón de registrar
 * se enciende solo.
 */
export default function HojaSobregiro({
  open,
  monto = 0,
  libre = 0,
  total = 0,
  goals = [],
  onRegistrar,
  onCambiarMonto,
  onCancelar,
}) {
  const [trabajando, setTrabajando] = useState(false)

  const r = revisarGasto({ libre, total, monto })
  const rescates = metasParaRescate({ goals, faltante: r.faltante })

  async function sacarDe(meta) {
    setTrabajando(true)
    await retirarMeta(meta.id, meta.retiro, { note: 'Para cubrir un gasto' })
    setTrabajando(false)
  }

  return (
    <Sheet open={open} onClose={onCancelar} title="Ese gasto no cabe">
      <div className="space-y-4">
        <div
          className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
            r.cabe ? 'bg-good/10 text-good' : 'bg-warn/10 text-warn'
          }`}
        >
          {r.cabe ? (
            <Check size={18} className="mt-px shrink-0" />
          ) : (
            <TriangleAlert size={18} className="mt-px shrink-0" />
          )}
          <span>
            {r.cabe
              ? 'Ya cabe. Puedes registrar el gasto.'
              : `Quieres gastar ${money(monto)} y solo tienes ${money(libre)} sin apartar. El resto ya tiene dueño en tus metas.`}
          </span>
        </div>

        <div className="space-y-1 text-sm text-ink2">
          <Linea etiqueta="Gasto" valor={money(monto)} />
          <Linea etiqueta="Dinero libre" valor={money(libre)} />
          <div className="border-t border-line pt-1">
            <Linea
              etiqueta={r.cabe ? 'Sobra' : 'Te falta'}
              valor={money(r.cabe ? libre - monto : r.faltante)}
              fuerte
              rojo={!r.cabe}
            />
          </div>
        </div>

        {!r.cabe && rescates.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              ¿De qué meta lo saco?
            </p>
            {rescates.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={trabajando}
                onClick={() => sacarDe(m)}
                className="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left active:bg-line/40 disabled:opacity-40"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{m.name}</span>
                  <span className="block text-xs text-muted">
                    tiene {money(m.saved)}
                    {m.cubre ? '' : ` · no alcanza, faltarían ${money(m.restante)}`}
                  </span>
                </span>
                <span className="tabular shrink-0 text-sm font-semibold text-brand">
                  −{money(m.retiro)}
                </span>
              </button>
            ))}
          </div>
        )}

        {!r.cabe && rescates.length === 0 && (
          <p className="text-sm text-muted">
            No tienes ninguna meta con dinero de dónde sacarlo. Puedes cambiar el monto, cancelar, o
            registrarlo de todos modos y tu dinero libre se va a quedar en rojo hasta tu próximo
            ingreso.
          </p>
        )}

        <div className="space-y-2 border-t border-line pt-4">
          <Button onClick={onRegistrar} disabled={!r.cabe} className="w-full">
            Registrar el gasto de {money(monto)}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onCambiarMonto} className="flex-1 text-sm">
              Cambiar el monto
            </Button>
            <Button variant="ghost" onClick={onCancelar} className="flex-1 text-sm">
              Cancelar
            </Button>
          </div>
          {!r.cabe && (
            <button
              type="button"
              onClick={onRegistrar}
              className="w-full pt-1 text-center text-xs text-muted underline underline-offset-2"
            >
              Registrarlo de todos modos (mi dinero libre queda en rojo)
            </button>
          )}
        </div>

        {r.pasaDelTotal && (
          <p className="text-xs text-crit">
            Ojo: ese gasto es más grande que todo tu dinero. Aunque vacíes las metas, tu total
            quedaría en {money(r.totalDespues)}.
          </p>
        )}
      </div>
    </Sheet>
  )
}

function Linea({ etiqueta, valor, fuerte, rojo }) {
  return (
    <div className="flex justify-between">
      <span className={fuerte ? 'font-semibold text-ink' : ''}>{etiqueta}</span>
      <span className={`tabular ${rojo ? 'font-semibold text-crit' : fuerte ? 'font-semibold text-ink' : ''}`}>
        {valor}
      </span>
    </div>
  )
}
