import { useEffect, useRef, useState } from 'react'
import { Download, TriangleAlert, Upload } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, exportBackup, getSettings, importBackup, saveSettings } from '../db/db.js'
import { money } from '../lib/format.js'
import { resumenDiario } from '../lib/finance.js'
import { revisarSaldoInicial } from '../lib/patrimonio.js'
import { Button, Card, Field, Input, Section, Toggle } from '../components/ui.jsx'

export default function Ajustes() {
  const settings = useLiveQuery(() => getSettings(), [], null)
  const envelopes = useLiveQuery(() => db.envelopes.toArray(), [], [])
  const transactions = useLiveQuery(() => db.transactions.toArray(), [], [])
  const goals = useLiveQuery(() => db.goals.toArray(), [], [])

  const [ingreso, setIngreso] = useState('')
  const [ahorro, setAhorro] = useState('')
  const [inicial, setInicial] = useState('')
  const [aviso, setAviso] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    if (!settings) return
    setIngreso(String(settings.monthlyIncome || ''))
    setAhorro(String(settings.monthlySavings || ''))
    setInicial(String(settings.initialBalance || ''))
  }, [settings])

  const r = resumenDiario({ settings, envelopes, transactions })

  // Cómo quedaría el patrimonio con el saldo que estás escribiendo, ANTES de
  // guardarlo. Bajarlo de más puede dejarte con más dinero apartado en metas
  // del que tienes; más vale avisar que dejarte ver un número rojo sin
  // explicación.
  const previa = revisarSaldoInicial({ nuevo: Number(inicial) || 0, transactions, goals })

  async function guardarInicial() {
    await saveSettings({ initialBalance: Number(inicial) || 0 })
    setAviso('Saldo inicial guardado.')
    setTimeout(() => setAviso(''), 1500)
  }

  async function guardar() {
    await saveSettings({
      monthlyIncome: Number(ingreso) || 0,
      monthlySavings: Number(ahorro) || 0,
    })
    setAviso('Guardado.')
    setTimeout(() => setAviso(''), 1500)
  }

  async function alImportar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importBackup(file)
      setAviso('Respaldo restaurado.')
    } catch (err) {
      setAviso(err.message)
    }
    e.target.value = ''
    setTimeout(() => setAviso(''), 3000)
  }

  return (
    <div className="space-y-6">
      <Section title="Tu punto de partida">
        <Card className="space-y-4">
          <Field
            label="Dinero que ya tenías"
            hint="Lo que había en tu cuenta y tu cartera el día que empezaste a usar la app. A partir de ahí, los ingresos suman y los gastos restan."
          >
            <Input
              value={inicial}
              onChange={(e) => setInicial(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              placeholder="0"
            />
          </Field>

          <div className="space-y-1 border-t border-line pt-3 text-sm text-ink2">
            <Linea etiqueta="Saldo inicial" valor={money(Number(inicial) || 0)} />
            <Linea etiqueta="= Tu dinero quedaría en" valor={money(previa.total)} fuerte />
            <Linea etiqueta="Apartado en metas" valor={money(previa.apartado)} />
            <Linea etiqueta="Libre" valor={money(previa.libre)} />
          </div>

          {previa.rompe && (
            <p className="flex items-start gap-2 rounded-xl bg-crit/10 p-3 text-xs text-crit">
              <TriangleAlert size={16} className="mt-px shrink-0" />
              <span>
                Con ese saldo tendrías {money(previa.apartado)} apartado en metas y solo{' '}
                {money(previa.total)} en total. Puedes guardarlo igual, pero vas a tener que retirar{' '}
                {money(previa.faltante)} de alguna meta para que cuadre.
              </span>
            </p>
          )}

          <Button onClick={guardarInicial} className="w-full">
            Guardar saldo inicial
          </Button>

          <p className="text-xs text-muted">
            Este número no es un ingreso: no aparece en tus movimientos ni en la gráfica del mes.
            Es nada más el punto donde arranca la cuenta.
          </p>
        </Card>
      </Section>

      <Section title="Tu dinero al mes">
        <Card className="space-y-4">
          <Field label="Ingreso mensual" hint="Aproximado. Pesos enteros.">
            <Input
              value={ingreso}
              onChange={(e) => setIngreso(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              placeholder="0"
            />
          </Field>
          <Field label="Ahorro mensual" hint="Lo que apartas antes de gastar.">
            <Input
              value={ahorro}
              onChange={(e) => setAhorro(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              placeholder="0"
            />
          </Field>
          <Button onClick={guardar} className="w-full">
            Guardar
          </Button>

          <div className="border-t border-line pt-4">
            <Toggle
              checked={Boolean(settings?.useRealIncome)}
              onChange={(v) => saveSettings({ useRealIncome: v })}
              label="Usar mis ingresos reales"
              hint="Si tu ingreso varía, la app calcula con los ingresos que registres ese mes en vez del estimado de arriba. Mientras no registres ninguno, usa el estimado."
            />
          </div>

          <div className="space-y-1 border-t border-line pt-3 text-sm text-ink2">
            <Linea
              etiqueta={r.usandoReal ? 'Ingreso registrado este mes' : 'Ingreso estimado'}
              valor={money(r.ingreso)}
            />
            <Linea etiqueta="− Sobres comprometidos" valor={money(r.comprometido)} />
            <Linea etiqueta="− Ahorro" valor={money(r.ahorro)} />
            <Linea etiqueta="= Libre al mes" valor={money(r.libreDelMes)} fuerte />
            <Linea etiqueta={`÷ ${r.diasDelMes} días`} valor={`${money(r.diario)} al día`} fuerte />
          </div>
        </Card>
      </Section>

      <Section title="Respaldo">
        <Card className="space-y-3">
          <p className="text-sm text-muted">
            Tus datos viven solo en este teléfono. Si borras el historial de Safari o cambias de
            equipo, se van. Exporta de vez en cuando y guarda el archivo en Archivos o iCloud.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={exportBackup} className="flex flex-1 items-center justify-center gap-2">
              <Download size={18} /> Exportar
            </Button>
            <Button
              variant="ghost"
              onClick={() => fileRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2"
            >
              <Upload size={18} /> Importar
            </Button>
          </div>
          <input ref={fileRef} type="file" accept="application/json" onChange={alImportar} className="hidden" />
        </Card>
      </Section>

      {aviso && <p className="text-center text-sm text-good">{aviso}</p>}

      <p className="pb-4 text-center text-xs text-muted">BetterMe · v0.1</p>
    </div>
  )
}

function Linea({ etiqueta, valor, fuerte }) {
  return (
    <div className="flex justify-between">
      <span className={fuerte ? 'font-semibold text-ink' : ''}>{etiqueta}</span>
      <span className={`tabular ${fuerte ? 'font-semibold text-ink' : ''}`}>{valor}</span>
    </div>
  )
}
