import { Navigate, Route, Routes } from 'react-router-dom'
import { EditPropertyPage } from './features/properties/pages/EditPropertyPage'
import { PropertiesHomePage } from './features/properties/pages/PropertiesHomePage'
import { NewPropertyPage } from './features/properties/pages/NewPropertyPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PropertiesHomePage />} />
      <Route path="/properties/new" element={<NewPropertyPage />} />
      <Route path="/properties/:propertyId/edit" element={<EditPropertyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
