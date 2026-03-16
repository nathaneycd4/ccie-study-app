import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import FlashcardSession from './pages/FlashcardSession'
import Chat from './pages/Chat'
import Labs from './pages/Labs'
import Login from './pages/Login'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import ProtectedLayout from './components/ProtectedLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:id" element={<BlogPost />} />
        <Route element={<ProtectedLayout />}>
          <Route path="quiz" element={<Quiz />} />
          <Route path="quiz/:topic" element={<FlashcardSession />} />
          <Route path="chat" element={<Chat />} />
          <Route path="labs" element={<Labs />} />
        </Route>
      </Route>
    </Routes>
  )
}
