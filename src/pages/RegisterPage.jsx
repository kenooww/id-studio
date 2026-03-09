import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import { CreditCard, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' })
  const [loading, setLoading] = useState(false)
  const register = useAuthStore(s => s.register)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = register(form.name, form.email, form.password, form.role)
    setLoading(false)
    if (result.success) {
      toast.success('Account created!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0b1a] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px'}} />
      </div>

      <div className="relative w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <CreditCard className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">IDForge</h1>
          <p className="text-white/40 text-sm mt-1">Create your account</p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Register</h2>
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-field" placeholder="John Doe" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field" placeholder="••••••••" required />
            </div>
            <div>
              <label className="label">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="input-field">
                <option value="viewer">Viewer</option>
                <option value="operator">Operator</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-3 mt-2 text-base font-semibold">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-white/40">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
