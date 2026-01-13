import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ImportPage from './pages/ImportPage'
import GestionPage from './pages/GestionPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/gestion" element={<GestionPage />} />
      </Routes>
    </Layout>
  )
}

export default App
