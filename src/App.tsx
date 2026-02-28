import { Navigate, Route, Routes } from 'react-router-dom'
import { PropertiesHomePage } from './features/properties/pages/PropertiesHomePage'
import { NewPropertyPage } from './features/properties/pages/NewPropertyPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PropertiesHomePage />} />
      <Route path="/properties/new" element={<NewPropertyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
