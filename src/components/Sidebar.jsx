import { useAuth } from '../context/AuthContext'

export default function Sidebar({ activeView, onSwitch }) {
  const { session } = useAuth()

  const items = [
    { id: 'licenses', label: 'Keys & Assets' },
    { id: 'updates', label: 'Update Delivery' },
    { id: 'logs', label: 'Audit Stream' },
  ]

  return (
    <div className="sidebar">
      <div className="logo-main" style={{ fontSize: '24px', marginBottom: '40px' }}>
        SHAX
      </div>

      {items.map((item) => (
        <button
          key={item.id}
          className={'nav-item ' + (activeView === item.id ? 'active' : '')}
          onClick={() => onSwitch(item.id)}
        >
          <span>{item.label}</span>
        </button>
      ))}

      <div
        style={{
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="user-badge">
          OPERATOR: {session?.id?.toUpperCase() || 'UNREGISTERED'}
        </div>
        <button
          className="nav-item"
          onClick={() => {
            localStorage.removeItem('shax_session')
            window.location.reload()
          }}
          style={{
            color: 'var(--danger)',
            fontSize: '12px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(239, 68, 68, 0.05)',
          }}
        >
          <span>Terminate Link</span>
        </button>
      </div>
    </div>
  )
}
