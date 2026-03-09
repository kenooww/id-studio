import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import { CreditCard, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ email: 'admin@idforge.com', password: 'admin123' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = login(form.email, form.password)
    setLoading(false)
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`)
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0b1a] flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px'}} />
      </div>

      <div className="relative w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <CreditCard className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">IDForge</h1>
          <p className="text-white/40 text-sm mt-1">Professional ID Card System</p>
        </div>

        {/* Form */}
        <div className="glass-strong rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in</h2>
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-3 mt-2 text-base font-semibold">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-white/40">
              No account?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
                Register here
              </Link>
            </p>
          </div>

          {/* Demo accounts */}
          <div className="mt-4 p-3 rounded-lg bg-white/03 border border-white/05">
            <p className="text-xs text-white/30 mb-2 font-medium uppercase tracking-wider">Demo Accounts</p>
            <div className="space-y-1">
              {[
                { email: 'admin@idforge.com', pass: 'admin123', role: 'Admin' },
                { email: 'operator@idforge.com', pass: 'op123', role: 'Operator' },
                { email: 'viewer@idforge.com', pass: 'view123', role: 'Viewer' },
              ].map(acc => (
                <button key={acc.email} onClick={() => setForm({ email: acc.email, password: acc.pass })}
                  className="w-full text-left text-xs text-white/40 hover:text-white/70 transition-colors py-0.5 flex justify-between">
                  <span>{acc.email}</span>
                  <span className="text-violet-400/60">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
