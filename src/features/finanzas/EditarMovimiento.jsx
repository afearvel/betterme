import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteTransaction, updateTransaction } from '../../db/db.js'
import { Button, Chip, Field, Input, Sheet } from '../../components/ui.jsx'
import SelectorFecha from './SelectorFecha.jsx'

/** Hoja para corregir un movimiento ya registrado. */
export default function EditarMovimiento({ tx, envelopes = [], onClose }) {
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (!tx) return setForm(null)
    setForm({
      amount: String(tx.amount),
      type: tx.type,
      envelopeId: tx.envelopeId ?? null,
      note: tx.note ?? '',
      date: tx.date,
    })
  }, [tx])

  async function guardar() {
    if (!tx || !form) return
    await updateTransaction(tx.id, {
      amount: Number(form.amount),
      type: form.type,
      envelopeId: form.type === 'gasto' ? form.envelopeId : null,
      note: form.note,
      date: form.date,
    })
    onClose()
  }

  async function borrar() {
    if (!tx) return
    await deleteTransaction(tx.id)
    onClose()
  }

  return (
    <Sheet open={Boolean(tx && form)} onClose={onClose} title="Editar movimiento">
      {form && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Chip active={form.type === 'gasto'} onClick={() => setForm({ ...form, type: 'gasto' })} className="flex-1">
              Gasto
            </Chip>
            <Chip active={form.type === 'ingreso'} onClick={() => setForm({ ...form, type: 'ingreso' })} className="flex-1">
              Ingreso
            </Chip>
          </div>

          <Field label="Monto">
            <Input
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^\d]/g, '') })}
              inputMode="numeric"
            />
          </Field>

          {form.type === 'gasto' && envelopes.length > 0 && (
            <Field label="Sobre">
              <div className="-mx-1 flex flex-wrap gap-2 px-1">
                <Chip active={form.envelopeId === null} onClick={() => setForm({ ...form, envelopeId: null })}>
                  Sin sobre
                </Chip>
                {envelopes.map((e) => (
                  <Chip key={e.id} active={form.envelopeId === e.id} onClick={() => setForm({ ...form, envelopeId: e.id })}>
                    {e.name}
                  </Chip>
                ))}
              </div>
            </Field>
          )}

          <Field label="Nota">
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Opcional" />
          </Field>

          <Field label="Fecha">
            <SelectorFecha value={form.date} onChange={(date) => setForm({ ...form, date })} />
          </Field>

          <div className="flex gap-2">
            <Button onClick={guardar} className="flex-1">
              Guardar cambios
            </Button>
            <Button variant="danger" onClick={borrar} aria-label="Borrar movimiento">
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
