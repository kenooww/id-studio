import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './components/dashboard/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import TemplatesPage from './pages/TemplatesPage'
import UploadLayoutPage from './pages/UploadLayoutPage'
import DesignerPage from './pages/DesignerPage'
import DataSourcePage from './pages/DataSourcePage'
import PreviewPage from './pages/PreviewPage'
import PrintPage from './pages/PrintPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children, roles }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1728',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#8b5cf6', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="upload" element={<UploadLayoutPage />} />
          <Route path="designer" element={<DesignerPage />} />
          <Route path="datasource" element={<DataSourcePage />} />
          <Route path="preview" element={<PreviewPage />} />
          <Route path="print" element={<PrintPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  )
}
