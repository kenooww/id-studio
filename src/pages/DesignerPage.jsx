import { useState, useRef, useCallback } from 'react'
import { useAppStore } from '../store'
import { IDCard, getCardDimensions } from '../components/IDCard'
import { FieldRenderer } from '../components/IDCard'
import toast from 'react-hot-toast'
import {
  Type, Image, QrCode, AlignLeft, AlignCenter, AlignRight, ZoomIn, ZoomOut, RotateCcw,
  Layers, Lock, Unlock, Trash2, Copy, Eye, EyeOff, Plus,
  ChevronDown, Move, Square, Barcode, ArrowUp, ArrowDown,
  RectangleHorizontal, RectangleVertical
} from 'lucide-react'

const FIELD_TYPES = [
  { type: 'text', label: 'Text', icon: Type, dataKey: 'name' },
  { type: 'photo', label: 'Photo', icon: Image, dataKey: 'photo_url' },
  { type: 'qr', label: 'QR Code', icon: QrCode, dataKey: 'id_number' },
  { type: 'barcode', label: 'Barcode', icon: Barcode, dataKey: 'id_number' },
  { type: 'shape', label: 'Shape', icon: Square, dataKey: '' },
]

const DATA_KEYS_FRONT = ['name', 'id_number', 'photo_url', 'extra_field', 'position', 'department']
const DATA_KEYS_BACK = ['field_1', 'field_2', 'field_3', 'field_4', 'address', 'phone']

const FONT_FAMILIES = [
  'Arial, sans-serif',
  '"Helvetica Neue", Helvetica, sans-serif',
  'Georgia, serif',
  '"Times New Roman", serif',
  '"Courier New", monospace',
  'Verdana, sans-serif',
  'Tahoma, sans-serif',
  'Trebuchet MS, sans-serif',
  '"Palatino Linotype", serif',
  'Impact, sans-serif',
  '"Comic Sans MS", cursive',
  '"Segoe UI", sans-serif',
]
const FONT_WEIGHTS = ['100', '200', '300', 'normal', '500', '600', 'bold', '800', '900']
const TEXT_ALIGNS = ['left', 'center', 'right']

function PropertyPanel({ field, side, onUpdate, onDelete, onDuplicate }) {
  if (!field) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/20 text-center p-6">
        <Layers className="w-10 h-10 mb-3" />
        <p className="text-sm">Select a field to edit its properties</p>
      </div>
    )
  }

  const s = field.styles || {}
  const update = (key, val) => onUpdate({ styles: { ...s, [key]: val } })

  return (
    <div className="overflow-y-auto no-scrollbar">
      {/* Field info */}
      <div className="p-4 border-b border-white/08">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/50 uppercase tracking-wider">Field Properties</span>
          <div className="flex gap-1">
            <button onClick={onDuplicate} className="p-1.5 glass rounded hover:bg-white/10 transition-colors" title="Duplicate">
              <Copy className="w-3.5 h-3.5 text-white/60" />
            </button>
            <button onClick={onDelete} className="p-1.5 glass rounded hover:bg-red-500/20 transition-colors" title="Delete">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <label className="label">Label</label>
            <input type="text" value={field.label || ''} onChange={e => onUpdate({ label: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label">Data Key</label>
            <select value={field.dataKey || ''} onChange={e => onUpdate({ dataKey: e.target.value })} className="input-field">
              <option value="">-- none --</option>
              {(side === 'front' ? DATA_KEYS_FRONT : DATA_KEYS_BACK).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Position & Size */}
      <div className="p-4 border-b border-white/08">
        <p className="label mb-3">Position & Size</p>
        <div className="grid grid-cols-2 gap-2">
          {[['X', 'x'], ['Y', 'y'], ['W', 'width'], ['H', 'height']].map(([lbl, key]) => (
            <div key={key}>
              <label className="label">{lbl}</label>
              <input type="number" value={Math.round(field[key] || 0)}
                onChange={e => onUpdate({ [key]: Number(e.target.value) })}
                className="input-field" />
            </div>
          ))}
          <div>
            <label className="label">Rotation</label>
            <input type="number" value={field.rotation || 0}
              onChange={e => onUpdate({ rotation: Number(e.target.value) })}
              className="input-field" step="15" />
          </div>
          <div>
            <label className="label">Z-Index</label>
            <input type="number" value={field.zIndex || 1}
              onChange={e => onUpdate({ zIndex: Number(e.target.value) })}
              className="input-field" min="1" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => onUpdate({ locked: !field.locked })}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded glass transition-colors ${field.locked ? 'text-amber-400' : 'text-white/50'}`}>
            {field.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            {field.locked ? 'Locked' : 'Unlocked'}
          </button>
        </div>
      </div>

      {/* Text styles */}
      {field.type === 'text' && (
        <div className="p-4 border-b border-white/08 space-y-4">
          <p className="label">Text Style</p>

          {/* Live preview */}
          <div style={{
            background: 'linear-gradient(135deg,#1e1044,#0f2156)',
            borderRadius: 8, padding: '10px 14px',
            display: 'flex', alignItems: 'center', justifyContent: s.textAlign === 'right' ? 'flex-end' : s.textAlign === 'center' ? 'center' : 'flex-start',
            minHeight: 44, border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{
              fontFamily: s.fontFamily || 'Arial, sans-serif',
              fontSize: Math.min(s.fontSize || 14, 22),
              color: s.fontColor || '#ffffff',
              fontWeight: s.fontWeight || 'normal',
              fontStyle: s.fontStyle || 'normal',
              letterSpacing: s.letterSpacing || 0,
              textDecoration: s.textDecoration || 'none',
              textTransform: s.textTransform || 'none',
              WebkitTextStroke: (s.strokeWidth || 0) > 0 ? `${s.strokeWidth}px ${s.strokeColor || s.stroke || '#000000'}` : undefined,
              paintOrder: 'stroke fill',
              textShadow: (s.shadowBlur || 0) > 0 ? `${s.shadowX || 0}px ${s.shadowY || 2}px ${s.shadowBlur}px ${s.shadowColor || 'rgba(0,0,0,0.8)'}` : undefined,
            }}>
              {field.label || 'Preview Text'}
            </span>
          </div>

          {/* Font family */}
          <div>
            <label className="label">Font Family</label>
            <select value={s.fontFamily || 'Arial, sans-serif'} onChange={e => update('fontFamily', e.target.value)} className="input-field">
              {FONT_FAMILIES.map(f => <option key={f} value={f}>{f.split(',')[0]}</option>)}
            </select>
          </div>

          {/* Size + Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Size (px)</label>
              <input type="number" value={s.fontSize || 14} onChange={e => update('fontSize', Number(e.target.value))} className="input-field" min="6" max="120" />
            </div>
            <div>
              <label className="label">Weight</label>
              <select value={s.fontWeight || 'normal'} onChange={e => update('fontWeight', e.target.value)} className="input-field">
                {FONT_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {/* Font style toggles: Italic / Underline / Uppercase */}
          <div>
            <label className="label">Style</label>
            <div className="flex gap-1.5">
              {[
                { key: 'fontStyle',      on: 'italic',     off: 'normal',   label: 'I', title: 'Italic',     style: { fontStyle: 'italic', fontWeight: 'bold' } },
                { key: 'textDecoration', on: 'underline',  off: 'none',     label: 'U', title: 'Underline',  style: { textDecoration: 'underline' } },
                { key: 'textTransform',  on: 'uppercase',  off: 'none',     label: 'AA', title: 'Uppercase', style: { fontSize: 9, letterSpacing: 1 } },
                { key: 'textTransform',  on: 'capitalize', off: 'none',     label: 'Aa', title: 'Capitalize', style: { fontSize: 9 } },
              ].map(({ key, on, off, label, title, style: btnStyle }) => {
                const isOn = s[key] === on
                return (
                  <button
                    key={title}
                    title={title}
                    onClick={() => update(key, isOn ? off : on)}
                    className={`flex-1 py-2 rounded-lg glass flex items-center justify-center transition-all border text-xs font-medium ${
                      isOn
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'
                    }`}
                    style={btnStyle}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color + Align */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Color</label>
              <div className="flex gap-1.5">
                <input type="color" value={s.fontColor || '#ffffff'} onChange={e => update('fontColor', e.target.value)}
                  className="w-9 h-9 rounded bg-transparent border border-white/10 cursor-pointer" />
                <input type="text" value={s.fontColor || '#ffffff'} onChange={e => update('fontColor', e.target.value)}
                  className="input-field flex-1 font-mono text-xs" />
              </div>
            </div>
            <div>
              <label className="label">Align</label>
              <div className="flex gap-1">
                {[
                  { value: 'left',   Icon: AlignLeft,   title: 'Left' },
                  { value: 'center', Icon: AlignCenter, title: 'Center' },
                  { value: 'right',  Icon: AlignRight,  title: 'Right' },
                ].map(({ value, Icon, title }) => (
                  <button key={value} onClick={() => update('textAlign', value)} title={title}
                    className={`flex-1 py-2 rounded-lg glass flex items-center justify-center transition-all border ${
                      s.textAlign === value
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'
                    }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Letter spacing + Line height */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Spacing</label>
              <input type="number" value={s.letterSpacing || 0} onChange={e => update('letterSpacing', Number(e.target.value))} className="input-field" />
            </div>
            <div>
              <label className="label">Line Ht</label>
              <input type="number" value={s.lineHeight || 1.4} onChange={e => update('lineHeight', Number(e.target.value))} className="input-field" step="0.1" />
            </div>
          </div>

          {/* ── Stroke ── */}
          <div className="rounded-lg border border-white/08 overflow-hidden">
            <div className="px-3 py-2 bg-white/03 flex items-center justify-between">
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Stroke</span>
              <button
                onClick={() => update('strokeWidth', (s.strokeWidth || 0) > 0 ? 0 : 2)}
                className={`text-xs px-2 py-0.5 rounded transition-all ${(s.strokeWidth || 0) > 0 ? 'bg-violet-600/40 text-violet-300' : 'glass text-white/30 hover:text-white'}`}>
                {(s.strokeWidth || 0) > 0 ? 'On' : 'Off'}
              </button>
            </div>
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Color</label>
                  <div className="flex gap-1.5">
                    <input type="color"
                      value={s.strokeColor || s.stroke || '#000000'}
                      onChange={e => { update('strokeColor', e.target.value); update('stroke', e.target.value) }}
                      className="w-9 h-9 rounded bg-transparent border border-white/10 cursor-pointer" />
                    <input type="text"
                      value={s.strokeColor || s.stroke || '#000000'}
                      onChange={e => { update('strokeColor', e.target.value); update('stroke', e.target.value) }}
                      className="input-field flex-1 font-mono text-xs" />
                  </div>
                </div>
                <div>
                  <label className="label">Width (px)</label>
                  <input type="number"
                    value={s.strokeWidth || 0}
                    onChange={e => update('strokeWidth', Number(e.target.value))}
                    className="input-field" min="0" max="20" step="0.5" />
                </div>
              </div>
              {/* Stroke width slider */}
              <div>
                <input type="range"
                  min="0" max="12" step="0.5"
                  value={s.strokeWidth || 0}
                  onChange={e => update('strokeWidth', Number(e.target.value))}
                  className="w-full" />
                <div className="flex justify-between text-xs text-white/20 mt-0.5">
                  <span>0</span><span>6</span><span>12</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Text Shadow ── */}
          <div className="rounded-lg border border-white/08 overflow-hidden">
            <div className="px-3 py-2 bg-white/03 flex items-center justify-between">
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Shadow</span>
              <button
                onClick={() => update('shadowBlur', (s.shadowBlur || 0) > 0 ? 0 : 4)}
                className={`text-xs px-2 py-0.5 rounded transition-all ${(s.shadowBlur || 0) > 0 ? 'bg-violet-600/40 text-violet-300' : 'glass text-white/30 hover:text-white'}`}>
                {(s.shadowBlur || 0) > 0 ? 'On' : 'Off'}
              </button>
            </div>
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label">X</label>
                  <input type="number" value={s.shadowX || 0} onChange={e => update('shadowX', Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="label">Y</label>
                  <input type="number" value={s.shadowY || 2} onChange={e => update('shadowY', Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="label">Blur</label>
                  <input type="number" value={s.shadowBlur || 0} onChange={e => update('shadowBlur', Number(e.target.value))} className="input-field" min="0" />
                </div>
              </div>
              <div>
                <label className="label">Shadow Color</label>
                <div className="flex gap-1.5">
                  <input type="color"
                    value={s.shadowColor || '#000000'}
                    onChange={e => update('shadowColor', e.target.value)}
                    className="w-9 h-9 rounded bg-transparent border border-white/10 cursor-pointer" />
                  <input type="text"
                    value={s.shadowColor || 'rgba(0,0,0,0.8)'}
                    onChange={e => update('shadowColor', e.target.value)}
                    className="input-field flex-1 font-mono text-xs" placeholder="rgba(0,0,0,0.8)" />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Image styles */}
      {(field.type === 'photo' || field.type === 'image') && (
        <div className="p-4 border-b border-white/08 space-y-3">
          <p className="label">Image Style</p>
          <div>
            <label className="label">Border Radius</label>
            <input type="number" value={s.borderRadius || 0} onChange={e => update('borderRadius', Number(e.target.value))} className="input-field" min="0" max="200" />
          </div>
          <div>
            <label className="label">Opacity (%)</label>
            <input type="range" value={(s.opacity ?? 1) * 100} onChange={e => update('opacity', Number(e.target.value) / 100)} className="w-full" min="0" max="100" />
            <span className="text-xs text-white/40">{Math.round((s.opacity ?? 1) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Shape styles */}
      {field.type === 'shape' && (
        <div className="p-4 border-b border-white/08 space-y-3">
          <p className="label">Shape Style</p>
          <div>
            <label className="label">Background Color</label>
            <div className="flex gap-1.5">
              <input type="color" value={s.backgroundColor || '#ffffff'} onChange={e => update('backgroundColor', e.target.value)}
                className="w-9 h-9 rounded bg-transparent border border-white/10 cursor-pointer" />
              <input type="text" value={s.backgroundColor || '#ffffff'} onChange={e => update('backgroundColor', e.target.value)}
                className="input-field flex-1 font-mono text-xs" />
            </div>
          </div>
          <div>
            <label className="label">Border Radius</label>
            <input type="number" value={s.borderRadius || 0} onChange={e => update('borderRadius', Number(e.target.value))} className="input-field" />
          </div>
        </div>
      )}
    </div>
  )
}

// Draggable field overlay on canvas
function DraggableField({ field, scale, isSelected, onSelect, onUpdate, canvasRef }) {
  const dragStart = useRef(null)

  const handleMouseDown = (e) => {
    if (field.locked) return
    e.stopPropagation()
    onSelect()
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      fieldX: field.x,
      fieldY: field.y,
    }

    const onMove = (me) => {
      if (!dragStart.current) return
      const dx = (me.clientX - dragStart.current.mouseX) / scale
      const dy = (me.clientY - dragStart.current.mouseY) / scale
      onUpdate({ x: Math.max(0, dragStart.current.fieldX + dx), y: Math.max(0, dragStart.current.fieldY + dy) })
    }

    const onUp = () => {
      dragStart.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Outer div handles position/size/rotation — FieldRenderer fills it in inline mode
  const outerStyle = {
    position: 'absolute',
    left: field.x * scale,
    top: field.y * scale,
    width: field.width * scale,
    height: field.height * scale,
    transform: `rotate(${field.rotation || 0}deg)`,
    zIndex: (field.zIndex || 1) + 100,
    cursor: field.locked ? 'not-allowed' : 'move',
    outline: isSelected ? '2px solid #8b5cf6' : 'none',
    outlineOffset: isSelected ? '1px' : '0',
    boxSizing: 'border-box',
    overflow: 'hidden',
  }

  return (
    <div style={outerStyle} onMouseDown={handleMouseDown}>
      {/* inline=true → FieldRenderer fills the box without re-applying position/rotation */}
      <FieldRenderer field={field} data={{}} scale={scale} inline={true} />

      {/* Resize handle SE */}
      {isSelected && !field.locked && (
        <div
          onMouseDown={e => {
            e.stopPropagation()
            const start = { x: e.clientX, y: e.clientY, w: field.width, h: field.height }
            const onMove = (me) => {
              const dw = (me.clientX - start.x) / scale
              const dh = (me.clientY - start.y) / scale
              onUpdate({ width: Math.max(20, start.w + dw), height: Math.max(10, start.h + dh) })
            }
            const onUp = () => {
              window.removeEventListener('mousemove', onMove)
              window.removeEventListener('mouseup', onUp)
            }
            window.addEventListener('mousemove', onMove)
            window.addEventListener('mouseup', onUp)
          }}
          style={{
            position: 'absolute', right: -5, bottom: -5,
            width: 10, height: 10, background: '#8b5cf6',
            borderRadius: 2, cursor: 'se-resize', zIndex: 999,
          }}
        />
      )}
    </div>
  )
}

export default function DesignerPage() {
  const templates = useAppStore(s => s.templates)
  const activeTemplateId = useAppStore(s => s.activeTemplateId)
  const setActiveTemplate = useAppStore(s => s.setActiveTemplate)
  const designerSide = useAppStore(s => s.designerSide)
  const setDesignerSide = useAppStore(s => s.setDesignerSide)
  const selectedFieldId = useAppStore(s => s.selectedFieldId)
  const setSelectedField = useAppStore(s => s.setSelectedField)
  const zoom = useAppStore(s => s.zoom)
  const setZoom = useAppStore(s => s.setZoom)
  const updateTemplate = useAppStore(s => s.updateTemplate)
  const addField = useAppStore(s => s.addField)
  const updateField = useAppStore(s => s.updateField)
  const deleteField = useAppStore(s => s.deleteField)
  const duplicateField = useAppStore(s => s.duplicateField)

  const template = templates.find(t => t.id === activeTemplateId)
  const canvasRef = useRef()

  const fields = template ? (designerSide === 'front' ? template.frontFields : template.backFields) : []
  const selectedField = fields?.find(f => f.id === selectedFieldId)

  const { wPx, hPx } = template ? getCardDimensions(template) : { wPx: 323, hPx: 204 }

  const handleAddField = (type) => {
    const defaults = {
      text: { label: 'Text', dataKey: 'name', width: 120, height: 24, styles: { fontSize: 14, fontColor: '#ffffff', fontFamily: 'Arial, sans-serif', fontWeight: 'normal', textAlign: 'left', letterSpacing: 0, lineHeight: 1.4 } },
      photo: { label: 'Photo', dataKey: 'photo_url', width: 60, height: 75, styles: { borderRadius: 4, opacity: 1 } },
      qr: { label: 'QR Code', dataKey: 'id_number', width: 50, height: 50, styles: {} },
      barcode: { label: 'Barcode', dataKey: 'id_number', width: 160, height: 40, styles: {} },
      shape: { label: 'Shape', dataKey: '', width: 80, height: 40, styles: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 } },
    }
    addField(designerSide, { type, ...defaults[type] })
    toast.success(`${type} added`)
  }

  const handleUpdateField = (updates) => {
    if (selectedFieldId) updateField(designerSide, selectedFieldId, updates)
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-center p-8">
        <div>
          <Layers className="w-12 h-12 mx-auto mb-4" />
          <p>No template selected. Go to Templates and select one.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left toolbar */}
      <div className="w-16 flex-shrink-0 bg-[#100e1f] border-r border-white/08 flex flex-col items-center py-4 gap-2">
        <div className="text-xs text-white/20 mb-2 uppercase tracking-wider" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', fontSize: 9 }}>
          Elements
        </div>
        {FIELD_TYPES.map(ft => (
          <button key={ft.type} onClick={() => handleAddField(ft.type)}
            title={`Add ${ft.label}`}
            className="w-10 h-10 flex items-center justify-center glass rounded-lg text-white/50 hover:text-violet-400 hover:bg-violet-600/10 transition-all">
            <ft.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Center canvas area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-12 flex-shrink-0 bg-[#100e1f] border-b border-white/08 flex items-center px-4 gap-4">
          {/* Template selector */}
          <select value={activeTemplateId} onChange={e => setActiveTemplate(e.target.value)}
            className="text-sm glass rounded px-2 py-1 text-white/70 border-none outline-none max-w-40">
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <div className="w-px h-5 bg-white/10" />

          {/* Front/back toggle */}
          <div className="flex glass rounded-lg p-0.5">
            {['front', 'back'].map(side => (
              <button key={side} onClick={() => setDesignerSide(side)}
                className={`px-3 py-1 text-xs rounded-md capitalize font-medium transition-all ${
                  designerSide === side ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'
                }`}>
                {side}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Orientation toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/30 hidden sm:block">Orientation</span>
            <div className="flex glass rounded-lg p-0.5">
              <button
                onClick={() => { updateTemplate(activeTemplateId, { orientation: 'landscape' }); toast.success('Landscape') }}
                title="Landscape"
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  template?.orientation === 'landscape' ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'
                }`}>
                <RectangleHorizontal className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Landscape</span>
              </button>
              <button
                onClick={() => { updateTemplate(activeTemplateId, { orientation: 'portrait' }); toast.success('Portrait') }}
                title="Portrait"
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  template?.orientation === 'portrait' ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'
                }`}>
                <RectangleVertical className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Portrait</span>
              </button>
            </div>
          </div>

          <div className="flex-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(Math.max(0.3, zoom - 0.1))} className="p-1.5 glass rounded hover:bg-white/10 transition-colors">
              <ZoomOut className="w-4 h-4 text-white/60" />
            </button>
            <span className="text-xs text-white/40 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1.5 glass rounded hover:bg-white/10 transition-colors">
              <ZoomIn className="w-4 h-4 text-white/60" />
            </button>
            <button onClick={() => setZoom(1)} className="text-xs glass rounded px-2 py-1 text-white/40 hover:text-white transition-colors">
              Fit
            </button>
          </div>
        </div>

        {/* Canvas area */}
        <div
          className="flex-1 overflow-auto flex items-center justify-center"
          style={{ background: 'radial-gradient(ellipse at center, #1a1530 0%, #0d0b1a 100%)', backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          onClick={() => setSelectedField(null)}
        >
          <div style={{ padding: 60 }}>
            <div
              ref={canvasRef}
              style={{
                position: 'relative',
                width: wPx * zoom,
                height: hPx * zoom,
                boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
                borderRadius: 6,
                overflow: 'hidden',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Background */}
              {template[`${designerSide}Layout`] ? (
                <img src={template[`${designerSide}Layout`]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              ) : (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: designerSide === 'front'
                    ? 'linear-gradient(135deg, #1e1044 0%, #0f2156 100%)'
                    : 'linear-gradient(135deg, #0f2156 0%, #1e1044 100%)',
                }} />
              )}

              {/* Grid overlay */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              }} />

              {/* Draggable fields */}
              {fields?.map(field => (
                <DraggableField
                  key={field.id}
                  field={field}
                  scale={zoom}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => setSelectedField(field.id)}
                  onUpdate={(upd) => updateField(designerSide, field.id, upd)}
                  canvasRef={canvasRef}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="h-8 bg-[#100e1f] border-t border-white/08 flex items-center px-4 gap-4 text-xs text-white/30">
          <span>{fields?.length || 0} elements</span>
          <span>·</span>
          <span>{template.orientation} · {template.cardSize}</span>
          <span>·</span>
          <span>{Math.round(wPx)}×{Math.round(hPx)}px</span>
          {selectedField && (
            <>
              <span>·</span>
              <span className="text-violet-400">{selectedField.label} selected</span>
            </>
          )}
        </div>
      </div>

      {/* Right property panel */}
      <div className="w-64 flex-shrink-0 bg-[#100e1f] border-l border-white/08 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-white/08">
          <span className="text-xs text-white/50 uppercase tracking-wider">Properties</span>
        </div>

        {/* Layers panel */}
        <div className="border-b border-white/08">
          <div className="p-3">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Layers</p>
            <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
              {[...(fields || [])].reverse().map(field => (
                <div
                  key={field.id}
                  onClick={() => setSelectedField(field.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                    selectedFieldId === field.id ? 'bg-violet-600/20 text-violet-300' : 'text-white/50 hover:text-white hover:bg-white/05'
                  }`}
                >
                  {field.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Layers className="w-3 h-3" />}
                  <span className="flex-1 truncate">{field.label}</span>
                  <span className="text-white/20 text-xs">{field.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <PropertyPanel
            field={selectedField}
            side={designerSide}
            onUpdate={handleUpdateField}
            onDelete={() => { deleteField(designerSide, selectedFieldId); toast.success('Field deleted') }}
            onDuplicate={() => { duplicateField(designerSide, selectedFieldId); toast.success('Field duplicated') }}
          />
        </div>
      </div>
    </div>
  )
}
