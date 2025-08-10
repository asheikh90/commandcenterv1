import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Inbox from './pages/Inbox'
import Conversations from './pages/Conversations'
import Quote from './pages/Quote'
import SEO from './pages/SEO'
import CCC from './pages/CCC'
import Pulse from './pages/Pulse'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/inbox" replace />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/seo" element={<SEO />} />
          <Route path="/ccc" element={<CCC />} />
          <Route path="/pulse" element={<Pulse />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
