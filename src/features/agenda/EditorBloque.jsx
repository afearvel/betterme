import { useEffect, useState } from 'react'
import { CalendarPlus, Trash2 } from 'lucide-react'
import { SEMANA, today } from '../../lib/format.js'
import {
  DURACIONES, bloqueAIcs, duracionTexto, nombreArchivoIcs, textoRepeticion,
} from '../../lib/agenda.js'
import { addBlock, deleteBlock, updateBlock } from '../../db/db.js'
import { Button, Chip, Field, Input, Sheet, Toggle } from '../../components/ui.jsx'
import { CampoFecha, CampoHora } from './piezas.jsx'

/**
 * La hoja para crear o editar un bloque. Sube desde abajo, como todos los
 * formularios de la app, porque ahí llega el pulgar sin estirar la mano.
 *
 * Los dos interruptores de arriba deciden la FORMA del bloque:
 *
 *   "A una hora fija"   apagado → bloque flexible: pasa ese día, sin hora.
 *   "Se repite"         prendido → deja de tener una fecha suelta y pasa a ser
 *                        una regla ("cada martes y jueves"). Es una sola fila
 *                        en la base, no una fila por semana.
 */
export default function EditorBloque({ open, block, fecha, onClose }) {
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [conHora, setConHora] = useState(true)
  const [start, setStart] = useState('09:00')
  const [mins, setMins] = useState(60)
  const [repite, setRepite] = useState(false)
  const [weekdays, setWeekdays] = useState([])
  const [date, setDate] = useState(fecha)
  const [startDate, setStartDate] = useState(fecha)
  const [endDate, setEndDate] = useState(null)

  // Cada vez que se abre la hoja se recargan los campos. Sin esto, editar un
  // bloque y luego crear otro te dejaría los datos del anterior en pantalla.
  useEffect(() => {
    if (!open) return
    if (block) {
      setName(block.name ?? '')
      setNote(block.note ?? '')
      setConHora(Boolean(block.start))
      setStart(block.start ?? '09:00')
      setMins(block.mins ?? 60)
      setRepite(block.repite === 1)
      setWeekdays(block.weekdays ?? [])
      setDate(block.date ?? fecha)
      setStartDate(block.startDate ?? fecha)
      setEndDate(block.endDate ?? null)
    } else {
      setName('')
      setNote('')
      setConHora(true)
      setStart('09:00')
      setMins(60)
      setRepite(false)
      setWeekdays([])
      setDate(fecha)
      setStartDate(fecha)
      setEndDate(null)
    }
  }, [open, block, fecha])

  const alternarDia = (n) =>
    setWeekdays((prev) => (prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n]))

  const puedeGuardar = name.trim() !== '' && (!repite || weekdays.length > 0)

  const guardar = async () => {
    if (!puedeGuardar) return
    const datos = {
      name,
      note,
      start: conHora ? start : null,
      mins: conHora ? mins : 0,
      repite: repite ? 1 : 0,
      date: repite ? null : date,
      weekdays: repite ? weekdays : [],
      startDate: repite ? startDate : null,
      endDate: repite ? endDate : null,
    }
    if (block) await updateBlock(block.id, datos)
    else await addBlock(datos)
    onClose()
  }

  const borrar = async () => {
    await deleteBlock(block.id)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={block ? 'Editar bloque' : 'Nuevo bloque'}>
      <div className="space-y-4">
        <Field label="¿Qué es?">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Clase de inglés, comida con Ana…"
            autoFocus={!block}
          />
        </Field>

        <div className="rounded-xl border border-line p-3">
          <Toggle
            checked={conHora}
            onChange={setConHora}
            label="A una hora fija"
            hint={conHora ? undefined : 'Pasa ese día, pero sin hora concreta'}
          />
          {conHora && (
            <div className="mt-3 space-y-3">
              <Field label="Empieza a las">
                <CampoHora value={start} onChange={(v) => setStart(v ?? '09:00')} />
              </Field>
              <Field label="Dura">
                {/* Se acomodan en varias filas en vez de deslizarse de lado:
                    a 390 px, una tira horizontal corta el último chip por la
                    mitad y parece que la pantalla está rota. */}
                <div className="flex flex-wrap gap-2">
                  {DURACIONES.map((d) => (
                    <Chip key={d} active={mins === d} onClick={() => setMins(d)}>
                      {duracionTexto(d)}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line p-3">
          <Toggle
            checked={repite}
            onChange={setRepite}
            label="Se repite cada semana"
            hint={
              repite
                ? 'Se guarda como una regla, no como una fila por semana'
                : 'Pasa una sola vez'
            }
          />

          {repite ? (
            <div className="mt-3 space-y-3">
              <Field label="Qué días" hint={textoRepeticion({ repite: 1, weekdays })}>
                <div className="flex gap-1.5">
                  {SEMANA.map((s) => (
                    <button
                      key={s.n}
                      type="button"
                      onClick={() => alternarDia(s.n)}
                      aria-pressed={weekdays.includes(s.n)}
                      aria-label={s.largo}
                      className={`h-10 flex-1 rounded-lg border text-sm transition-colors ${
                        weekdays.includes(s.n)
                          ? 'border-brand bg-brand/15 font-semibold text-ink'
                          : 'border-line bg-plane text-muted'
                      }`}
                    >
                      {s.corto}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Desde">
                <CampoFecha value={startDate} onChange={(v) => setStartDate(v ?? today())} />
              </Field>
              <Field
                label="Hasta (opcional)"
                hint="Déjalo vacío y no se acaba nunca. Útil para un semestre."
              >
                <CampoFecha value={endDate} onChange={setEndDate} />
              </Field>
            </div>
          ) : (
            <div className="mt-3">
              <Field label="Qué día">
                <CampoFecha value={date} onChange={(v) => setDate(v ?? fecha)} />
              </Field>
            </div>
          )}
        </div>

        <Field label="Nota (opcional)">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Dónde, con quién, qué llevar…"
          />
        </Field>

        <Button onClick={guardar} disabled={!puedeGuardar} className="w-full">
          {block ? 'Guardar cambios' : 'Agregar a la agenda'}
        </Button>

        {repite && weekdays.length === 0 && (
          <p className="text-center text-xs text-muted">Elige al menos un día de la semana.</p>
        )}

        {block && (
          <>
            <BotonCalendario block={block} />
            <Button variant="danger" onClick={borrar} className="flex w-full items-center justify-center gap-2">
              <Trash2 size={16} />
              Borrar {block.repite === 1 ? 'toda la serie' : 'el bloque'}
            </Button>
          </>
        )}
      </div>
    </Sheet>
  )
}

/**
 * Manda el bloque al Calendario del iPhone como archivo .ics.
 *
 * POR QUÉ ESTE BOTÓN EXISTE: esta app NO te puede mandar notificaciones de
 * forma confiable (ver el comentario de LoQueSigue.jsx). El Calendario que ya
 * traes en el teléfono sí sabe hacerlo. Así que en vez de prometerte una
 * alarma que a veces no suena, te dejamos pasarle el evento a quien sí puede.
 *
 * Es la misma manera de bajar archivos que usa el respaldo en Ajustes: se arma
 * el contenido en memoria y se le da clic a un enlace invisible.
 */
function BotonCalendario({ block }) {
  const bajar = () => {
    const texto = bloqueAIcs(block, {
      uid: block.id,
      sello: `${new Date().toISOString().slice(0, 19).replace(/[-:]/g, '')}Z`,
    })
    if (!texto) return
    const blob = new Blob([texto], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivoIcs(block.name)
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        onClick={bajar}
        className="flex w-full items-center justify-center gap-2"
      >
        <CalendarPlus size={16} />
        Agregar al Calendario del iPhone
      </Button>
      <p className="text-center text-xs text-muted">
        Baja un archivo y el Calendario pone la alarma. Viaja la repetición, pero no los
        cambios sueltos de un día.
      </p>
    </div>
  )
}
