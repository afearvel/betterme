import { Check, Flame, Moon } from 'lucide-react'

/**
 * Piezas chiquitas que se repiten en todo el módulo de hábitos.
 * Si algo se usa en dos archivos, vive aquí.
 */

/** Los últimos 7 días como puntitos. Lleno = cumplido, hueco = tocaba y no. */
export function Tira({ dias = [] }) {
  return (
    <div className="flex gap-1">
      {dias.map((d) => (
        <span
          key={d.date}
          title={d.date}
          className={`h-2 w-2 rounded-full ${
            !d.toca ? 'bg-line/50' : d.hecho ? 'bg-good' : 'border border-line bg-transparent'
          }`}
        />
      ))}
    </div>
  )
}

/** La racha. Sin números rojos: si vas en 0, simplemente no se enciende. */
export function Racha({ dias = 0, mejor = 0 }) {
  const viva = dias > 0
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${viva ? 'text-warn' : 'text-muted'}`}>
      <Flame size={13} strokeWidth={viva ? 2.4 : 1.6} />
      <span className="tabular font-semibold">{dias}</span>
      {mejor > dias && <span className="text-muted">· mejor {mejor}</span>}
    </span>
  )
}

/** El botón redondo de palomear. Es el que más vas a tocar: se hizo grande. */
export function Palomita({ hecho, onClick, label, size = 'md' }) {
  const medidas = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={hecho}
      className={`${medidas} flex shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        hecho
          ? 'border-good bg-good text-white'
          : 'border-line bg-transparent text-transparent active:border-brand'
      }`}
    >
      <Check size={size === 'lg' ? 24 : 20} strokeWidth={3} />
    </button>
  )
}

/** Etiqueta de "día de descanso". */
export function Descanso({ children = 'Descanso' }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-line/60 px-2 py-1 text-xs text-ink2">
      <Moon size={12} /> {children}
    </span>
  )
}

/** Porcentaje de cumplimiento en texto corto. */
export function Cumplimiento({ datos }) {
  if (!datos || datos.tocaron === 0) return null
  return (
    <span className="tabular text-xs text-muted">
      {Math.round(datos.pct * 100)}% · {datos.hechos}/{datos.tocaron} en 30 días
    </span>
  )
}
