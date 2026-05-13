import { useState } from 'react'
import { ref, get, set, remove } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

const IDENTITY_VALVES = {
  prime: { code: '1', role: 'owner' },
  aybee: { code: '1', role: 'staff' },
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setSession } = useAuth()

  async function attemptLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const u = username.toLowerCase().trim()
    const p = password.trim()

    await new Promise((r) => setTimeout(r, 600))

    const identity = IDENTITY_VALVES[u]
    if (!identity || identity.code !== p) {
      setError('AUTHENTICATION CLASH: INVALID IDENTITY PROTOCOLS')
      setLoading(false)
      return
    }

    try {
      await remove(ref(db, 'admin_locks/' + u))
      setSession({ id: u, role: identity.role })
    } catch (err) {
      setError('SYSTEM ERROR: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card fade-in">
        <div className="logo-main">SHAX INFRA</div>
        <p className="login-subtitle">
          Secured Infrastructure Command Center (Core v5.2)
        </p>

        <form onSubmit={attemptLogin} id="login-form">
          <div className="input-group">
            <label>Internal ID</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Operator Profile..."
              autoComplete="off"
              required
            />
          </div>
          <div className="input-group">
            <label>Protocol Token</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Authorization Code..."
              autoComplete="off"
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            <span style={{ display: loading ? 'none' : 'inline' }}>
              Authenticate Session
            </span>
            {loading && <div className="loader" style={{ display: 'inline-block' }} />}
          </button>
        </form>

        {error && <div className="auth-error">{error}</div>}

        <p
          style={{
            marginTop: '30px',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.2)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Verified by Shax Security Protocols
        </p>
      </div>
    </div>
  )
}
