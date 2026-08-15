/**
 * La barra que enseña cómo está repartido tu dinero: un pedazo por cada meta
 * con dinero apartado y, al final, el que sigue libre.
 *
 * Los pedazos van separados 2px para que se distingan aunque dos queden del
 * mismo tamaño, y ninguno baja de 3px de ancho: una meta con $200 de $60,000
 * es una rayita, pero una rayita que sí se ve.
 */

const TONOS = ['bg-meta-1', 'bg-meta-2', 'bg-meta-3', 'bg-meta-4', 'bg-meta-5']

/** El tono que le toca a la meta número i. De la sexta en adelante, el último. */
export const tonoDeMeta = (i) => TONOS[Math.min(i, TONOS.length - 1)]

export default function BarraReparto({ partes = [], alto = 'h-3' }) {
  if (partes.length === 0) {
    return <div className={`w-full rounded-full bg-line ${alto}`} />
  }

  let iMeta = -1
  return (
    <div className={`flex w-full gap-0.5 overflow-hidden rounded-full bg-line ${alto}`}>
      {partes.map((p) => {
        if (p.tipo === 'meta') iMeta++
        return (
          <div
            key={p.id}
            className={`h-full ${p.tipo === 'libre' ? 'bg-libre' : tonoDeMeta(iMeta)}`}
            style={{ width: `${p.pct * 100}%`, minWidth: '3px' }}
            title={p.name}
          />
        )
      })}
    </div>
  )
}

/** El cuadrito de color que acompaña a cada renglón de la lista. */
export function Punto({ className = '' }) {
  return <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-sm ${className}`} />
}
