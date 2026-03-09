import { useState } from 'react'
import { useAppStore } from '../store'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, CreditCard, Edit2, Trash2, Copy, ChevronRight } from 'lucide-react'

const CARD_SIZES = [
  { id: 'cr80', label: 'PVC CR80 (Standard)', w: 85.6, h: 54 },
  { id: 'custom', label: 'Custom Size', w: 100, h: 60 },
]

export default function TemplatesPage() {
  const templates = useAppStore(s => s.templates)
  const createTemplate = useAppStore(s => s.createTemplate)
  const deleteTemplate = useAppStore(s => s.deleteTemplate)
  const duplicateTemplate = useAppStore(s => s.duplicateTemplate)
  const setActiveTemplate = useAppStore(s => s.setActiveTemplate)
  const navigate = useNavigate()

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', orientation: 'landscape', cardSize: 'cr80' })

  const handleCreate = () => {
    if (!form.name.trim()) return toast.error('Enter a template name')
    createTemplate(form)
    setShowCreate(false)
    setForm({ name: '', orientation: 'landscape', cardSize: 'cr80' })
    toast.success('Template created!')
  }

  const handleDelete = (id) => {
    if (!confirm('Delete this template?')) return
    deleteTemplate(id)
    toast.success('Template deleted')
  }

  const handleEdit = (id) => {
    setActiveTemplate(id)
    navigate('/dashboard/designer')
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Templates</h1>
          <p className="text-white/40 text-sm mt-1">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl p-8 w-full max-w-md mx-4 animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-6">New Template</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Template Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field" placeholder="Company ID Card" autoFocus />
              </div>
              <div>
                <label className="label">Orientation</label>
                <div className="flex gap-2">
                  {['landscape', 'portrait'].map(o => (
                    <button key={o} onClick={() => setForm(f => ({ ...f, orientation: o }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize border ${
                        form.orientation === o
                          ? 'bg-violet-600 border-violet-500 text-white'
                          : 'glass border-white/10 text-white/60 hover:text-white'
                      }`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Card Size</label>
                <select value={form.cardSize} onChange={e => setForm(f => ({ ...f, cardSize: e.target.value }))}
                  className="input-field">
                  {CARD_SIZES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 btn-secondary justify-center">Cancel</button>
              <button onClick={handleCreate} className="flex-1 btn-primary justify-center">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(tmpl => (
          <div key={tmpl.id} className="glass rounded-xl overflow-hidden hover:border-violet-500/30 border border-white/08 transition-all group">
            {/* Preview area */}
            <div className="h-36 bg-gradient-to-br from-violet-900/30 to-indigo-900/30 flex items-center justify-center relative">
              <div className={`${
                tmpl.orientation === 'landscape'
                  ? 'w-32 h-20'
                  : 'w-20 h-28'
                } bg-white/10 rounded-lg border border-white/20 flex items-center justify-center`}>
                <CreditCard className="w-8 h-8 text-white/30" />
              </div>
              <span className="absolute top-2 right-2 text-xs glass px-2 py-0.5 rounded-full text-white/50 capitalize">
                {tmpl.orientation}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white mb-1 truncate">{tmpl.name}</h3>
              <p className="text-xs text-white/40 mb-4">
                {tmpl.cardSize.toUpperCase()} · {tmpl.frontFields?.length || 0} front / {tmpl.backFields?.length || 0} back fields
              </p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(tmpl.id)}
                  className="flex-1 btn-primary justify-center py-1.5 text-xs">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => { duplicateTemplate(tmpl.id); toast.success('Duplicated!') }}
                  className="btn-secondary px-2.5 py-1.5">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(tmpl.id)}
                  className="btn-danger px-2.5 py-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add new */}
        <button onClick={() => setShowCreate(true)}
          className="glass rounded-xl h-full min-h-[220px] flex flex-col items-center justify-center gap-3 text-white/30 hover:text-white/60 hover:border-violet-500/30 border border-dashed border-white/10 transition-all">
          <div className="w-12 h-12 rounded-full bg-white/05 flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium">New Template</span>
        </button>
      </div>
    </div>
  )
}
