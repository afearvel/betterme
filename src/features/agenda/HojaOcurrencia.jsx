import { useEffect, useState } from 'react'
import { CalendarX2, Check, Clock3, MoveRight, Pencil, RotateCcw } from 'lucide-react'
import { addDays, fechaLarga, today } from '../../lib/format.js'
import { rangoTexto, textoRepeticion } from '../../lib/agenda.js'
import {
  alternarBloque, cambiarHoraDelDia, cancelarBloque, moverOcurrencia, restaurarDia,
} from '../../db/db.js'
import { Button, Chip, Field, Sheet } from '../../components/ui.jsx'
import { CampoFecha, CampoHora } from './piezas.jsx'

/**
 * Lo que se puede hacer con UNA ocurrencia suelta.
 *
 * La diferencia clave está aquí: si el bloque es una serie ("cada martes"),
 * todo lo de esta hoja toca SOLO ESE DÍA y la regla sigue igual. Cambiar la
 * serie entera es otro botón, el de "Editar", y está separado a propósito para
 * que no muevas un semestre completo queriendo mover una clase.
 */
const SALTOS = [
  { label: 'Mañana', dias: 1 },
  { label: 'En 2 días', dias: 2 },
  { label: 'En una semana', dias: 7 },
]

export default function HojaOcurrencia({ open, oc, hoy, onClose, onEditar }) {
  const [modo, setModo] = useState(null) // null | 'mover' | 'hora'
  const [destino, setDestino] = useState(null)
  const [hora, setHora] = useState(null)

  useEffect(() => {
    if (!open) return
    setModo(null)
    setDestino(oc?.fecha ?? hoy)
    setHora(oc?.start ?? '09:00')
  }, [open, oc, hoy])

  if (!oc) return null

  const conCierre = (fn) => async (...args) => {
    await fn(...args)
    onClose()
  }

  const mover = conCierre((haciaDonde) =>
    moverOcurrencia(oc.block, oc.fechaOriginal, haciaDonde),
  )

  return (
    <Sheet open={open} onClose={onClose} title={oc.name}>
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-ink2">{rangoTexto(oc.start, oc.mins)}</p>
          <p className="text-xs text-muted first-letter:uppercase">{fechaLarga(oc.fecha)}</p>
          {oc.serie && <p className="text-xs text-muted">{textoRepeticion(oc.block)}</p>}
          {oc.movida && (
            <p className="text-xs text-muted">
              Movida desde el {fechaLarga(oc.fechaOriginal)}
            </p>
          )}
          {oc.note && <p className="pt-1 text-sm text-ink2">{oc.note}</p>}
        </div>

        {modo === null && (
          <div className="space-y-2">
            <Button
              onClick={conCierre(() => alternarBloque(oc.blockId, oc.fechaOriginal))}
              variant={oc.hecho ? 'ghost' : 'primary'}
              className="flex w-full items-center justify-center gap-2"
            >
              <Check size={16} />
              {oc.hecho ? 'Quitar la palomita' : 'Marcar como hecho'}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setModo('mover')}
              className="flex w-full items-center justify-center gap-2"
            >
              <MoveRight size={16} />
              Pásalo a otro día
            </Button>

            {oc.serie && (
              <Button
                variant="ghost"
                onClick={() => setModo('hora')}
                className="flex w-full items-center justify-center gap-2"
              >
                <Clock3 size={16} />
                Otra hora, solo este día
              </Button>
            )}

            {oc.serie && (
              <Button
                variant="ghost"
                onClick={conCierre(() => cancelarBloque(oc.blockId, oc.fechaOriginal))}
                className="flex w-full items-center justify-center gap-2"
              >
                <CalendarX2 size={16} />
                Este día no va
              </Button>
            )}

            {(oc.movida || oc.horaCambiada) && (
              <Button
                variant="ghost"
                onClick={conCierre(() => restaurarDia(oc.blockId, oc.fechaOriginal))}
                className="flex w-full items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Devolverlo a como estaba
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => {
                onClose()
                onEditar(oc.block)
              }}
              className="flex w-full items-center justify-center gap-2"
            >
              <Pencil size={16} />
              Editar {oc.serie ? 'toda la serie' : 'el bloque'}
            </Button>
          </div>
        )}

        {modo === 'mover' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {SALTOS.map((s) => (
                <Chip key={s.label} onClick={() => mover(addDays(oc.fecha, s.dias))}>
                  {s.label}
                </Chip>
              ))}
              {oc.fecha !== hoy && <Chip onClick={() => mover(today())}>Hoy</Chip>}
            </div>

            <Field label="O el día que quieras">
              <CampoFecha value={destino} onChange={setDestino} />
            </Field>

            <Button onClick={() => mover(destino)} disabled={!destino} className="w-full">
              Pasarlo ahí
            </Button>
            <Button variant="ghost" onClick={() => setModo(null)} className="w-full">
              Mejor no
            </Button>

            {oc.serie && (
              <p className="text-center text-xs text-muted">
                Solo se mueve este día. La repetición sigue igual.
              </p>
            )}
          </div>
        )}

        {modo === 'hora' && (
          <div className="space-y-3">
            <Field label="A qué hora, solo este día">
              <CampoHora value={hora} onChange={setHora} />
            </Field>
            <Button
              onClick={conCierre(() =>
                cambiarHoraDelDia(oc.blockId, oc.fechaOriginal, { start: hora, mins: oc.mins }),
              )}
              disabled={!hora}
              className="w-full"
            >
              Cambiar solo este día
            </Button>
            <Button variant="ghost" onClick={() => setModo(null)} className="w-full">
              Mejor no
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  )
}
