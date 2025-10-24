import { useState, useEffect } from 'react'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Dashboard from './Pages/Client/Dashboard'
import Favorites from './Pages/Client/Favorites'
import AccountInfo from './Pages/Client/AccountInfo'
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

  if (currentPath === '/register') {
    return <Register />
  }

  if (currentPath === '/dashboard') {
    return <Dashboard />
  }

  if (currentPath === '/favorites') {
    return <Favorites />
  }

  if (currentPath === '/account') {
    return <AccountInfo />
  }

  return <Home />
}

export default App
