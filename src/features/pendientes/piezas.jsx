import { Check } from 'lucide-react'
import { diasEsperando, textoEspera } from '../../lib/todos.js'

/**
 * Piezas chiquitas que se repiten en el módulo de Pendientes.
 * Si algo se usa en dos archivos, vive aquí.
 */

/**
 * La casilla redonda de "ya está". Es el botón que más vas a tocar, así que se
 * hizo grande: 40 px de lado es lo mínimo cómodo para un pulgar en iPhone.
 */
export function Casilla({ hecho, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={hecho}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        hecho
          ? 'border-good bg-good text-white'
          : 'border-line bg-transparent text-transparent active:border-brand'
      }`}
    >
      <Check size={20} strokeWidth={3} />
    </button>
  )
}

/**
 * Cuánto lleva esperando. Es texto gris y nada más: no cambia de color ni se
 * pone rojo con el tiempo, porque el tiempo aquí no es una falta.
 */
export function Espera({ todo, hoy }) {
  // shrink-0 para que la nota de al lado sea la que se corte, no este texto.
  return (
    <span className="shrink-0 text-xs whitespace-nowrap text-muted">
      {textoEspera(diasEsperando(todo, hoy))}
    </span>
  )
}

const COLOR_PUNTO = {
  alta: 'bg-brand',
  normal: 'bg-muted',
  baja: 'bg-line',
}

/** Puntito de importancia. Va a la izquierda del nombre, discreto. */
export function PuntoImportancia({ importance = 'normal' }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-1.5 w-1.5 shrink-0 rounded-full ${COLOR_PUNTO[importance] ?? COLOR_PUNTO.normal}`}
    />
  )
}
