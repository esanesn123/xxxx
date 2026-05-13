import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'

export default function Logs() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const unsub = onValue(ref(db, 'bot_logs'), (snap) => {
      const data = snap.val()
      if (!data) {
        setLogs([])
        return
      }
      const arr = Object.values(data)
      arr.reverse()
      setLogs(arr.slice(0, 50))
    })
    return () => unsub()
  }, [])

  return (
    <div id="view-logs" className="view-panel">
      <div className="view-header">
        <h1>Audit Stream</h1>
      </div>
      <div className="glass-card">
        <table>
          <thead>
            <tr>
              <th>Origin</th>
              <th>Descriptor</th>
              <th>Cycle</th>
              <th>Temporal Marker</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                  No audit records available.
                </td>
              </tr>
            )}
            {logs.map((log, i) => (
              <tr key={i} className="fade-in">
                <td style={{ fontWeight: 700 }}>{log.operator?.toUpperCase()}</td>
                <td style={{ fontFamily: 'monospace', color: 'var(--secondary)' }}>
                  {log.payload}
                </td>
                <td>{log.duration}d</td>
                <td style={{ color: 'var(--text-dim)', fontSize: '11px' }}>
                  {log.temporal ? new Date(log.temporal).toLocaleString() : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
