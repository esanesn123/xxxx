import { useState, useRef } from 'react'
import { ref, set, push } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

const PRESET_DAYS = [
  { label: '1 Day', value: '1' },
  { label: '7 Days', value: '7' },
  { label: '30 Days', value: '30' },
  { label: '90 Days', value: '90' },
  { label: '365 Days', value: '365' },
  { label: 'Lifetime', value: '9999' },
]

function generateKey() {
  const seg = () => Math.random().toString(36).substring(2, 7).toUpperCase()
  return `SHAX-${seg()}-${seg()}-${seg()}`
}

export default function Modal({ onClose }) {
  const [days, setDays] = useState('30')
  const [customDays, setCustomDays] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [generatedKeys, setGeneratedKeys] = useState([])
  const [copiedKey, setCopiedKey] = useState(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const { session } = useAuth()

  const effectiveDays = useCustom ? parseInt(customDays) || 1 : parseInt(days)

  async function handleGenerate() {
    const cycles = effectiveDays
    const qty = parseInt(quantity)
    if (!cycles || cycles < 1 || !qty || qty < 1 || qty > 100) return

    setSaving(true)
    const horizon = Math.floor(Date.now() / 1000) + cycles * 86400
    const newKeys = []

    try {
      for (let i = 0; i < qty; i++) {
        const id = generateKey()
        await set(ref(db, 'licenses/' + id), {
          status: 'active',
          expiry: horizon,
          hwid: 'null',
          created: Math.floor(Date.now() / 1000),
          payment_status: 'unpaid',
          origin: session.id,
          days: cycles,
          note: note.trim() || '',
        })
        await push(ref(db, 'bot_logs'), {
          operator: session.id,
          payload: id,
          duration: cycles,
          temporal: Date.now(),
        })
        newKeys.push(id)
      }
      setGeneratedKeys(newKeys)
    } catch (err) {
      alert('Generation failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  function copyKey(key) {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1800)
    })
  }

  function copyAll() {
    navigator.clipboard.writeText(generatedKeys.join('\n')).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1800)
    })
  }

  function reset() {
    setGeneratedKeys([])
    setCopiedAll(false)
    setCopiedKey(null)
  }

  return (
    <div className="modal-wrap" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-body fade-in">

        {generatedKeys.length > 0 ? (
          /* ── RESULTS SCREEN ── */
          <div className="modal-results">
            <div className="modal-results-header">
              <div className="modal-results-icon">✓</div>
              <h2 className="modal-title">Keys Generated</h2>
              <p className="modal-subtitle">
                {generatedKeys.length} license key{generatedKeys.length > 1 ? 's' : ''} · {effectiveDays === 9999 ? 'Lifetime' : `${effectiveDays} day${effectiveDays > 1 ? 's' : ''}`}
                {note && <span style={{ display: 'block', color: 'var(--primary-light)', marginTop: '4px' }}>Note: {note}</span>}
              </p>
            </div>

            <div className="keys-list">
              {generatedKeys.map((key) => (
                <div key={key} className={`key-row ${copiedKey === key ? 'key-row--copied' : ''}`}>
                  <code className="key-code">{key}</code>
                  <button
                    className={`key-copy-btn ${copiedKey === key ? 'copied' : ''}`}
                    onClick={() => copyKey(key)}
                  >
                    {copiedKey === key ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    )}
                    {copiedKey === key ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={copyAll}>
                {copiedAll ? '✓ All Copied!' : `Copy All ${generatedKeys.length} Keys`}
              </button>
              <button className="btn-ghost" onClick={reset}>Generate More</button>
              <button className="btn-ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          /* ── GENERATOR FORM ── */
          <>
            <div className="modal-header-row">
              <div>
                <h2 className="modal-title">Generate Keys</h2>
                <p className="modal-subtitle">Configure and mint new license keys</p>
              </div>
              <button className="modal-close-x" onClick={onClose} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Duration */}
            <div className="form-section">
              <label className="form-label">Duration</label>
              <div className="preset-pills">
                {PRESET_DAYS.map((p) => (
                  <button
                    key={p.value}
                    className={`pill ${!useCustom && days === p.value ? 'pill--active' : ''}`}
                    onClick={() => { setDays(p.value); setUseCustom(false) }}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  className={`pill ${useCustom ? 'pill--active' : ''}`}
                  onClick={() => setUseCustom(true)}
                >
                  Custom
                </button>
              </div>

              {useCustom && (
                <div className="custom-days-row">
                  <input
                    id="custom-days-input"
                    type="number"
                    min="1"
                    max="9999"
                    placeholder="Enter days e.g. 14"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="days-input"
                    autoFocus
                  />
                  <span className="days-label">days</span>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="form-section">
              <label className="form-label" htmlFor="quantity-input">
                Quantity <span className="form-label-dim">(1 – 100)</span>
              </label>
              <div className="qty-row">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input
                  id="quantity-input"
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="qty-input"
                />
                <button className="qty-btn" onClick={() => setQuantity(Math.min(100, quantity + 1))}>+</button>
              </div>
            </div>

            {/* Note */}
            <div className="form-section">
              <label className="form-label" htmlFor="note-input">
                Note <span className="form-label-dim">(Optional)</span>
              </label>
              <input
                id="note-input"
                type="text"
                placeholder="e.g. For YouTube Sponsor"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ 
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: 'white',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Summary */}
            <div className="gen-summary">
              <span className="gen-summary-label">Will generate</span>
              <span className="gen-summary-val">
                {quantity} key{quantity > 1 ? 's' : ''} ·{' '}
                {useCustom
                  ? customDays ? `${customDays} days` : '— days'
                  : days === '9999' ? 'Lifetime' : `${days} days`}
              </span>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={handleGenerate} disabled={saving}>
                {saving ? (
                  <><span className="loader" /> Generating…</>
                ) : (
                  `Generate ${quantity > 1 ? quantity + ' Keys' : 'Key'}`
                )}
              </button>
              <button className="btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
