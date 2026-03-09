import { useState } from 'react'
import { useAppStore } from '../store'
import toast from 'react-hot-toast'
import { Database, RefreshCw, CheckCircle, AlertCircle, ExternalLink, Info, Table } from 'lucide-react'

// Sample/mock data for demo purposes
const SAMPLE_DATA = [
  { name: 'John Smith',     id_number: 'EMP-001', photo_url: 'https://randomuser.me/api/portraits/men/1.jpg',   extra_field: 'Engineering', field_1: 'Blood Type: O+',  field_2: 'Emergency: 555-1234', field_3: 'Dept: Engineering', field_4: '2024-01-15' },
  { name: 'Sarah Johnson',  id_number: 'EMP-002', photo_url: 'https://randomuser.me/api/portraits/women/2.jpg', extra_field: 'Marketing',   field_1: 'Blood Type: A+',  field_2: 'Emergency: 555-5678', field_3: 'Dept: Marketing',   field_4: '2024-02-20' },
  { name: 'Michael Chen',   id_number: 'EMP-003', photo_url: 'https://randomuser.me/api/portraits/men/3.jpg',   extra_field: 'HR',          field_1: 'Blood Type: B+',  field_2: 'Emergency: 555-9012', field_3: 'Dept: HR',          field_4: '2024-03-10' },
  { name: 'Emily Davis',    id_number: 'EMP-004', photo_url: 'https://randomuser.me/api/portraits/women/4.jpg', extra_field: 'Finance',     field_1: 'Blood Type: AB+', field_2: 'Emergency: 555-3456', field_3: 'Dept: Finance',     field_4: '2024-01-05' },
  { name: 'Robert Wilson',  id_number: 'EMP-005', photo_url: 'https://randomuser.me/api/portraits/men/5.jpg',   extra_field: 'Operations',  field_1: 'Blood Type: O-',  field_2: 'Emergency: 555-7890', field_3: 'Dept: Operations',  field_4: '2024-04-22' },
  { name: 'Lisa Anderson',  id_number: 'EMP-006', photo_url: 'https://randomuser.me/api/portraits/women/6.jpg', extra_field: 'Legal',       field_1: 'Blood Type: A-',  field_2: 'Emergency: 555-2345', field_3: 'Dept: Legal',       field_4: '2024-05-11' },
]

// Convert Google Drive share URLs to thumbnail URLs
function normalizePhotoUrl(url) {
  if (!url) return { src: '', type: 'empty' }
  // Google Drive /file/d/ID/view
  const driveFile = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveFile) return { src: `https://drive.google.com/thumbnail?id=${driveFile[1]}&sz=w200`, type: 'drive-file', id: driveFile[1] }
  // Google Drive ?id=ID
  const driveOpen = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (driveOpen && url.includes('drive.google.com')) return { src: `https://drive.google.com/thumbnail?id=${driveOpen[1]}&sz=w200`, type: 'drive-open', id: driveOpen[1] }
  // Plain URL
  return { src: url, type: 'direct' }
}

function PhotoThumb({ url, debug = false }) {
  const [status, setStatus] = useState('loading') // loading | ok | error
  const { src, type, id } = normalizePhotoUrl(url)

  const showFallback = !src || status === 'error'

  const thumb = showFallback
    ? <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/20 text-xs flex-shrink-0">👤</div>
    : <img key={src} src={src} alt=""
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/10"
        onLoad={() => setStatus('ok')}
        onError={() => setStatus('error')} />

  if (!debug) return thumb

  // Debug mode — show full status panel
  const statusColor = { loading: '#888', ok: '#4ade80', error: '#f87171' }[status]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 8px', background: 'rgba(0,0,0,0.4)', borderRadius: 6, fontSize: 10, fontFamily: 'monospace', maxWidth: 340, border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {thumb}
        <span style={{ color: statusColor, fontWeight: 'bold', textTransform: 'uppercase' }}>● {status}</span>
        <span style={{ color: '#666' }}>type: {type}</span>
        {id && <span style={{ color: '#888' }}>id: {id.slice(0, 16)}…</span>}
      </div>
      <div style={{ color: '#555' }}>raw: <span style={{ color: '#aaa' }}>{url?.slice(0, 60)}{url?.length > 60 ? '…' : ''}</span></div>
      <div style={{ color: '#555' }}>resolved: <span style={{ color: status === 'error' ? '#f87171' : '#aaa' }}>{src?.slice(0, 60)}{src?.length > 60 ? '…' : ''}</span></div>
      {status === 'error' && (
        <div style={{ color: '#f87171' }}>
          {type === 'drive-file' || type === 'drive-open'
            ? '⚠ Google Drive: file must be shared publicly (Anyone with link → Viewer)'
            : '⚠ Image failed to load — check URL is publicly accessible'}
        </div>
      )}
      {status === 'ok' && <div style={{ color: '#4ade80' }}>✓ Image loaded successfully</div>}
    </div>
  )
}

function parseSheetUrl(url) {
  // Extract sheet ID from various Google Sheets URL formats
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}

async function fetchSheetData(sheetId) {
  // Google Sheets public CSV export
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
  const res = await fetch(csvUrl)
  if (!res.ok) throw new Error('Could not fetch sheet — make sure it is publicly shared')
  const text = await res.text()

  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })
  return rows
}

export default function DataSourcePage() {
  const sheetUrl = useAppStore(s => s.sheetUrl)
  const sheetData = useAppStore(s => s.sheetData)
  const setSheetData = useAppStore(s => s.setSheetData)
  const setSheetUrl = useAppStore(s => s.setSheetUrl)
  const sheetLoading = useAppStore(s => s.sheetLoading)
  const setSheetLoading = useAppStore(s => s.setSheetLoading)

  const [url, setUrl] = useState(sheetUrl)
  const [error, setError] = useState('')
  const [debugPhotos, setDebugPhotos] = useState(false)

  const handleFetch = async () => {
    setError('')
    const sheetId = parseSheetUrl(url)
    if (!sheetId) return setError('Invalid Google Sheets URL')
    setSheetLoading(true)
    try {
      const data = await fetchSheetData(sheetId)
      setSheetData(data)
      setSheetUrl(url)
      toast.success(`Loaded ${data.length} records!`)
    } catch (e) {
      setError(e.message)
      toast.error('Failed to fetch sheet data')
    } finally {
      setSheetLoading(false)
    }
  }

  const loadSampleData = () => {
    setSheetData(SAMPLE_DATA)
    toast.success(`Loaded ${SAMPLE_DATA.length} sample records!`)
  }

  const columns = sheetData.length > 0 ? Object.keys(sheetData[0]) : []

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Data Source</h1>
        <p className="text-white/40 text-sm mt-1">Connect Google Sheets as your ID card data source</p>
      </div>

      {/* Input section */}
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Database className="w-5 h-5 text-violet-400 mt-0.5" />
          <div>
            <h2 className="font-semibold text-white">Google Sheets URL</h2>
            <p className="text-xs text-white/40 mt-0.5">Sheet must be publicly accessible (View permissions)</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="input-field flex-1"
          />
          <button onClick={handleFetch} disabled={sheetLoading || !url}
            className="btn-primary flex-shrink-0">
            {sheetLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {sheetLoading ? 'Fetching...' : 'Fetch'}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/08">
          <button onClick={loadSampleData} className="btn-secondary text-xs">
            Load Sample Data ({SAMPLE_DATA.length} records)
          </button>
          <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noopener noreferrer"
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
            Open Google Sheets <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Required columns info */}
      <div className="glass rounded-xl p-5 mb-6 border border-violet-500/10">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-white">Required Column Structure</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs text-white/50">
          <div>
            <p className="text-white/70 font-medium mb-1">Front Side Columns</p>
            <ul className="space-y-0.5 font-mono">
              <li>photo_url — Profile photo URL</li>
              <li>name — Full name</li>
              <li>id_number — Employee ID</li>
              <li>extra_field — Department/position</li>
            </ul>
          </div>
          <div>
            <p className="text-white/70 font-medium mb-1">Back Side Columns</p>
            <ul className="space-y-0.5 font-mono">
              <li>field_1 — Blood type / info</li>
              <li>field_2 — Emergency contact</li>
              <li>field_3 — Department</li>
              <li>field_4 — Date / other info</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data preview table */}
      {sheetData.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-white">{sheetData.length} records loaded</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setDebugPhotos(d => !d)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${debugPhotos ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'glass border-white/10 text-white/40 hover:text-white'}`}>
                🔍 {debugPhotos ? 'Hide Photo Debug' : 'Debug Photos'}
              </button>
              <span className="text-xs text-white/40">{columns.length} columns</span>
            </div>
          </div>

          {/* Photo debug panel */}
          {debugPhotos && (
            <div className="glass rounded-xl p-5 mb-4 border border-amber-500/20">
              <p className="text-xs font-semibold text-amber-300 mb-3 uppercase tracking-wider">📸 Photo URL Debug — first 6 records</p>
              <div className="flex flex-col gap-3">
                {sheetData.slice(0, 6).map((row, i) => {
                  const photoKey = Object.keys(row).find(k => ['photo_url','photo','image','picture'].includes(k.toLowerCase()))
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-white/30 text-xs w-4 pt-1">#{i+1}</span>
                      <PhotoThumb url={row[photoKey]} debug={true} />
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-white/08 text-xs text-white/40 space-y-1">
                <p className="text-white/60 font-medium">Common fixes:</p>
                <p>• <span className="text-white/60">Google Drive:</span> Open file → Share → "Anyone with the link" → Viewer</p>
                <p>• <span className="text-white/60">Google Drive URL format:</span> must contain <code className="text-amber-300/70">/file/d/FILE_ID/</code></p>
                <p>• <span className="text-white/60">Direct URL:</span> must be a publicly accessible image (jpg/png)</p>
                <p>• <span className="text-white/60">Column name:</span> must be <code className="text-amber-300/70">photo_url</code> in your sheet</p>
              </div>
            </div>
          )}

          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/03">
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider w-8">#</th>
                    {columns.map(col => (
                      <th key={col} className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheetData.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b border-white/05 hover:bg-white/03 transition-colors">
                      <td className="px-4 py-2.5 text-white/20 text-xs">{i + 1}</td>
                      {columns.map(col => (
                        <td key={col} className="px-4 py-2.5 text-white/70 text-xs max-w-[200px]">
                          {col === 'photo_url' ? (
                            row[col] ? (
                              <div className="flex items-center gap-2">
                                <PhotoThumb url={row[col]} />
                                <span className="truncate text-white/30 text-xs" style={{ maxWidth: 80 }}>{row[col]}</span>
                              </div>
                            ) : <span className="text-white/20">—</span>
                          ) : (
                            <span className="truncate block" style={{ maxWidth: 160 }}>{row[col] || <span className="text-white/20">—</span>}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {sheetData.length > 20 && (
                <div className="px-4 py-3 text-xs text-white/30 text-center border-t border-white/05">
                  Showing 20 of {sheetData.length} records — all records will be used for generation
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {sheetData.length === 0 && (
        <div className="glass rounded-xl p-12 text-center text-white/20">
          <Table className="w-12 h-12 mx-auto mb-4" />
          <p>No data loaded yet. Connect a Google Sheet or load sample data.</p>
        </div>
      )}
    </div>
  )
}
