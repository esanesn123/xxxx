import { useState, useEffect } from 'react'
import { ref, set, get } from 'firebase/database'
import { db } from '../firebase'

export default function Updates() {
  const [url, setUrl] = useState('')
  const [version, setVersion] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    get(ref(db, 'update'))
      .then((snap) => {
        const d = snap.val()
        if (d) {
          if (d.link) setUrl(d.link)
          if (d.version) setVersion(String(d.version))
        }
      })
      .catch((err) => console.error('Failed to load update config:', err))
  }, [])

  function broadcastUpdate() {
    if (!url || !version) {
      alert('Please specify both Path and Version.')
      return
    }
    setBusy(true)
    Promise.all([
      set(ref(db, 'update/link'), url),
      set(ref(db, 'update/version'), parseInt(version)),
    ])
      .then(() => {
        setBusy(false)
        alert('UPDATE BROADCASTED TO ALL NODES.')
      })
      .catch((err) => {
        setBusy(false)
        alert('BROADCAST FAILED: ' + err.message)
      })
  }

  return (
    <div id="view-updates" className="view-panel">
      <div className="view-header">
        <h1>Deployment Center</h1>
      </div>
      <div className="glass-card" style={{ maxWidth: '600px' }}>
        <div className="input-group">
          <label>Build CDN Path</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://cloud.shax.io/stable/x64_engine.exe"
          />
        </div>
        <div className="input-group">
          <label>Broadcast Build Version</label>
          <input
            type="number"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="520"
          />
        </div>
        <p className="warning-text">
          Warning: Broadcast triggers immediate update prompts for all connected
          clients with a lower version number.
        </p>
        <button className="btn-primary" onClick={broadcastUpdate} disabled={busy}>
          {busy ? 'Broadcasting...' : 'Authorize Global Update'}
        </button>
      </div>
    </div>
  )
}
