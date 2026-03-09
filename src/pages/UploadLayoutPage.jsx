import { useState, useRef } from 'react'
import { useAppStore } from '../store'
import toast from 'react-hot-toast'
import { Upload, X, Image, CheckCircle } from 'lucide-react'

function DropZone({ label, side, templateId, current, onUpload }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const processFile = (file) => {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      return toast.error('Only PNG/JPEG supported')
    }
    if (file.size > 5 * 1024 * 1024) return toast.error('File too large (max 5MB)')
    const reader = new FileReader()
    reader.onload = (e) => {
      onUpload(templateId, side, e.target.result)
      toast.success(`${label} uploaded!`)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDrop={e => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]) }}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      className={`relative glass rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
        ${dragging ? 'border-violet-400 bg-violet-500/10' : 'border-white/10 hover:border-violet-500/40 hover:bg-white/03'}`}
      style={{ height: 240 }}
    >
      <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden"
        onChange={e => processFile(e.target.files[0])} />

      {current ? (
        <div className="absolute inset-0">
          <img src={current} alt="layout" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="text-center text-white">
              <Image className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Click to replace</p>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <span className="glass text-xs px-2 py-1 rounded-full text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Uploaded
            </span>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
            ${dragging ? 'bg-violet-500/20' : 'bg-white/05'}`}>
            <Upload className="w-7 h-7" />
          </div>
          <div className="text-center">
            <p className="font-medium text-white/60">{label}</p>
            <p className="text-xs mt-1">PNG or JPEG, max 5MB</p>
            <p className="text-xs mt-0.5">Drag & drop or click to browse</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function UploadLayoutPage() {
  const templates = useAppStore(s => s.templates)
  const activeTemplateId = useAppStore(s => s.activeTemplateId)
  const setLayout = useAppStore(s => s.setLayout)
  const updateTemplate = useAppStore(s => s.updateTemplate)
  const [selectedId, setSelectedId] = useState(activeTemplateId || templates[0]?.id || '')

  const template = templates.find(t => t.id === selectedId)

  const handleClear = (side) => {
    setLayout(selectedId, side, null)
    toast.success('Layout cleared')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Upload Layout</h1>
        <p className="text-white/40 text-sm mt-1">Upload background images for front and back of ID cards</p>
      </div>

      {/* Template selector */}
      <div className="mb-6">
        <label className="label">Template</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="input-field max-w-sm">
          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {template ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Front */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white">Front Layout</h2>
              {template.frontLayout && (
                <button onClick={() => handleClear('front')}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <DropZone
              label="Front Background"
              side="front"
              templateId={selectedId}
              current={template.frontLayout}
              onUpload={setLayout}
            />
          </div>

          {/* Back */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white">Back Layout</h2>
              {template.backLayout && (
                <button onClick={() => handleClear('back')}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <DropZone
              label="Back Background"
              side="back"
              templateId={selectedId}
              current={template.backLayout}
              onUpload={setLayout}
            />
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl p-10 text-center text-white/30">
          No templates found. Create a template first.
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/70 mb-3">Layout Tips</h3>
        <ul className="space-y-2 text-sm text-white/40">
          <li>• Use high-resolution images for crisp print quality (300 DPI recommended)</li>
          <li>• CR80 cards are 85.6mm × 54mm — design your layout at that ratio</li>
          <li>• Transparent PNG backgrounds work best for layered designs</li>
          <li>• Layouts are stored per-template and can be swapped any time</li>
        </ul>
      </div>
    </div>
  )
}
