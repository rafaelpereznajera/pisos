import { Navigate, Route, Routes } from 'react-router-dom'
import { EditPropertyPage } from './features/properties/pages/EditPropertyPage'
import { EditRoomPage } from './features/properties/pages/EditRoomPage'
import { NewRoomPage } from './features/properties/pages/NewRoomPage'
import { PropertiesHomePage } from './features/properties/pages/PropertiesHomePage'
import { NewPropertyPage } from './features/properties/pages/NewPropertyPage'
import { EditLeasePage } from './features/leases/pages/EditLeasePage'
import { NewLeasePage } from './features/leases/pages/NewLeasePage'
import { LeasePaymentsHistoryPage } from './features/payments/pages/LeasePaymentsHistoryPage'
import { AddPaymentPage } from './features/payments/pages/AddPaymentPage'
import { EditTenantPage } from './features/tenants/pages/EditTenantPage'
import { NewTenantPage } from './features/tenants/pages/NewTenantPage'
import { TenantsListPage } from './features/tenants/pages/TenantsListPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PropertiesHomePage />} />
      <Route path="/properties/new" element={<NewPropertyPage />} />
      <Route path="/properties/:propertyId/edit" element={<EditPropertyPage />} />
      <Route path="/properties/:propertyId/rooms/new" element={<NewRoomPage />} />
      <Route path="/properties/:propertyId/rooms/:roomId/edit" element={<EditRoomPage />} />
      <Route path="/tenants" element={<TenantsListPage />} />
      <Route path="/tenants/new" element={<NewTenantPage />} />
      <Route path="/tenants/:tenantId/edit" element={<EditTenantPage />} />
      <Route path="/leases/new" element={<NewLeasePage />} />
      <Route path="/leases/:leaseId/edit" element={<EditLeasePage />} />
      <Route path="/leases/:leaseId/payments" element={<LeasePaymentsHistoryPage />} />
      <Route path="/leases/:leaseId/payments/new" element={<AddPaymentPage />} />
      <Route path="/leases/:leaseId/payments/:paymentId/edit" element={<AddPaymentPage editMode={true} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
