import { useMemo } from 'react'
import { addDays, today } from '../../lib/format.js'
import {
  duracionTexto, encimados, esPasado, finDeBloque, separarDia, textoHora,
} from '../../lib/agenda.js'
import { alternarBloque, moverOcurrencia } from '../../db/db.js'
import { Empty, Section } from '../../components/ui.jsx'
import { MarcaEncima, MarcaHora, MarcaMovida, MarcaSerie, Palomita } from './piezas.jsx'

/**
 * La línea del día: primero lo que tiene hora, después lo flexible.
 *
 * CÓMO SE VE EL PASADO (la decisión más importante del módulo)
 *
 * Un bloque de un día que ya pasó y que no marcaste se apaga y ya. No se pone
 * rojo, no dice "no cumpliste", no suma a ningún contador de fallas — ese
 * contador no existe en esta app. Lo único que aparece son dos salidas:
 * "Sí lo hice", por si lo hiciste y se te olvidó marcarlo, y "Pásalo a hoy",
 * por si sigue teniendo sentido hacerlo. El pasado es material de trabajo,
 * no un expediente en tu contra.
 */
export default function LineaDelDia({ ocurrencias, fecha, hoy, onAbrir }) {
  const { conHora, sinHora } = useMemo(() => separarDia(ocurrencias), [ocurrencias])
  const choques = useMemo(() => encimados(ocurrencias), [ocurrencias])
  const pasado = esPasado(fecha, hoy)

  if (ocurrencias.length === 0) {
    return <Empty>Este día está libre. Nada agendado.</Empty>
  }

  const fila = (oc) => (
    <FilaBloque
      key={oc.clave}
      oc={oc}
      fecha={fecha}
      pasado={pasado}
      choqueCon={choques.get(oc.clave)}
      onAbrir={() => onAbrir(oc)}
    />
  )

  return (
    <div className="space-y-6">
      {conHora.length > 0 && <ul className="space-y-2">{conHora.map(fila)}</ul>}

      {sinHora.length > 0 && (
        <Section title="Sin hora fija">
          <ul className="space-y-2">{sinHora.map(fila)}</ul>
        </Section>
      )}
    </div>
  )
}

function FilaBloque({ oc, fecha, pasado, choqueCon, onAbrir }) {
  // Lo del pasado sin marcar se ve apagado. Es la ÚNICA señal visual del
  // pasado: no hay color de alarma en ninguna parte de esta pantalla.
  const apagado = pasado && !oc.hecho

  return (
    <li
      className={`rounded-2xl border border-line bg-surface transition-opacity ${
        apagado ? 'opacity-55' : ''
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        <Palomita
          hecho={oc.hecho}
          onClick={() => alternarBloque(oc.blockId, oc.fechaOriginal)}
          etiqueta={oc.hecho ? `Desmarcar ${oc.name}` : `Marcar ${oc.name}`}
        />

        <button
          type="button"
          onClick={onAbrir}
          className="min-w-0 flex-1 text-left"
        >
          {oc.start && (
            <p className="tabular text-xs text-muted">
              {textoHora(oc.start)}
              {oc.mins > 0 && ` – ${textoHora(finDeBloque(oc.start, oc.mins))}`}
            </p>
          )}
          {!oc.start && oc.mins > 0 && (
            <p className="text-xs text-muted">{duracionTexto(oc.mins)}</p>
          )}

          <p
            className={`leading-tight font-semibold break-words ${
              oc.hecho ? 'text-muted line-through' : 'text-ink'
            }`}
          >
            {oc.name}
          </p>

          {oc.note && <p className="mt-0.5 text-xs break-words text-muted">{oc.note}</p>}

          {(oc.serie || oc.movida || oc.horaCambiada || choqueCon) && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {oc.serie && <MarcaSerie />}
              {oc.movida && <MarcaMovida />}
              {oc.horaCambiada && <MarcaHora />}
              {choqueCon && <MarcaEncima con={choqueCon.join(', ')} />}
            </div>
          )}
        </button>
      </div>

      {apagado && (
        <div className="flex gap-2 border-t border-line px-3 py-2">
          <button
            type="button"
            onClick={() => alternarBloque(oc.blockId, oc.fechaOriginal)}
            className="flex-1 rounded-lg bg-line/60 py-2 text-xs text-ink2 active:bg-line"
          >
            Sí lo hice
          </button>
          <button
            type="button"
            onClick={() => moverOcurrencia(oc.block, oc.fechaOriginal, today())}
            className="flex-1 rounded-lg bg-line/60 py-2 text-xs text-ink2 active:bg-line"
          >
            Pásalo a hoy
          </button>
        </div>
      )}
    </li>
  )
}

/** Los atajos de "pásalo a…" que ofrece la hoja. Se suman al día que ves. */
export const SALTOS = [
  { id: 'manana', label: 'Mañana', dias: 1 },
  { id: 'pasado', label: 'En 2 días', dias: 2 },
  { id: 'semana', label: 'En una semana', dias: 7 },
]

export const fechaSalto = (fecha, dias) => addDays(fecha, dias)
