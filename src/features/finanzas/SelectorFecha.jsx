import { daysAgo, today } from '../../lib/format.js'
import { Chip, Input } from '../../components/ui.jsx'

/**
 * El caso normal (registrar hoy) sigue siendo cero toques: viene puesto por
 * defecto. "Ayer" es un toque. Cualquier otra fecha abre el calendario.
 */
export default function SelectorFecha({ value, onChange }) {
  const hoy = today()
  const ayer = daysAgo(1)
  const otra = value !== hoy && value !== ayer

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Chip active={value === hoy} onClick={() => onChange(hoy)} className="flex-1">
          Hoy
        </Chip>
        <Chip active={value === ayer} onClick={() => onChange(ayer)} className="flex-1">
          Ayer
        </Chip>
        <Chip active={otra} onClick={() => onChange(daysAgo(2))} className="flex-1">
          Otra fecha
        </Chip>
      </div>

      {otra && (
        <Input type="date" value={value} max={hoy} onChange={(e) => onChange(e.target.value || hoy)} />
      )}
    </div>
  )
}
