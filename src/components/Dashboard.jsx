import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import Licenses from './Licenses'
import Updates from './Updates'
import Logs from './Logs'

export default function Dashboard() {
  const [activeView, setActiveView] = useState('licenses')
  const { isOwner } = useAuth()

  useEffect(() => {
    if (isOwner) {
      document.body.classList.add('is-owner')
    } else {
      document.body.classList.remove('is-owner')
    }
    return () => document.body.classList.remove('is-owner')
  }, [isOwner])

  return (
    <>
      <Sidebar activeView={activeView} onSwitch={setActiveView} />
      <div className="content fade-in">
        {activeView === 'licenses' && <Licenses />}
        {activeView === 'updates' && <Updates />}
        {activeView === 'logs' && <Logs />}
      </div>
    </>
  )
}
