import { useAuth, AuthProvider } from './context/AuthContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function AppBody() {
  const { session } = useAuth()
  if (!session) return <Login />
  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <AppBody />
    </AuthProvider>
  )
}
