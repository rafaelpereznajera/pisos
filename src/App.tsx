import { Navigate, Route, Routes } from 'react-router-dom'
import { EditPropertyPage } from './features/properties/pages/EditPropertyPage'
import { EditRoomPage } from './features/properties/pages/EditRoomPage'
import { NewRoomPage } from './features/properties/pages/NewRoomPage'
import { PropertiesHomePage } from './features/properties/pages/PropertiesHomePage'
import { NewPropertyPage } from './features/properties/pages/NewPropertyPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PropertiesHomePage />} />
      <Route path="/properties/new" element={<NewPropertyPage />} />
      <Route path="/properties/:propertyId/edit" element={<EditPropertyPage />} />
      <Route path="/properties/:propertyId/rooms/new" element={<NewRoomPage />} />
      <Route path="/properties/:propertyId/rooms/:roomId/edit" element={<EditRoomPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
