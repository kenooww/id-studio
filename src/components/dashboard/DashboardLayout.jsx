import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, FileText, Upload, Palette, Database,
  Eye, Printer, Settings, LogOut, CreditCard, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/templates', label: 'Templates', icon: FileText },
  { to: '/dashboard/upload', label: 'Upload Layout', icon: Upload },
  { to: '/dashboard/designer', label: 'Designer', icon: Palette },
  { to: '/dashboard/datasource', label: 'Data Source', icon: Database },
  { to: '/dashboard/preview', label: 'Preview', icon: Eye },
  { to: '/dashboard/print', label: 'Print', icon: Printer },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout() {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0b1a]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-white/08 bg-[#100e1f]">
        {/* Logo */}
        <div className="p-5 border-b border-white/08">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-lg leading-none">IDStudio</span>
              <p className="text-xs text-white/30 mt-0.5">ID Card System</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-3 h-3 opacity-30" />
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/08">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg glass mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/40 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}