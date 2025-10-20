import { useState, useEffect } from 'react'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Dashboard from './Pages/Client/Dashboard'
import './App.css'

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handleLocationChange)
    
    // Handle initial navigation
    handleLocationChange()

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  // Simple routing based on path
  if (currentPath === '/login') {
    return <Login />
  }

  if (currentPath === '/dashboard') {
    return <Dashboard />
  }

  return <Home />
}

export default App
