import { useMemo } from 'react'
import { Repeat } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { crearEjemploHabitos, db } from '../db/db.js'
import { today } from '../lib/format.js'
import { mapaDeMarcas, rachaDeDiasCompletos, resumenDelDia } from '../lib/habits.js'
import { Button, Card, Section } from '../components/ui.jsx'
import HoyResumen from '../features/habitos/HoyResumen.jsx'
import Ciclos from '../features/habitos/Ciclos.jsx'
import ListaHabitos from '../features/habitos/ListaHabitos.jsx'
import HistorialHabitos from '../features/habitos/HistorialHabitos.jsx'

export default function Habitos() {
  const hoy = today()

  // useLiveQuery vuelve a pintar solo cuando cambia la base. Nada que refrescar.
  const habits = useLiveQuery(() => db.habits.orderBy('order').toArray(), [], [])
  const cycles = useLiveQuery(() => db.cycles.orderBy('order').toArray(), [], [])
  const routines = useLiveQuery(() => db.routines.orderBy('order').toArray(), [], [])
  const checks = useLiveQuery(() => db.checks.toArray(), [], [])

  // El Map se rearma solo cuando cambian las palomitas, no en cada pintada.
  const mapa = useMemo(() => mapaDeMarcas(checks), [checks])

  const activos = habits.filter((h) => h.active !== 0)
  const resumen = resumenDelDia({ habits: activos, cycles, routines, mapa, iso: hoy })
  const rachaCompletos = rachaDeDiasCompletos({ habits: activos, cycles, routines, mapa, hoy })

  if (habits.length === 0 && cycles.length === 0) {
    return (
      <Card className="space-y-4 text-center">
        <Repeat className="mx-auto text-muted" size={28} />
        <h2 className="font-semibold">Hábitos y ciclos</h2>
        <p className="text-sm text-muted">
          Un <b className="text-ink2">hábito</b> se repite con su propia frecuencia. Un{' '}
          <b className="text-ink2">ciclo</b> son varias rutinas que se turnan día con día y avanzan
          con el calendario: si te saltas una, mañana toca la siguiente igual.
        </p>
        <Button onClick={crearEjemploHabitos} className="w-full">
          Crear un ejemplo para ver cómo funciona
        </Button>
        <p className="text-xs text-muted">Puedes borrarlo después sin dejar rastro.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <HoyResumen iso={hoy} resumen={resumen} rachaCompletos={rachaCompletos} />

      <Section title="Ciclos">
        <Ciclos cycles={cycles} routines={routines} mapa={mapa} hoy={hoy} />
      </Section>

      <Section title="Hábitos">
        <ListaHabitos habits={habits} mapa={mapa} hoy={hoy} />
      </Section>

      <Section title="Historial">
        <HistorialHabitos habits={activos} cycles={cycles} routines={routines} mapa={mapa} />
      </Section>
    </div>
  )
}
