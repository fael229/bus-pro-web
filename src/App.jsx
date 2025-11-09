import { Routes, Route, Navigate } from 'react-router-dom'
import { useSession } from './contexts/SessionProvider'
import Layout from './components/Layout'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import Trajets from './pages/Trajets'
import TrajetDetails from './pages/TrajetDetails'
import Compagnies from './pages/Compagnies'
import CompagnieDetails from './pages/CompagnieDetails'
import Reservation from './pages/Reservation'
import Payment from './pages/Payment'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Reservations from './pages/Reservations'
import Favorites from './pages/Favorites'
import AdminDashboard from './pages/admin/Dashboard'
import AdminTrajets from './pages/admin/Trajets'
import AdminCompagnies from './pages/admin/Compagnies'
import AdminReservations from './pages/admin/AdminReservations'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children }) {
  const { session, loading } = useSession()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!session) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="trajets" element={<Trajets />} />
        <Route path="trajet/:id" element={<TrajetDetails />} />
        <Route path="compagnies" element={<Compagnies />} />
        <Route path="compagnies/:id" element={<CompagnieDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* Routes protégées */}
        <Route path="reservation/:id" element={
          <ProtectedRoute>
            <Reservation />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="reservations" element={
          <ProtectedRoute>
            <Reservations />
          </ProtectedRoute>
        } />
        <Route path="favorites" element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        } />
        <Route path="payment/:id" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        
        {/* Routes Admin */}
        <Route path="admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="admin/trajets" element={
          <AdminRoute>
            <AdminTrajets />
          </AdminRoute>
        } />
        <Route path="admin/compagnies" element={
          <AdminRoute>
            <AdminCompagnies />
          </AdminRoute>
        } />
        <Route path="admin/reservations" element={
          <AdminRoute>
            <AdminReservations />
          </AdminRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
