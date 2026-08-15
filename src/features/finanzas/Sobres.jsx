import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { addEnvelope, deleteEnvelope, updateEnvelope } from '../../db/db.js'
import { money } from '../../lib/format.js'
import { Bar, Button, Card, Chip, Empty, Field, Input, Sheet } from '../../components/ui.jsx'

const vacio = { name: '', kind: 'libre', budget: '' }

/**
 * Sobres digitales: separar visualmente el dinero comprometido (fijo) del
 * dinero del día a día (libre). El dinero de los sobres fijos NO entra al
 * cálculo del gasto libre diario.
 */
export default function Sobres({ envelopes = [], gastos = {} }) {
  const [abierto, setAbierto] = useState(false)
  const [form, setForm] = useState(vacio)
  const [editandoId, setEditandoId] = useState(null)

  function abrirNuevo() {
    setForm(vacio)
    setEditandoId(null)
    setAbierto(true)
  }

  function abrirEdicion(e) {
    setForm({ name: e.name, kind: e.kind, budget: String(e.budget || '') })
    setEditandoId(e.id)
    setAbierto(true)
  }

  async function guardar() {
    const datos = {
      name: form.name.trim() || 'Sin nombre',
      kind: form.kind,
      budget: Number(form.budget) || 0,
    }
    if (editandoId) await updateEnvelope(editandoId, datos)
    else await addEnvelope(datos)
    setAbierto(false)
  }

  async function borrar() {
    if (editandoId) await deleteEnvelope(editandoId)
    setAbierto(false)
  }

  const fijos = envelopes.filter((e) => e.kind === 'fijo')
  const libres = envelopes.filter((e) => e.kind === 'libre')

  return (
    <>
      <div className="space-y-3">
        <Grupo titulo="Comprometido" sobres={fijos} gastos={gastos} onEditar={abrirEdicion} />
        <Grupo titulo="Gasto libre" sobres={libres} gastos={gastos} onEditar={abrirEdicion} />
        {envelopes.length === 0 && <Empty>Todavía no tienes sobres.</Empty>}
        <Button variant="ghost" onClick={abrirNuevo} className="flex w-full items-center justify-center gap-2">
          <Plus size={18} /> Nuevo sobre
        </Button>
      </div>

      <Sheet open={abierto} onClose={() => setAbierto(false)} title={editandoId ? 'Editar sobre' : 'Nuevo sobre'}>
        <div className="space-y-4">
          <Field label="Nombre">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Transporte"
              autoFocus
            />
          </Field>

          <Field label="Tipo" hint="Los sobres fijos se descuentan antes de calcular tu gasto libre diario.">
            <div className="flex gap-2">
              <Chip active={form.kind === 'fijo'} onClick={() => setForm({ ...form, kind: 'fijo' })} className="flex-1">
                Comprometido
              </Chip>
              <Chip active={form.kind === 'libre'} onClick={() => setForm({ ...form, kind: 'libre' })} className="flex-1">
                Gasto libre
              </Chip>
            </div>
          </Field>

          <Field label="Presupuesto mensual" hint="Pesos enteros. Déjalo en 0 si no quieres tope.">
            <Input
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value.replace(/[^\d]/g, '') })}
              inputMode="numeric"
              placeholder="0"
            />
          </Field>

          <div className="flex gap-2">
            <Button onClick={guardar} className="flex-1">
              Guardar
            </Button>
            {editandoId && (
              <Button variant="danger" onClick={borrar} aria-label="Borrar sobre">
                <Trash2 size={18} />
              </Button>
            )}
          </div>
        </div>
      </Sheet>
    </>
  )
}

function Grupo({ titulo, sobres, gastos, onEditar }) {
  if (sobres.length === 0) return null
  const total = sobres.reduce((a, e) => a + (gastos[e.id] ?? 0), 0)

  return (
    <Card className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-ink2">{titulo}</h3>
        <span className="tabular text-sm text-muted">{money(total)} este mes</span>
      </div>

      <ul className="space-y-3">
        {sobres.map((e) => {
          const gastado = gastos[e.id] ?? 0
          const avance = e.budget > 0 ? gastado / e.budget : 0
          const excedido = e.budget > 0 && gastado > e.budget
          return (
            <li key={e.id}>
              <button type="button" onClick={() => onEditar(e)} className="w-full space-y-1.5 text-left">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate">{e.name}</span>
                  <span className="tabular shrink-0 text-sm text-ink2">
                    {money(gastado)}
                    {e.budget > 0 && <span className="text-muted"> / {money(e.budget)}</span>}
                  </span>
                </div>
                {e.budget > 0 && <Bar value={avance} tone={excedido ? 'crit' : avance > 0.8 ? 'warn' : 'brand'} />}
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
