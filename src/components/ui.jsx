import { X } from 'lucide-react'
import { useEffect } from 'react'

/** Tarjeta base. Todo lo que se agrupa visualmente usa esto. */
export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function Section({ title, action, children }) {
  return (
    <section className="space-y-2">
      {(title || action) && (
        <div className="flex items-end justify-between px-1">
          <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

const variantes = {
  primary: 'bg-brand text-white active:bg-brand/80',
  ghost: 'bg-line/60 text-ink2 active:bg-line',
  danger: 'bg-crit/15 text-crit active:bg-crit/25',
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`rounded-xl px-4 py-3 font-semibold transition-colors disabled:opacity-40 ${variantes[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/** Chip seleccionable (sobres, tipo de movimiento…). */
export function Chip({ active, className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`shrink-0 rounded-full border px-3 py-2 text-sm transition-colors ${
        active
          ? 'border-brand bg-brand/15 font-semibold text-ink'
          : 'border-line bg-surface text-ink2'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-ink2">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-line bg-plane px-3 py-3 text-ink outline-none focus:border-brand ${className}`}
      {...props}
    />
  )
}

/** Barra de progreso. `tone` cambia el color cuando algo se pasa del límite. */
export function Bar({ value, tone = 'brand' }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const color = { brand: 'bg-brand', warn: 'bg-warn', crit: 'bg-crit', good: 'bg-good' }[tone]
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Hoja que sube desde abajo. Es el patrón cómodo para el pulgar en iPhone. */
export function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-line bg-surface p-5"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-muted">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Interruptor de encendido/apagado. */
export function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-ink">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand' : 'bg-line'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

/** Mensaje para cuando todavía no hay datos. */
export function Empty({ children }) {
  return (
    <Card className="text-center text-sm text-muted">
      {children}
    </Card>
  )
}
