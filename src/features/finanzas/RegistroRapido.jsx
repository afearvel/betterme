import { useRef, useState } from 'react'
import { Check, Minus, Plus } from 'lucide-react'
import { addTransaction } from '../../db/db.js'
import { relativeDay, today } from '../../lib/format.js'
import { revisarGasto } from '../../lib/patrimonio.js'
import { Card, Chip, Input } from '../../components/ui.jsx'
import SelectorFecha from './SelectorFecha.jsx'
import HojaSobregiro from './HojaSobregiro.jsx'

/**
 * Cero fricción: abrir la app y en dos toques ya quedó registrado el gasto.
 * inputMode="numeric" hace que iPhone abra el teclado de números directo.
 * La fecha viene en "hoy" y solo se muestra el selector si lo pides.
 *
 * Lo único que se interpone es el aviso de sobregiro: si el gasto se pasa de
 * tu dinero libre, antes de guardarlo sube una hoja para que decidas de dónde
 * sale. Un ingreso nunca se detiene: solo suma.
 */
export default function RegistroRapido({ envelopes = [], libre = 0, total = 0, goals = [] }) {
  const [tipo, setTipo] = useState('gasto')
  const [monto, setMonto] = useState('')
  const [sobreId, setSobreId] = useState(null)
  const [nota, setNota] = useState('')
  const [fecha, setFecha] = useState(today())
  const [verFecha, setVerFecha] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [avisando, setAvisando] = useState(false)
  const montoRef = useRef(null)

  const valido = Number(monto) > 0
  const esHoy = fecha === today()

  /** El guardado de verdad, sin preguntas. */
  async function registrar() {
    await addTransaction({
      amount: Number(monto),
      type: tipo,
      envelopeId: tipo === 'gasto' ? sobreId : null,
      note: nota,
      date: fecha,
    })
    setAvisando(false)
    setMonto('')
    setNota('')
    setFecha(today())
    setVerFecha(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 1200)
  }

  async function guardar() {
    if (!valido) return
    // Un ingreso siempre cabe: solo suma. Un gasto se revisa contra lo libre.
    if (tipo === 'gasto' && !revisarGasto({ libre, total, monto: Number(monto) }).cabe) {
      setAvisando(true)
      return
    }
    await registrar()
  }

  return (
    <Card className="space-y-4">
      <div className="flex gap-2">
        <Chip active={tipo === 'gasto'} onClick={() => setTipo('gasto')} className="flex-1">
          <Minus size={14} className="mr-1 inline" /> Gasto
        </Chip>
        <Chip active={tipo === 'ingreso'} onClick={() => setTipo('ingreso')} className="flex-1">
          <Plus size={14} className="mr-1 inline" /> Ingreso
        </Chip>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-3xl font-light text-muted">$</span>
        <input
          ref={montoRef}
          value={monto}
          onChange={(e) => setMonto(e.target.value.replace(/[^\d]/g, ''))}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          aria-label="Monto"
          className="tabular w-full bg-transparent font-semibold text-ink outline-none placeholder:text-line"
          style={{ fontSize: '2.75rem' }}
        />
      </div>

      {tipo === 'gasto' && envelopes.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
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

      <Input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota (opcional)" />

      {/* La fecha se queda escondida hasta que la necesites: el 95% de las veces
          estás registrando algo de hoy y no debe costarte ni un toque. */}
      {verFecha ? (
        <SelectorFecha value={fecha} onChange={setFecha} />
      ) : (
        <button
          type="button"
          onClick={() => setVerFecha(true)}
          className="text-sm text-muted underline underline-offset-2"
        >
          {esHoy ? 'Cambiar fecha' : `Fecha: ${relativeDay(fecha)}`}
        </button>
      )}

      <button
        type="button"
        onClick={guardar}
        disabled={!valido}
        className={`w-full rounded-xl py-4 text-lg font-semibold transition-colors disabled:opacity-30 ${
          guardado ? 'bg-good text-white' : 'bg-brand text-white active:bg-brand/80'
        }`}
      >
        {guardado ? (
          <span className="inline-flex items-center gap-2">
            <Check size={20} /> Guardado
          </span>
        ) : esHoy ? (
          'Registrar'
        ) : (
          `Registrar · ${relativeDay(fecha)}`
        )}
      </button>

      <HojaSobregiro
        open={avisando}
        monto={Number(monto) || 0}
        libre={libre}
        total={total}
        goals={goals}
        onRegistrar={registrar}
        onCambiarMonto={() => {
          setAvisando(false)
          // El teclado vuelve solo al monto: cambiarlo es la salida más común.
          setTimeout(() => montoRef.current?.focus(), 50)
        }}
        onCancelar={() => setAvisando(false)}
      />
    </Card>
  )
}
