import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { addGoal, addToGoal, deleteGoal, updateGoal } from '../../db/db.js'
import { money } from '../../lib/format.js'
import { hitosDeMeta, planDeMeta } from '../../lib/finance.js'
import { Bar, Button, Card, Empty, Field, Input, Sheet } from '../../components/ui.jsx'

const vacio = { name: '', target: '', saved: '', deadline: '' }

/** Metas de ahorro con sub-hitos y el ritmo necesario por mes y por semana. */
export default function Metas({ goals = [] }) {
  const [abierto, setAbierto] = useState(false)
  const [form, setForm] = useState(vacio)
  const [editandoId, setEditandoId] = useState(null)
  const [abonoId, setAbonoId] = useState(null)
  const [abono, setAbono] = useState('')

  function abrirNueva() {
    setForm(vacio)
    setEditandoId(null)
    setAbierto(true)
  }

  function abrirEdicion(g) {
    setForm({
      name: g.name,
      target: String(g.target),
      saved: String(g.saved),
      deadline: g.deadline ?? '',
    })
    setEditandoId(g.id)
    setAbierto(true)
  }

  async function guardar() {
    const datos = {
      name: form.name.trim() || 'Meta',
      target: Number(form.target) || 0,
      saved: Number(form.saved) || 0,
      deadline: form.deadline || null,
    }
    if (editandoId) await updateGoal(editandoId, datos)
    else await addGoal(datos)
    setAbierto(false)
  }

  async function confirmarAbono() {
    const monto = Number(abono)
    if (abonoId && monto > 0) await addToGoal(abonoId, monto)
    setAbonoId(null)
    setAbono('')
  }

  return (
    <>
      <div className="space-y-3">
        {goals.length === 0 && <Empty>Sin metas por ahora. Empieza con algo pequeño.</Empty>}

        {goals.map((g) => {
          const p = planDeMeta(g)
          const hitos = hitosDeMeta(g)
          return (
            <Card key={g.id} className="space-y-3">
              <button type="button" onClick={() => abrirEdicion(g)} className="w-full text-left">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{g.name}</span>
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
                    <span className="font-semibold text-good">¡Completada!</span>
                  ) : p.porMes ? (
                    <span className="text-ink2">
                      <span className="tabular font-semibold text-ink">{money(p.porMes)}</span> al mes ·{' '}
                      <span className="tabular font-semibold text-ink">{money(p.porSemana)}</span> por semana
                    </span>
                  ) : (
                    <span className="text-muted">Faltan {money(p.falta)} · sin fecha límite</span>
                  )}
                </div>
                <Button variant="ghost" className="shrink-0 px-3 py-2 text-sm" onClick={() => setAbonoId(g.id)}>
                  Abonar
                </Button>
              </div>
            </Card>
          )
        })}

        <Button variant="ghost" onClick={abrirNueva} className="flex w-full items-center justify-center gap-2">
          <Plus size={18} /> Nueva meta
        </Button>
      </div>

      <Sheet open={abierto} onClose={() => setAbierto(false)} title={editandoId ? 'Editar meta' : 'Nueva meta'}>
        <div className="space-y-4">
          <Field label="Nombre">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Laptop nueva" autoFocus />
          </Field>
          <Field label="Cuánto necesitas">
            <Input
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value.replace(/[^\d]/g, '') })}
              inputMode="numeric"
              placeholder="25000"
            />
          </Field>
          <Field label="Cuánto llevas">
            <Input
              value={form.saved}
              onChange={(e) => setForm({ ...form, saved: e.target.value.replace(/[^\d]/g, '') })}
              inputMode="numeric"
              placeholder="0"
            />
          </Field>
          <Field label="Fecha objetivo" hint="Opcional. Si la pones, la app calcula el ritmo por mes y por semana.">
            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </Field>

          <div className="flex gap-2">
            <Button onClick={guardar} className="flex-1">
              Guardar
            </Button>
            {editandoId && (
              <Button
                variant="danger"
                onClick={async () => {
                  await deleteGoal(editandoId)
                  setAbierto(false)
                }}
                aria-label="Borrar meta"
              >
                <Trash2 size={18} />
              </Button>
            )}
          </div>
        </div>
      </Sheet>

      <Sheet open={abonoId !== null} onClose={() => setAbonoId(null)} title="Abonar a la meta">
        <div className="space-y-4">
          <Field label="Monto">
            <Input
              value={abono}
              onChange={(e) => setAbono(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              placeholder="0"
              autoFocus
            />
          </Field>
          <Button onClick={confirmarAbono} className="w-full">
            Abonar
          </Button>
        </div>
      </Sheet>
    </>
  )
}
