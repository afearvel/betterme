import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Pencil, ShoppingBag, Trash2 } from 'lucide-react'
import { abonarMeta, db, deleteGoal, retirarMeta, updateGoal, usarMeta } from '../../db/db.js'
import { money, relativeDay } from '../../lib/format.js'
import { planDeMeta } from '../../lib/finance.js'
import { revisarApartado, revisarRetiro } from '../../lib/patrimonio.js'
import { Bar, Button, Chip, Field, Input, Sheet } from '../../components/ui.jsx'

/**
 * Todo lo que se le puede hacer a una meta, en una sola hoja con pasos.
 *
 * Los tres movimientos que existen y en qué se diferencian:
 *   Abonar  → dinero libre que pasa a estar apartado. Tu total NO cambia.
 *   Retirar → lo apartado vuelve a ser libre. Tu total NO cambia.
 *   Usar    → ya lo gastaste. Tu total SÍ baja, y queda un gasto registrado.
 *
 * Ese "el total no cambia" es la idea completa del módulo: apartar es ponerle
 * etiqueta a un dinero que ya tenías, no moverlo a otro lado.
 */
export default function HojaMeta({ goal, libre = 0, envelopes = [], onClose }) {
  const [paso, setPaso] = useState('menu')
  const [monto, setMonto] = useState('')
  const [nota, setNota] = useState('')
  const [sobreId, setSobreId] = useState(null)
  const [form, setForm] = useState({ name: '', target: '', deadline: '' })
  const [aviso, setAviso] = useState('')

  const abierta = Boolean(goal)

  // Al abrir otra meta (o cerrar) se limpia todo, para no arrastrar el monto
  // que estabas escribiendo en la meta anterior.
  useEffect(() => {
    setPaso('menu')
    setMonto('')
    setNota('')
    setSobreId(null)
    setAviso('')
    if (goal) {
      setForm({
        name: goal.name,
        target: String(goal.target ?? ''),
        deadline: goal.deadline ?? '',
      })
    }
  }, [goal?.id])

  const movimientos = useLiveQuery(
    async () => {
      if (!goal) return []
      const filas = await db.goalMoves.where('goalId').equals(goal.id).toArray()
      return filas.sort((a, b) => (b.createdAt ?? b.date).localeCompare(a.createdAt ?? a.date))
    },
    [goal?.id],
    [],
  )

  if (!goal) return <Sheet open={false} onClose={onClose} title="" />

  const plan = planDeMeta(goal)
  const abono = revisarApartado({ libre, monto })
  const retiro = revisarRetiro({ goal, monto })
  const usoMonto = Math.min(goal.saved, Math.round(Number(monto) || 0))

  async function confirmarAbono() {
    const r = await abonarMeta(goal.id, Number(monto), { note: nota })
    if (!r.ok) {
      setAviso(
        r.motivo === 'no-alcanza'
          ? `No alcanza: solo hay ${money(r.libre)} libre.`
          : 'Escribe un monto.',
      )
      return
    }
    volver()
  }

  async function confirmarRetiro() {
    const r = await retirarMeta(goal.id, Number(monto), { note: nota })
    if (!r.ok) {
      setAviso(r.motivo === 'no-alcanza' ? 'La meta no tiene tanto.' : 'Escribe un monto.')
      return
    }
    volver()
  }

  async function confirmarUso() {
    const r = await usarMeta(goal.id, { amount: Number(monto), note: nota, envelopeId: sobreId })
    if (!r.ok) {
      setAviso('Escribe un monto.')
      return
    }
    volver()
  }

  async function guardarEdicion() {
    await updateGoal(goal.id, {
      name: form.name.trim() || 'Meta',
      target: Number(form.target) || 0,
      deadline: form.deadline || null,
    })
    setPaso('menu')
  }

  function volver() {
    setMonto('')
    setNota('')
    setSobreId(null)
    setAviso('')
    setPaso('menu')
  }

  const titulos = {
    menu: goal.name,
    abonar: 'Apartar dinero',
    retirar: 'Regresar a libre',
    usar: 'Usar esta meta',
    editar: 'Editar meta',
  }

  return (
    <Sheet open={abierta} onClose={onClose} title={titulos[paso]}>
      {paso !== 'menu' && (
        <button
          type="button"
          onClick={volver}
          className="mb-4 flex items-center gap-1 text-sm text-muted"
        >
          <ArrowLeft size={16} /> {goal.name}
        </button>
      )}

      {paso === 'menu' && (
        <div className="space-y-4">
          <div>
            <p className="tabular text-3xl font-semibold">{money(goal.saved)}</p>
            <p className="text-sm text-muted">
              apartados de {money(goal.target)}
              {plan.listo ? ' · ¡completa!' : ` · faltan ${money(plan.falta)}`}
            </p>
          </div>
          <Bar value={plan.avance} tone={plan.listo ? 'good' : 'brand'} />

          <div className="grid grid-cols-3 gap-2">
            <Accion
              Icon={ArrowDownToLine}
              texto="Abonar"
              onClick={() => setPaso('abonar')}
              disabled={libre <= 0}
            />
            <Accion
              Icon={ArrowUpFromLine}
              texto="Retirar"
              onClick={() => setPaso('retirar')}
              disabled={goal.saved <= 0}
            />
            <Accion
              Icon={ShoppingBag}
              texto="Usar"
              onClick={() => {
                setMonto(String(goal.saved))
                setPaso('usar')
              }}
              disabled={goal.saved <= 0}
            />
          </div>

          {libre <= 0 && (
            <p className="text-xs text-muted">
              No tienes dinero libre para abonar. Registra un ingreso o retira de otra meta.
            </p>
          )}

          <button
            type="button"
            onClick={() => setPaso('editar')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm text-ink2"
          >
            <Pencil size={15} /> Editar nombre, monto o fecha
          </button>

          <div className="border-t border-line pt-3">
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
              Movimientos de esta meta
            </p>
            {movimientos.length === 0 ? (
              <p className="text-xs text-muted">Todavía no hay movimientos.</p>
            ) : (
              <ul className="space-y-2">
                {movimientos.slice(0, 12).map((m) => (
                  <li key={m.id} className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">
                      {ETIQUETA[m.kind]}
                      {m.note ? <span className="text-muted"> · {m.note}</span> : null}
                    </span>
                    <span className="text-xs text-muted">{relativeDay(m.date)}</span>
                    <span className={`tabular shrink-0 font-semibold ${TONO[m.kind]}`}>
                      {SIGNO[m.kind]}
                      {money(m.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {paso === 'abonar' && (
        <div className="space-y-4">
          <MontoGrande value={monto} onChange={setMonto} onReset={() => setAviso('')} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Tienes libre</span>
            <button
              type="button"
              onClick={() => setMonto(String(libre))}
              className="tabular font-semibold text-brand"
            >
              {money(libre)} · usar todo
            </button>
          </div>
          <Input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota (opcional)" />

          {!abono.ok && !abono.vacio && (
            <p className="rounded-xl bg-crit/10 p-3 text-sm text-crit">
              No puedes apartar más de lo que tienes. Te faltan {money(abono.faltante)}.
            </p>
          )}
          {aviso && <p className="text-sm text-crit">{aviso}</p>}

          <p className="text-xs text-muted">
            Apartar no gasta el dinero: tu total sigue en el mismo número, nada más deja de estar
            libre.
          </p>
          <Button onClick={confirmarAbono} disabled={!abono.ok} className="w-full">
            Apartar {abono.monto > 0 ? money(abono.monto) : ''}
          </Button>
        </div>
      )}

      {paso === 'retirar' && (
        <div className="space-y-4">
          <MontoGrande value={monto} onChange={setMonto} onReset={() => setAviso('')} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Esta meta tiene</span>
            <button
              type="button"
              onClick={() => setMonto(String(goal.saved))}
              className="tabular font-semibold text-brand"
            >
              {money(goal.saved)} · sacar todo
            </button>
          </div>
          <Input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota (opcional)" />

          {!retiro.ok && !retiro.vacio && (
            <p className="rounded-xl bg-crit/10 p-3 text-sm text-crit">
              La meta solo tiene {money(retiro.tope)}.
            </p>
          )}
          {aviso && <p className="text-sm text-crit">{aviso}</p>}

          <p className="text-xs text-muted">
            El dinero regresa a estar libre. Tu total tampoco cambia aquí: solo le quitas la
            etiqueta.
          </p>
          <Button onClick={confirmarRetiro} disabled={!retiro.ok} className="w-full">
            Regresar a libre {retiro.monto > 0 ? money(retiro.monto) : ''}
          </Button>
        </div>
      )}

      {paso === 'usar' && (
        <div className="space-y-4">
          <MontoGrande value={monto} onChange={setMonto} onReset={() => setAviso('')} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Apartado en la meta</span>
            <button
              type="button"
              onClick={() => setMonto(String(goal.saved))}
              className="tabular font-semibold text-brand"
            >
              {money(goal.saved)} · usar todo
            </button>
          </div>

          <Input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder={`Nota (por defecto: ${goal.name})`}
          />

          {envelopes.length > 0 && (
            <div className="-mx-5 flex flex-wrap gap-2 px-5">
              <Chip active={sobreId === null} onClick={() => setSobreId(null)}>
                Sin sobre
              </Chip>
              {envelopes.map((e) => (
                <Chip key={e.id} active={sobreId === e.id} onClick={() => setSobreId(e.id)}>
                  {e.name}
                </Chip>
              ))}
            </div>
          )}

          {aviso && <p className="text-sm text-crit">{aviso}</p>}

          <p className="rounded-xl bg-warn/10 p-3 text-xs text-warn">
            Este sí saca el dinero de verdad: queda registrado un gasto de {money(usoMonto)} y tu
            total baja esa misma cantidad. Es lo que quieres cuando ya compraste la cosa.
          </p>
          <Button onClick={confirmarUso} disabled={usoMonto <= 0} className="w-full">
            Gastar {usoMonto > 0 ? money(usoMonto) : ''} de la meta
          </Button>
        </div>
      )}

      {paso === 'editar' && (
        <div className="space-y-4">
          <Field label="Nombre">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Cuánto necesitas">
            <Input
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value.replace(/[^\d]/g, '') })}
              inputMode="numeric"
            />
          </Field>
          <Field label="Fecha objetivo" hint="Opcional.">
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </Field>

          <p className="text-xs text-muted">
            Lo apartado no se edita aquí a propósito: se mueve con Abonar y Retirar, que son los
            que revisan que no apartes dinero que no tienes.
          </p>

          <div className="flex gap-2">
            <Button onClick={guardarEdicion} className="flex-1">
              Guardar
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await deleteGoal(goal.id)
                onClose()
              }}
              aria-label="Borrar meta"
            >
              <Trash2 size={18} />
            </Button>
          </div>
          {goal.saved > 0 && (
            <p className="text-xs text-muted">
              Si la borras, los {money(goal.saved)} que tiene apartados vuelven a ser dinero libre.
              No se pierde nada.
            </p>
          )}
        </div>
      )}
    </Sheet>
  )
}

const ETIQUETA = { abono: 'Apartaste', retiro: 'Regresó a libre', uso: 'Lo usaste' }
const SIGNO = { abono: '+', retiro: '−', uso: '−' }
const TONO = { abono: 'text-good', retiro: 'text-ink2', uso: 'text-warn' }

function Accion({ Icon, texto, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 rounded-xl bg-line/60 py-3 text-xs font-semibold text-ink2 disabled:opacity-30"
    >
      <Icon size={18} />
      {texto}
    </button>
  )
}

function MontoGrande({ value, onChange, onReset }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-3xl font-light text-muted">$</span>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value.replace(/[^\d]/g, ''))
          onReset?.()
        }}
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="0"
        aria-label="Monto"
        autoFocus
        className="tabular w-full bg-transparent font-semibold text-ink outline-none placeholder:text-line"
        style={{ fontSize: '2.5rem' }}
      />
    </div>
  )
}
