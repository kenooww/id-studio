import { useAppStore, useAuthStore } from '../store'
import { CreditCard, FileText, Database, TrendingUp, ChevronRight, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardHome() {
  const templates = useAppStore(s => s.templates)
  const sheetData = useAppStore(s => s.sheetData)
  const totalGenerated = useAppStore(s => s.totalGenerated)
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()

  const stats = [
    {
      label: 'Total IDs Generated',
      value: totalGenerated.toLocaleString(),
      icon: CreditCard,
      color: 'text-violet-400',
      bg: 'bg-violet-600/10',
      border: 'border-violet-500/20',
    },
    {
      label: 'Total Templates',
      value: templates.length,
      icon: FileText,
      color: 'text-indigo-400',
      bg: 'bg-indigo-600/10',
      border: 'border-indigo-500/20',
    },
    {
      label: 'Sheet Records',
      value: sheetData.length.toLocaleString(),
      icon: Database,
      color: 'text-sky-400',
      bg: 'bg-sky-600/10',
      border: 'border-sky-500/20',
    },
    {
      label: 'Active Sessions',
      value: 1,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-600/10',
      border: 'border-emerald-500/20',
    },
  ]

  const quickActions = [
    { label: 'New Template', desc: 'Create ID card template', to: '/dashboard/templates', icon: FileText, color: 'violet' },
    { label: 'Import Data', desc: 'Connect Google Sheets', to: '/dashboard/datasource', icon: Database, color: 'sky' },
    { label: 'Open Designer', desc: 'Design ID layout', to: '/dashboard/designer', icon: Plus, color: 'indigo' },
    { label: 'Print / Export', desc: 'Generate PDF batch', to: '/dashboard/print', icon: CreditCard, color: 'emerald' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Good day, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-white/40 mt-1">Here's what's happening with your ID system.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className={`glass rounded-xl p-5 border ${stat.border}`}>
            <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(a => (
            <button key={a.label} onClick={() => navigate(a.to)}
              className="glass hover:bg-white/08 rounded-xl p-5 text-left transition-all group border border-transparent hover:border-white/10">
              <div className={`inline-flex p-2 rounded-lg bg-${a.color}-600/10 mb-3 group-hover:scale-110 transition-transform`}>
                <a.icon className={`w-5 h-5 text-${a.color}-400`} />
              </div>
              <p className="font-semibold text-white text-sm">{a.label}</p>
              <p className="text-xs text-white/40 mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Recent Templates</h2>
          <button onClick={() => navigate('/dashboard/templates')}
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {templates.slice(0, 4).map(tmpl => (
            <div key={tmpl.id} className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/06 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{tmpl.name}</p>
                <p className="text-xs text-white/40">{tmpl.orientation} · {tmpl.cardSize} · {tmpl.frontFields?.length || 0} fields</p>
              </div>
              <span className="text-xs text-white/30">{new Date(tmpl.createdAt).toLocaleDateString()}</span>
              <button onClick={() => navigate('/dashboard/designer')}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                Edit <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-white/30 text-sm">No templates yet.</p>
              <button onClick={() => navigate('/dashboard/templates')}
                className="mt-3 btn-primary mx-auto">Create Template</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
