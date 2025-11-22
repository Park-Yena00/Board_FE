import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import BoardList from './components/BoardList'
import BoardDetail from './components/BoardDetail'
import BoardWrite from './components/BoardWrite'
import BoardEdit from './components/BoardEdit'
import Login from './components/Login'
import Register from './components/Register'
import { useMetrics } from './hooks/useMetrics'
import './App.css'

function AppContent() {
  useMetrics()
  
  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<BoardList />} />
          <Route path="/post/:id" element={<BoardDetail />} />
          <Route path="/write" element={<BoardWrite />} />
          <Route path="/edit/:id" element={<BoardEdit />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App

