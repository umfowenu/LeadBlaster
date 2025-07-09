import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ChecklistBuilder from './components/ChecklistBuilder'
import PreviewMode from './components/PreviewMode'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import Layout from './components/Layout'

function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/builder/:id?" element={<ChecklistBuilder />} />
        <Route path="/preview/:id" element={<PreviewMode />} />
        <Route path="/analytics/:id" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
