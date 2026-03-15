import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import FlashcardSession from './pages/FlashcardSession'
import Chat from './pages/Chat'
import Labs from './pages/Labs'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="quiz/:topic" element={<FlashcardSession />} />
        <Route path="chat" element={<Chat />} />
        <Route path="labs" element={<Labs />} />
      </Route>
    </Routes>
  )
}
