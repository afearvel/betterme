import { useMemo, useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { crearEjemploAgenda, db } from '../db/db.js'
import { today } from '../lib/format.js'
import { esHoy, intencionesDelDia, ocurrenciasDelDia, resumenDia } from '../lib/agenda.js'
import { Button, Card, Section } from '../components/ui.jsx'
import SelectorDia from '../features/agenda/SelectorDia.jsx'
import Intenciones from '../features/agenda/Intenciones.jsx'
import LoQueSigue from '../features/agenda/LoQueSigue.jsx'
import LineaDelDia from '../features/agenda/LineaDelDia.jsx'
import EditorBloque from '../features/agenda/EditorBloque.jsx'
import HojaOcurrencia from '../features/agenda/HojaOcurrencia.jsx'

/**
 * Agenda: lo que tiene HORA FIJA, se repita o no.
 *
 * Dónde va cada cosa, para no dudar después:
 *   · Tiene hora fija (un evento, una clase, algo a las 2)  → aquí
 *   · Se repite pero sin hora ("¿lo hice hoy?")             → Hábitos
 *   · Se hace una vez y no tiene día                        → Pendientes
 *
 * La pantalla son dos mitades que no se estorban: arriba las hasta tres
 * intenciones del día, que NO tienen hora, y abajo la línea de tiempo. Si el
 * día se desordena y los horarios se caen, la mitad de arriba sigue en pie.
 */
export default function Agenda() {
  const hoy = today()
  const [fecha, setFecha] = useState(hoy)

  // useLiveQuery vuelve a pintar solo cuando cambia la base. Nada que refrescar.
  // Se traen las tres tablas enteras porque aquí son chiquitas: una serie de
  // todo un semestre es UNA fila, no cuarenta.
  const blocks = useLiveQuery(() => db.blocks.toArray(), [], [])
  const overrides = useLiveQuery(() => db.blockDays.toArray(), [], [])
  const intentions = useLiveQuery(() => db.intentions.toArray(), [], [])

  const [editando, setEditando] = useState(null) // bloque, 'nuevo' o null
  const [abierta, setAbierta] = useState(null) // la ocurrencia de la hoja

  // Calcular las ocurrencias del día cuesta un poco; con useMemo solo se rehace
  // cuando de verdad cambió algo, no en cada pintada de la pantalla.
  const ocurrencias = useMemo(
    () => ocurrenciasDelDia(blocks, overrides, fecha),
    [blocks, overrides, fecha],
  )
  const intenciones = useMemo(
    () => intencionesDelDia(intentions, fecha),
    [intentions, fecha],
  )
  const resumen = useMemo(() => resumenDia(ocurrencias), [ocurrencias])

  const vacia = blocks.length === 0 && intentions.length === 0

  return (
    <div className="space-y-5">
      <SelectorDia
        fecha={fecha}
        hoy={hoy}
        onCambiar={setFecha}
        blocks={blocks}
        overrides={overrides}
      />

      {vacia ? (
        <Card className="space-y-3 text-center">
          <CalendarDays className="mx-auto text-muted" size={28} />
          <h2 className="font-semibold">Agenda</h2>
          <p className="text-sm text-muted">
            Aquí va lo que tiene <b className="text-ink2">hora fija</b>: un evento, una clase, algo
            a las 2. Lo que se repite pero <b className="text-ink2">sin hora</b> es un hábito, y lo
            que se hace una vez y no tiene día es un pendiente.
          </p>
          <p className="text-sm text-muted">
            Arriba caben hasta tres intenciones del día, sin hora. Abajo, los bloques. Un día que
            ya pasó no se pone en rojo ni lleva la cuenta de nada: solo se apaga.
          </p>
          <Button variant="ghost" onClick={crearEjemploAgenda} className="w-full">
            Crear un ejemplo para ver cómo funciona
          </Button>
          <p className="text-xs text-muted">Puedes borrarlo después sin dejar rastro.</p>
        </Card>
      ) : (
        <>
          <Intenciones
            intenciones={intenciones}
            fecha={fecha}
            esDeHoy={esHoy(fecha, hoy)}
            soloLectura={fecha < hoy}
          />

          {esHoy(fecha, hoy) && <LoQueSigue ocurrencias={ocurrencias} />}

          <Section
            title="El día"
            action={
              resumen.hechos > 0 ? (
                // El único número de la pantalla es lo que marcaste. NO existe
                // "te faltaron 3" ni un porcentaje de cumplimiento.
                <span className="text-xs text-muted">{resumen.hechos} marcados</span>
              ) : null
            }
          >
            <LineaDelDia
              ocurrencias={ocurrencias}
              fecha={fecha}
              hoy={hoy}
              onAbrir={setAbierta}
            />
          </Section>
        </>
      )}

      <Button
        onClick={() => setEditando('nuevo')}
        className="flex w-full items-center justify-center gap-2"
      >
        <Plus size={18} />
        Agregar un bloque
      </Button>

      <EditorBloque
        open={editando !== null}
        block={editando === 'nuevo' ? null : editando}
        fecha={fecha}
        onClose={() => setEditando(null)}
      />

      <HojaOcurrencia
        open={abierta !== null}
        oc={abierta}
        hoy={hoy}
        onClose={() => setAbierta(null)}
        onEditar={setEditando}
      />
    </div>
  )
}
