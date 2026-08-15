import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import BottomNav from './components/BottomNav.jsx'
import Finanzas from './screens/Finanzas.jsx'
import Historial from './screens/Historial.jsx'
import Habitos from './screens/Habitos.jsx'
import Pendientes from './screens/Pendientes.jsx'
import Agenda from './screens/Agenda.jsx'
import Ajustes from './screens/Ajustes.jsx'

const titulos = {
  '/finanzas': 'Dinero',
  '/historial': 'Historial',
  '/habitos': 'Hábitos',
  '/pendientes': 'Pendientes',
  '/agenda': 'Agenda',
  '/ajustes': 'Ajustes',
}

export default function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-plane">
      <header
        className="sticky top-0 z-30 border-b border-line bg-plane/90 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">{titulos[pathname] ?? 'BetterMe'}</h1>
          <button
            type="button"
            onClick={() => navigate('/ajustes')}
            className="rounded-full p-2 text-muted active:bg-line"
            aria-label="Ajustes"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4 pb-28">
        <Routes>
          <Route path="/" element={<Navigate to="/finanzas" replace />} />
          <Route path="/finanzas" element={<Finanzas />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/habitos" element={<Habitos />} />
          <Route path="/pendientes" element={<Pendientes />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/ajustes" element={<Ajustes />} />
          <Route path="*" element={<Navigate to="/finanzas" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  )
}
