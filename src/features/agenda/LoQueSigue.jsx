import { useEffect, useState } from 'react'
import { horaAhora, loQueSigue, minutosPara, rangoTexto, textoFalta } from '../../lib/agenda.js'
import { Card } from '../../components/ui.jsx'

/**
 * La tarjeta de "ahora mismo". Solo sale cuando estás viendo el día de hoy.
 *
 * ESTO SUSTITUYE A LAS NOTIFICACIONES, Y ES A PROPÓSITO. Una app web guardada
 * en la pantalla de inicio del iPhone no puede avisarte de forma confiable:
 * las notificaciones web en iOS solo existen si está instalada y además
 * necesitarían un servidor de push prendido todo el día, que cuesta dinero.
 * Prometer una alarma que a veces no suena es peor que no prometer nada.
 *
 * Lo que sí se puede: que cuando abras la app, lo primero que veas sea lo que
 * está pasando y lo que viene. Y si de verdad quieres que suene una alarma,
 * cada bloque se puede mandar al Calendario del iPhone, que sí sabe hacerlo.
 */
export default function LoQueSigue({ ocurrencias }) {
  const [ahora, setAhora] = useState(() => horaAhora())

  // El reloj se revisa cada 30 segundos. No es una cuenta regresiva al
  // segundo: eso solo gastaría batería para que veas un número nervioso.
  useEffect(() => {
    const t = setInterval(() => setAhora(horaAhora()), 30000)
    return () => clearInterval(t)
  }, [])

  const { enCurso, siguiente } = loQueSigue(ocurrencias, ahora)

  if (!enCurso && !siguiente) {
    const hubo = ocurrencias.length > 0
    return (
      <Card>
        <p className="text-sm text-muted">
          {hubo ? 'No queda nada con hora por delante.' : 'Hoy no tienes nada con hora.'}
        </p>
      </Card>
    )
  }

  return (
    <Card className="space-y-3">
      {enCurso && (
        <div>
          <p className="text-xs tracking-wide text-brand uppercase">Ahora</p>
          <p className="text-lg leading-tight font-semibold">{enCurso.name}</p>
          <p className="text-sm text-muted">{rangoTexto(enCurso.start, enCurso.mins)}</p>
        </div>
      )}

      {siguiente && (
        <div className={enCurso ? 'border-t border-line pt-3' : ''}>
          <p className="text-xs tracking-wide text-muted uppercase">
            {enCurso ? 'Después' : 'Lo que sigue'}
          </p>
          <p className="leading-tight font-semibold">{siguiente.name}</p>
          <p className="text-sm text-muted">
            {rangoTexto(siguiente.start, siguiente.mins)} ·{' '}
            {textoFalta(minutosPara(siguiente, ahora))}
          </p>
        </div>
      )}
    </Card>
  )
}
