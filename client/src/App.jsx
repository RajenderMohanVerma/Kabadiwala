import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DashboardLayout, PublicLayout, AuthLayout } from './layouts'
import {
  LoginPage, RegisterPage, LandingPage, DashboardPage, NotFoundPage, ForbiddenPage,
  CustomerPickupsPage, PickupDetailPage, ProfilePage, PointsPage, PublicInfoPage,
  ReviewsPage, ComplaintsPage, NotificationsPage, CollectorRequestsPage,
  CollectorDetailPage, CollectorHistoryPage, CollectorAvailabilityPage, CollectorRatingsPage
} from './pages'
import { Phase3Page, RecyclerBatchPage, HubBatchPage, BulkPickupPage, CertificatePage } from './phase3'
import NewPickupPage from './NewPickupPage'

function Protected({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="screen-state"><div className="spinner" />Loading your workspace…</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <ForbiddenPage />
  return children
}

function AppRoutes() {
  return <Routes>
    <Route element={<PublicLayout />}><Route path="/" element={<LandingPage />} /><Route path="/how-it-works" element={<PublicInfoPage kind="how" />} /><Route path="/impact" element={<PublicInfoPage kind="impact" />} /></Route>
    <Route element={<AuthLayout />}><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /></Route>
    <Route element={<Protected><DashboardLayout /></Protected>}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/workspace" element={<DashboardPage />} />
      <Route path="/admin" element={<Protected roles={['ADMIN']}><DashboardPage /></Protected>} />
      <Route path="/customer/dashboard" element={<Protected roles={['CUSTOMER']}><DashboardPage /></Protected>} />
      <Route path="/customer/pickups" element={<Protected roles={['CUSTOMER']}><CustomerPickupsPage /></Protected>} />
      <Route path="/customer/pickups/new" element={<Protected roles={['CUSTOMER']}><NewPickupPage /></Protected>} />
      <Route path="/customer/pickups/:id" element={<Protected roles={['CUSTOMER']}><PickupDetailPage /></Protected>} />
      <Route path="/customer/profile" element={<Protected roles={['CUSTOMER']}><ProfilePage /></Protected>} />
      <Route path="/customer/points" element={<Protected roles={['CUSTOMER']}><PointsPage /></Protected>} />
      <Route path="/customer/reviews" element={<Protected roles={['CUSTOMER']}><ReviewsPage /></Protected>} />
      <Route path="/customer/complaints" element={<Protected roles={['CUSTOMER']}><ComplaintsPage /></Protected>} />
      <Route path="/customer/notifications" element={<Protected roles={['CUSTOMER']}><NotificationsPage /></Protected>} />
      <Route path="/customer/bulk-pickup" element={<Protected roles={['CUSTOMER']}><BulkPickupPage /></Protected>} />
      <Route path="/collector/dashboard" element={<Protected roles={['COLLECTOR']}><DashboardPage /></Protected>} />
      <Route path="/collector/requests" element={<Protected roles={['COLLECTOR']}><CollectorRequestsPage /></Protected>} />
      <Route path="/collector/requests/:id" element={<Protected roles={['COLLECTOR']}><CollectorDetailPage /></Protected>} />
      <Route path="/collector/profile" element={<Protected roles={['COLLECTOR']}><ProfilePage /></Protected>} />
      <Route path="/collector/availability" element={<Protected roles={['COLLECTOR']}><CollectorAvailabilityPage /></Protected>} />
      <Route path="/collector/history" element={<Protected roles={['COLLECTOR']}><CollectorHistoryPage /></Protected>} />
      <Route path="/collector/ratings" element={<Protected roles={['COLLECTOR']}><CollectorRatingsPage /></Protected>} />
      <Route path="/hub/dashboard" element={<Protected roles={['HUB_MANAGER', 'ADMIN']}><Phase3Page role="hub" kind="dashboard" /></Protected>} />
      <Route path="/hub/collections" element={<Protected roles={['HUB_MANAGER', 'ADMIN']}><Phase3Page role="hub" kind="collections" /></Protected>} />
      <Route path="/hub/batches" element={<Protected roles={['HUB_MANAGER', 'ADMIN']}><Phase3Page role="hub" kind="batches" /></Protected>} />
      <Route path="/hub/batches/:id" element={<Protected roles={['HUB_MANAGER', 'ADMIN']}><HubBatchPage /></Protected>} />
      <Route path="/hub/inventory" element={<Protected roles={['HUB_MANAGER', 'ADMIN']}><Phase3Page role="hub" kind="inventory" /></Protected>} />
      <Route path="/hub/analytics" element={<Protected roles={['HUB_MANAGER', 'ADMIN']}><Phase3Page role="hub" kind="analytics" /></Protected>} />
      <Route path="/recycler/dashboard" element={<Protected roles={['RECYCLER', 'ADMIN']}><Phase3Page role="recycler" kind="dashboard" /></Protected>} />
      <Route path="/recycler/batches" element={<Protected roles={['RECYCLER', 'ADMIN']}><Phase3Page role="recycler" kind="batches" /></Protected>} />
      <Route path="/recycler/batches/:id" element={<Protected roles={['RECYCLER', 'ADMIN']}><RecyclerBatchPage /></Protected>} />
      <Route path="/recycler/processing" element={<Protected roles={['RECYCLER', 'ADMIN']}><Phase3Page role="recycler" kind="processing" /></Protected>} />
      <Route path="/recycler/history" element={<Protected roles={['RECYCLER', 'ADMIN']}><Phase3Page role="recycler" kind="history" /></Protected>} />
      <Route path="/recycler/profile" element={<Protected roles={['RECYCLER', 'ADMIN']}><ProfilePage /></Protected>} />
      <Route path="/recycler/analytics" element={<Protected roles={['RECYCLER', 'ADMIN']}><Phase3Page role="recycler" kind="analytics" /></Protected>} />
      <Route path="/customer/certificates" element={<Protected roles={['CUSTOMER']}><CertificatePage /></Protected>} />
      {['dashboard', 'users', 'collectors', 'recyclers', 'hubs', 'pickups', 'batches', 'complaints', 'reviews', 'notifications', 'analytics', 'audit-logs'].map((kind) => <Route key={kind} path={`/admin/${kind}`} element={<Protected roles={['ADMIN']}><Phase3Page role="admin" kind={kind} /></Protected>} />)}
    </Route>
    <Route path="/forbidden" element={<ForbiddenPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}
