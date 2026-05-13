import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, update, remove } from 'firebase/database'
import { db } from '../firebase'
import Modal from './Modal'

export default function Licenses() {
  const [licenses, setLicenses] = useState([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const unsub = onValue(ref(db, 'licenses'), (snap) => {
      const data = snap.val()
      if (!data) { setLicenses([]); return }
      const arr = Object.entries(data).map(([key, val]) => ({ id: key, ...val }))
      setLicenses(arr.sort((a, b) => (b.created || 0) - (a.created || 0)))
    })
    return () => unsub()
  }, [])

  const activateLicense = useCallback((id) =>
    update(ref(db, 'licenses/' + id), { status: 'active' }).catch(e => alert(e.message)), [])

  const banLicense = useCallback((id) =>
    update(ref(db, 'licenses/' + id), { status: 'banned' }).catch(e => alert(e.message)), [])

  const deleteLicense = useCallback((id) => {
    if (confirm('Delete this license key?'))
      remove(ref(db, 'licenses/' + id)).catch(e => alert(e.message))
  }, [])

  const togglePayment = useCallback((id, current) => {
    const next = current === 'paid' ? 'unpaid' : 'paid'
    update(ref(db, 'licenses/' + id), { payment_status: next }).catch(e => alert(e.message))
  }, [])

  const resetHwid = useCallback((id) => {
    if (confirm('Reset HWID for this key?')) {
      update(ref(db, 'licenses/' + id), { hwid: 'null' }).catch(e => alert(e.message))
    }
  }, [])

  return (
    <div id="view-licenses" className="view-panel">
      <div className="view-header">
        <div>
          <h1>License Keys</h1>
          <p className="small-text" style={{ marginTop: '4px' }}>
            {licenses.length} key{licenses.length !== 1 ? 's' : ''} in registry
          </p>
        </div>
        <button
          id="btn-new-license"
          className="btn-primary"
          style={{ width: 'auto', padding: '12px 22px', marginTop: 0, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowModal(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Generate Keys
        </button>
      </div>

      <div className="glass-card">
        <table>
          <thead>
            <tr>
              <th>Key ID</th>
              <th>Status</th>
              <th>Payment</th>
              <th>HWID</th>
              <th>Days</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {licenses.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
                  No license keys yet. Click <strong style={{ color: 'var(--primary-light)' }}>+ Generate Keys</strong> to get started.
                </td>
              </tr>
            )}
            {licenses.map((d) => {
              const settlement = d.payment_status || 'unpaid'
              const days = d.days === 9999 ? 'Lifetime' : (d.days ? `${d.days}d` : 'N/A')
              const dateStr = d.created 
                ? new Date(d.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'

              return (
                <tr key={d.id} className="fade-in">
                  <td>
                    <div className="key-mono">{d.id}</div>
                    <div style={{ fontSize: '11px', marginTop: '3px', display: 'flex', gap: '8px' }}>
                      {d.origin && <span style={{ color: 'var(--text-muted)' }}>by {d.origin}</span>}
                      {d.note && <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>• {d.note}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={'badge bg-' + (d.status || 'active')}>{d.status || 'active'}</span>
                  </td>
                  <td>
                    <span className={'badge bg-' + settlement}>{settlement}</span>
                    <button
                      className="action-icon owner-only"
                      style={{ marginLeft: '6px' }}
                      onClick={() => togglePayment(d.id, settlement)}
                      title="Toggle Payment"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>
                    </button>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-dim)' }}>
                    {d.hwid === 'null' ? '—' : d.hwid}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600' }}>
                    {days}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    {dateStr}
                  </td>
                  <td>
                    <button className="action-icon" onClick={() => activateLicense(d.id)} title="Activate">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button className="action-icon" onClick={() => resetHwid(d.id)} title="Reset HWID">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    </button>
                    <button className="action-icon" onClick={() => banLicense(d.id)} title="Ban">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    </button>
                    <button
                      className="action-icon"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => deleteLicense(d.id)}
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  )
}
