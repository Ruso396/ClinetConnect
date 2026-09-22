import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Customers } from './pages/Customers'
import { AddCustomer } from './pages/AddCustomer'
import { CustomerDetails } from './pages/CustomerDetails'
import { EditCustomer } from './pages/EditCustomer'
import { FollowUps } from './pages/FollowUps'
import { Profile } from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/new" element={<AddCustomer />} />
                <Route path="/customers/:id" element={<CustomerDetails />} />
                <Route path="/customers/:id/edit" element={<EditCustomer />} />
                <Route path="/follow-ups" element={<FollowUps />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}