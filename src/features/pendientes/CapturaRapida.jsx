import { useState } from 'react'
import { Plus } from 'lucide-react'
import { addTodo } from '../../db/db.js'
import { IMPORTANCIAS } from '../../lib/todos.js'
import { Card, Chip, Input } from '../../components/ui.jsx'

/**
 * Anotar tiene que costar un toque, o dejas de anotar. Por eso esta caja vive
 * siempre arriba de la pantalla, ya abierta, y no dentro de una hoja: escribes,
 * le das a la palomita del teclado y listo.
 *
 * Lo demás (nota, importancia, desde cuándo) se puede acomodar después tocando
 * la fila. Aquí solo pedimos el nombre.
 */
export default function CapturaRapida({ onDetalle }) {
  const [texto, setTexto] = useState('')
  const [importance, setImportance] = useState('normal')

  async function anotar() {
    const name = texto.trim()
    if (!name) return
    await addTodo({ name, importance })
    setTexto('')
    // La importancia NO se reinicia: si vas anotando varias cosas del mismo
    // nivel, no tienes que volver a elegirlo cada vez.
  }

  return (
    <Card className="space-y-3">
      {/* Un <form> de verdad para que el teclado del iPhone muestre "ir" y
          enviar con esa tecla funcione sin escuchar eventos a mano. */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          anotar()
        }}
        className="flex gap-2"
      >
        <Input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="¿Qué hay que hacer?"
          aria-label="Nuevo pendiente"
          enterKeyHint="done"
        />
        <button
          type="submit"
          disabled={!texto.trim()}
          aria-label="Anotar pendiente"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-colors active:bg-brand/80 disabled:opacity-40"
        >
          <Plus size={22} />
        </button>
      </form>

      <div className="flex gap-2">
        {IMPORTANCIAS.map((i) => (
          <Chip
            key={i.id}
            active={importance === i.id}
            onClick={() => setImportance(i.id)}
            className="flex-1"
          >
            {i.label}
          </Chip>
        ))}
      </div>

      <button
        type="button"
        onClick={onDetalle}
        className="w-full text-center text-xs text-muted active:text-ink2"
      >
        Anotar con nota y fecha
      </button>
    </Card>
  )
}
