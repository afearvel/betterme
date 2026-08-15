import { Check, Repeat, MoveRight, Clock3, Layers } from 'lucide-react'

/**
 * Piezas chiquitas que usan varias partes de la Agenda. Nada de lógica aquí:
 * las cuentas viven en src/lib/agenda.js.
 */

/**
 * El círculo de palomear. Es el objetivo de toque más importante de la
 * pantalla, así que mide 44 px: es el mínimo que Apple recomienda para que un
 * pulgar le atine sin pelearse.
 */
export function Palomita({ hecho, onClick, etiqueta }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={hecho}
      aria-label={etiqueta}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
        hecho ? 'border-good bg-good/20 text-good' : 'border-line bg-plane text-muted active:bg-line'
      }`}
    >
      <Check size={20} strokeWidth={hecho ? 3 : 2} />
    </button>
  )
}

/** Etiqueta chiquita gris. Nunca es roja: aquí no hay estados de alarma. */
export function Marca({ Icono, children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-line/60 px-2 py-0.5 text-[11px] text-muted">
      {Icono && <Icono size={11} />}
      {children}
    </span>
  )
}

export const MarcaSerie = () => <Marca Icono={Repeat}>Se repite</Marca>
export const MarcaMovida = () => <Marca Icono={MoveRight}>Movida aquí</Marca>
export const MarcaHora = () => <Marca Icono={Clock3}>Hora de este día</Marca>
export const MarcaEncima = ({ con }) => <Marca Icono={Layers}>Se encima con {con}</Marca>

/**
 * Campo de hora. Uso el selector del propio navegador a propósito: en el iPhone
 * abre la ruedita nativa, que es mucho más cómoda con el pulgar que escribir.
 *
 * Rareza útil del navegador: aunque el iPhone TE MUESTRE la hora en formato de
 * 12 horas (2:30 pm), el valor que entrega siempre es 'HH:MM' de 24 horas con
 * cero adelante ('14:30'). O sea, exactamente el formato en el que guardamos.
 * No hay que convertir nada.
 */
export function CampoHora({ value, onChange, ...props }) {
  return (
    <input
      type="time"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full rounded-xl border border-line bg-plane px-3 py-3 text-ink outline-none focus:border-brand"
      {...props}
    />
  )
}

/** Campo de fecha. Mismo caso: el navegador entrega 'AAAA-MM-DD' tal cual. */
export function CampoFecha({ value, onChange, ...props }) {
  return (
    <input
      type="date"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full rounded-xl border border-line bg-plane px-3 py-3 text-ink outline-none focus:border-brand"
      {...props}
    />
  )
}
