import { useState, useEffect } from 'react'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Dashboard from './Pages/Client/Dashboard'
import AdminDashboard from './Pages/admin/AdminDashboard'
import OfflineDashboard from './Pages/Client/OfflineDashboard'
import Favorites from './Pages/Client/Favorites'
import Profile from './Pages/Client/Profile'
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

if (currentPath.startsWith('/admin')) {
  return <AdminDashboard />
}

if (currentPath === '/offline-dashboard') {
  return <OfflineDashboard />
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

  if (currentPath === '/profile') {
    return <Profile />
  }

  return <Home />
}

export default App
