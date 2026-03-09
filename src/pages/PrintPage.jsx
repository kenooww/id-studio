import { useState, useRef } from 'react'
import { useAppStore } from '../store'
import { IDCard, getCardDimensions } from '../components/IDCard'
import toast from 'react-hot-toast'
import { Printer, Download, FileText, Info } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────
const A4_W        = 794
const A4_H        = 1123
const PAGE_PAD    = 30
const HEADER_H    = 28   // page header row height
const CARD_LABEL  = 14   // "#1 — Name" label height
const SIDE_LABEL  = 12   // "Back / Front" sub-label height
const ROW_GAP     = 12   // vertical gap between card rows
const COL_GAP     = 8    // horizontal gap between back & front card
const PREVIEW_SCALE = 0.72

// ── How many cards fit vertically per A4 page ─────────────────
// For portrait cards the slot height = card WIDTH (rotated 90°)
// For landscape cards the slot height = card HEIGHT
function calcCardsPerPage(template) {
  const { wPx, hPx } = getCardDimensions(template)
  const isPortrait = template.orientation === 'portrait'
  // Rotated portrait card: occupies hPx wide × wPx tall in the slot
  const slotH = isPortrait ? wPx : hPx
  const rowH  = CARD_LABEL + SIDE_LABEL + slotH + ROW_GAP
  const available = A4_H - PAGE_PAD * 2 - HEADER_H
  return Math.max(1, Math.floor((available + ROW_GAP) / rowH))
}

// ── Single A4 page renderer ───────────────────────────────────
function PrintPageA4({ template, records, pageIndex, cardsPerPage, mode }) {
  const { wPx, hPx } = getCardDimensions(template)
  const isPortrait = template.orientation === 'portrait'

  // Rotation angles
  const backAngle  = isPortrait ? 270 : 0
  const frontAngle = isPortrait ? 90  : 0

  // Slot dimensions:
  // Portrait card rotated 90°/270° → slot is hPx wide, wPx tall
  // Landscape card 0°              → slot is wPx wide, hPx tall
  const slotW = isPortrait ? hPx : wPx
  const slotH = isPortrait ? wPx : hPx

  const pageRecords = records.slice(pageIndex * cardsPerPage, (pageIndex + 1) * cardsPerPage)

  return (
    <div style={{
      width: `${A4_W}px`,
      height: `${A4_H}px`,
      boxSizing: 'border-box',
      padding: `${PAGE_PAD}px`,
      background: 'white',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'sans-serif',
    }}>
      {/* Page header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '20px',
        marginBottom: '8px',
        borderBottom: '0.5px solid #ddd',
        paddingBottom: '4px',
        fontSize: '9px',
        color: '#aaa',
        letterSpacing: '0.3px',
      }}>
        <span>IDForge — ID Cards</span>
        <span>
          Page {pageIndex + 1} · Cards {pageIndex * cardsPerPage + 1}–{pageIndex * cardsPerPage + pageRecords.length}
        </span>
      </div>

      {/* Card rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${ROW_GAP}px` }}>
        {pageRecords.map((record, i) => {
          const globalIdx = pageIndex * cardsPerPage + i + 1
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

              {/* Record label */}
              <div style={{
                height: `${CARD_LABEL}px`,
                lineHeight: `${CARD_LABEL}px`,
                fontSize: '8px',
                color: '#bbb',
                letterSpacing: '0.4px',
                textAlign: 'center',
                paddingBottom: '2px',
              }}>
                #{globalIdx} — {record.name || `Record ${globalIdx}`}
              </div>

              {/* Back + Front side by side */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: `${COL_GAP}px`,
                alignItems: 'flex-start',
                justifyContent: 'center',
              }}>

                {/* ── BACK (left) ── */}
                {(mode === 'both' || mode === 'back') && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      height: `${SIDE_LABEL}px`,
                      lineHeight: `${SIDE_LABEL}px`,
                      fontSize: '7px',
                      color: '#ccc',
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      marginBottom: '2px',
                    }}>
                      Back
                    </div>
                    {/* Slot box — fixed size preserves layout even when card is rotated */}
                    <div style={{
                      width: `${slotW}px`,
                      height: `${slotH}px`,
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${backAngle}deg)`,
                        transformOrigin: 'center center',
                      }}>
                        <IDCard template={template} data={record} side="back" scale={1} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── FRONT (right) ── */}
                {(mode === 'both' || mode === 'front') && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      height: `${SIDE_LABEL}px`,
                      lineHeight: `${SIDE_LABEL}px`,
                      fontSize: '7px',
                      color: '#ccc',
                      letterSpacing: '0.5px',
                      textAlign: 'center',
                      marginBottom: '2px',
                    }}>
                      Front
                    </div>
                    <div style={{
                      width: `${slotW}px`,
                      height: `${slotH}px`,
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${frontAngle}deg)`,
                        transformOrigin: 'center center',
                      }}>
                        <IDCard template={template} data={record} side="front" scale={1} />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main PrintPage component ──────────────────────────────────
export default function PrintPage() {
  const templates  = useAppStore(s => s.templates)
  const activeId   = useAppStore(s => s.activeTemplateId)
  const sheetData  = useAppStore(s => s.sheetData)
  const incrementGenerated = useAppStore(s => s.incrementGenerated)

  const [selectedTmplId, setSelectedTmplId] = useState(activeId || templates[0]?.id || '')
  const [mode, setMode]     = useState('both')
  const [exporting, setExporting] = useState(false)
  const printAreaRef = useRef()

  const template = templates.find(t => t.id === selectedTmplId)

  const sampleData = [
    { name: 'Andrea Brillantes',  id_number: 'EMP-001', photo_url: 'https://i.pravatar.cc/150?img=1',  extra_field: 'Grade 10', field_1: 'Blood: O+',  field_2: 'Emergency: 555-1234', field_3: 'Section A', field_4: '2024-01-15' },
    { name: 'Kathryn Alida',      id_number: 'EMP-002', photo_url: 'https://i.pravatar.cc/150?img=5',  extra_field: 'Grade 11', field_1: 'Blood: A+',  field_2: 'Emergency: 555-5678', field_3: 'Section B', field_4: '2024-02-20' },
    { name: 'student 1',          id_number: 'EMP-003', photo_url: 'https://i.pravatar.cc/150?img=8',  extra_field: 'Grade 9',  field_1: 'Blood: B+',  field_2: 'Emergency: 555-9012', field_3: 'Section C', field_4: '2024-03-10' },
    { name: 'Andrea Brillantes 1',id_number: 'EMP-004', photo_url: 'https://i.pravatar.cc/150?img=9',  extra_field: 'Grade 12', field_1: 'Blood: AB+', field_2: 'Emergency: 555-3456', field_3: 'Section D', field_4: '2024-01-05' },
  ]
  const data = sheetData.length > 0 ? sheetData : sampleData

  const cardsPerPage  = template ? calcCardsPerPage(template) : 4
  const totalPages    = Math.ceil(data.length / cardsPerPage)
  const isPortrait    = template?.orientation === 'portrait'
  const frontAngle    = isPortrait ? 90  : 0
  const backAngle     = isPortrait ? 270 : 0

  // ── Print handler (copied from CardForge) ─────────────────
  const handlePrint = () => {
    if (!template) return toast.error('Select a template first')
    incrementGenerated(data.length)

    const scaleWrappers = document.querySelectorAll('#print-area .print-page-wrap > div')
    const pageWrappers  = document.querySelectorAll('#print-area .print-page-wrap')

    scaleWrappers.forEach(el => {
      el.dataset.origTransform = el.style.transform || ''
      el.dataset.origPosition  = el.style.position  || ''
      el.style.transform = 'none'
      el.style.position  = 'relative'
    })
    pageWrappers.forEach(el => {
      el.dataset.origWidth  = el.style.width  || ''
      el.dataset.origHeight = el.style.height || ''
      el.dataset.origMargin = el.style.marginBottom || ''
      el.dataset.origShadow = el.style.boxShadow || ''
      el.style.width        = A4_W + 'px'
      el.style.height       = A4_H + 'px'
      el.style.marginBottom = '0'
      el.style.boxShadow    = 'none'
    })

    const style = document.createElement('style')
    style.id = '__print_style__'
    style.innerHTML = [
      '* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }',
      '@media print {',
      '  body > * { display: none !important; }',
      '  #print-area { display: flex !important; flex-direction: column !important; position: static !important; }',
      '  #print-area * { visibility: visible !important; }',
      '  body { margin: 0 !important; padding: 0 !important; background: white !important; }',
      '  .print-page-wrap { page-break-after: always !important; break-after: page !important; overflow: hidden !important; }',
      '  .print-page-wrap:last-child { page-break-after: auto !important; break-after: auto !important; }',
      `  @page { size: ${A4_W}px ${A4_H}px; margin: 0; }`,
      '}',
    ].join('\n')
    document.head.appendChild(style)

    const printArea = document.getElementById('print-area')
    const origParent = printArea?.parentNode
    const origSibling = printArea?.nextSibling
    if (printArea) document.body.appendChild(printArea)

    window.print()

    setTimeout(() => {
      document.head.removeChild(style)
      if (printArea && origParent) origParent.insertBefore(printArea, origSibling)
      scaleWrappers.forEach(el => {
        el.style.transform = el.dataset.origTransform
        el.style.position  = el.dataset.origPosition
      })
      pageWrappers.forEach(el => {
        el.style.width        = el.dataset.origWidth
        el.style.height       = el.dataset.origHeight
        el.style.marginBottom = el.dataset.origMargin
        el.style.boxShadow    = el.dataset.origShadow
      })
    }, 1500)
  }

  // ── PDF export ────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (!template) return toast.error('Select a template first')
    setExporting(true)
    const tid = toast.loading('Generating PDF…')
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const els = printAreaRef.current?.querySelectorAll('.print-page-inner')
      if (!els?.length) throw new Error('No pages found')
      for (let i = 0; i < els.length; i++) {
        const canvas = await html2canvas(els[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
        if (i > 0) pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297)
      }
      pdf.save(`id-cards-${Date.now()}.pdf`)
      incrementGenerated(data.length)
      toast.dismiss(tid)
      toast.success('PDF exported!')
    } catch (e) {
      toast.dismiss(tid)
      toast.error('Export failed: ' + e.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <div className="w-64 flex-shrink-0 bg-[#100e1f] border-r border-white/08 overflow-y-auto p-4 space-y-5">
        <h2 className="font-display font-semibold text-white text-lg">Print / Export</h2>

        <div>
          <label className="label">Template</label>
          <select value={selectedTmplId} onChange={e => setSelectedTmplId(e.target.value)} className="input-field">
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Print Mode</label>
          <div className="space-y-1.5">
            {[
              { v: 'both',  l: 'Back & Front (side by side)' },
              { v: 'front', l: 'Front Only' },
              { v: 'back',  l: 'Back Only' },
            ].map(o => (
              <label key={o.v} className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="mode" value={o.v} checked={mode === o.v}
                  onChange={() => setMode(o.v)} className="accent-violet-500" />
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">{o.l}</span>
              </label>
            ))}
          </div>
        </div>

        {template && (
          <div className="glass rounded-xl p-3 space-y-1 text-xs text-white/40">
            <p className="text-white/60 font-medium mb-2">Layout Summary</p>
            <p>{data.length} records · {totalPages} page{totalPages !== 1 ? 's' : ''}</p>
            <p>{cardsPerPage} card{cardsPerPage !== 1 ? 's' : ''} per page</p>
            <p className="capitalize">{template.orientation} orientation</p>
          </div>
        )}

        {template && (
          <div className="glass rounded-xl p-3 border border-violet-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">Rotation</span>
            </div>
            <div className="flex gap-2 text-xs">
              <div className="flex flex-col items-center glass rounded p-2 flex-1">
                <span className="text-white/40 mb-0.5">Back (left)</span>
                <span className="font-mono text-white font-bold">{backAngle}°</span>
              </div>
              <div className="flex flex-col items-center glass rounded p-2 flex-1">
                <span className="text-white/40 mb-0.5">Front (right)</span>
                <span className="font-mono text-white font-bold">{frontAngle}°</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-1 border-t border-white/08">
          <button onClick={handlePrint} disabled={!template}
            className="w-full btn-primary justify-center py-2.5 disabled:opacity-40">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handleExportPDF} disabled={exporting || !template}
            className="w-full btn-secondary justify-center py-2.5 disabled:opacity-40">
            {exporting
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Download className="w-4 h-4" />
            }
            Export PDF
          </button>
        </div>

        <div className="glass rounded-lg p-3 text-xs text-white/30 space-y-1 leading-relaxed">
          <p>💡 Enable <strong className="text-white/50">Background graphics</strong> in print dialog</p>
          <p>💡 Back card on <strong className="text-white/50">left</strong>, Front on <strong className="text-white/50">right</strong></p>
          {isPortrait && <p>💡 Portrait: Back 270° · Front 90°</p>}
        </div>
      </div>

      {/* ── Print Preview Area ───────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto flex flex-col items-center py-10"
        style={{
          background: '#0d0d0d',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {!template ? (
          <div className="flex items-center justify-center h-full text-white/20 text-center">
            <div>
              <FileText className="w-14 h-14 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Select a template to preview</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '10px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Print Preview — {data.length} records · {totalPages} page{totalPages !== 1 ? 's' : ''} · {cardsPerPage} cards/page
            </div>

            {/* Pages */}
            <div id="print-area" ref={printAreaRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <div
                  key={pageIndex}
                  className="print-page-wrap"
                  style={{
                    width:  `${A4_W * PREVIEW_SCALE}px`,
                    height: `${A4_H * PREVIEW_SCALE}px`,
                    marginBottom: '20px',
                    position: 'relative',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
                    flexShrink: 0,
                  }}
                >
                  {/* Scale wrapper — actual A4 dimensions scaled down to preview */}
                  <div
                    className="print-page-inner"
                    style={{
                      transformOrigin: 'top left',
                      transform: `scale(${PREVIEW_SCALE})`,
                      width:  `${A4_W}px`,
                      height: `${A4_H}px`,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  >
                    <PrintPageA4
                      template={template}
                      records={data}
                      pageIndex={pageIndex}
                      cardsPerPage={cardsPerPage}
                      mode={mode}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
