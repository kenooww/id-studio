import { useState, useMemo } from 'react'
import { useAppStore } from '../store'
import { IDCard } from '../components/IDCard'
import { Eye, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PreviewPage() {
  const templates = useAppStore(s => s.templates)
  const activeTemplateId = useAppStore(s => s.activeTemplateId)
  const sheetData = useAppStore(s => s.sheetData)
  const [selectedTmplId, setSelectedTmplId] = useState(activeTemplateId || templates[0]?.id || '')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [side, setSide] = useState('front')
  const [scale, setScale] = useState(1.5)
  const navigate = useNavigate()

  const template = templates.find(t => t.id === selectedTmplId)
  const data = sheetData.length > 0 ? sheetData : [
    { name: 'John Smith', id_number: 'EMP-001', photo_url: 'https://randomuser.me/api/portraits/men/1.jpg', extra_field: 'Engineering', field_1: 'Blood Type: O+', field_2: 'Emergency: 555-1234', field_3: 'Dept: Engineering', field_4: '2024-01-15' },
    { name: 'Sarah Johnson', id_number: 'EMP-002', photo_url: 'https://randomuser.me/api/portraits/women/2.jpg', extra_field: 'Marketing', field_1: 'Blood Type: A+', field_2: 'Emergency: 555-5678', field_3: 'Dept: Marketing', field_4: '2024-02-20' },
    { name: 'Michael Chen', id_number: 'EMP-003', photo_url: 'https://randomuser.me/api/portraits/men/3.jpg', extra_field: 'HR', field_1: 'Blood Type: B+', field_2: 'Emergency: 555-9012', field_3: 'Dept: HR', field_4: '2024-03-10' },
  ]
  const total = data.length
  const current = data[currentIndex] || {}

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Preview</h1>
          <p className="text-white/40 text-sm mt-1">Preview generated ID cards</p>
        </div>
        <button onClick={() => navigate('/dashboard/print')} className="btn-primary">
          <CreditCard className="w-4 h-4" /> Go to Print
        </button>
      </div>

      {/* Controls */}
      <div className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="label">Template</label>
          <select value={selectedTmplId} onChange={e => setSelectedTmplId(e.target.value)} className="input-field">
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Side</label>
          <div className="flex glass rounded-lg p-0.5">
            {['front', 'back'].map(s => (
              <button key={s} onClick={() => setSide(s)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize font-medium transition-all ${
                  side === s ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-1.5 glass rounded hover:bg-white/10">
            <ZoomOut className="w-4 h-4 text-white/60" />
          </button>
          <span className="text-xs text-white/40 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.25))} className="p-1.5 glass rounded hover:bg-white/10">
            <ZoomIn className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {template ? (
        <>
          {/* Card preview */}
          <div className="glass rounded-2xl p-8 flex flex-col items-center mb-6"
            style={{ background: 'radial-gradient(ellipse at center, #1a1530 0%, #0d0b1a 100%)' }}>
            <IDCard template={template} data={current} side={side} scale={scale} showGrid={false} />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between glass rounded-xl p-4">
            <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}
              className="btn-secondary disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="text-center">
              <p className="text-white font-semibold">{current.name || `Record ${currentIndex + 1}`}</p>
              <p className="text-xs text-white/40">{currentIndex + 1} of {total}</p>
            </div>

            <button onClick={() => setCurrentIndex(i => Math.min(total - 1, i + 1))} disabled={currentIndex === total - 1}
              className="btn-secondary disabled:opacity-30">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnail strip */}
          {total > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar py-2">
              {data.slice(0, 20).map((d, i) => (
                <div key={i} onClick={() => setCurrentIndex(i)}
                  className={`flex-shrink-0 cursor-pointer transition-all rounded-lg overflow-hidden border-2 ${
                    i === currentIndex ? 'border-violet-500' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}>
                  <IDCard template={template} data={d} side={side} scale={0.25} />
                </div>
              ))}
              {total > 20 && (
                <div className="flex-shrink-0 w-16 h-10 glass rounded-lg flex items-center justify-center text-xs text-white/30">
                  +{total - 20}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="glass rounded-xl p-12 text-center text-white/30">
          <Eye className="w-12 h-12 mx-auto mb-4" />
          <p>No template selected. Create a template first.</p>
        </div>
      )}
    </div>
  )
}
