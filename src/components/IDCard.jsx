import { useEffect, useRef, useState } from 'react'

// Card dimensions in mm -> px (at 96dpi screen)
export const CARD_SIZES = {
  cr80: { w: 85.6, h: 54 },
  custom: { w: 100, h: 60 },
}

const MM_TO_PX = 3.7795

export function getCardDimensions(template) {
  const size = CARD_SIZES[template.cardSize] || CARD_SIZES.cr80
  const wMm = template.orientation === 'landscape' ? size.w : size.h
  const hMm = template.orientation === 'landscape' ? size.h : size.w
  return { wMm, hMm, wPx: wMm * MM_TO_PX, hPx: hMm * MM_TO_PX }
}

// Simple QR Code renderer using canvas
function QRBlock({ value = '', width = 50, height = 50 }) {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // Simple placeholder QR pattern
    ctx.fillStyle = '#000'
    const cell = Math.floor(canvas.width / 7)
    const pattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,0,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1],
    ]
    pattern.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v) ctx.fillRect(c * cell, r * cell, cell, cell)
      })
    )
    // Random data cells to simulate QR
    for (let i = 0; i < 20; i++) {
      const r = 1 + Math.floor(Math.random() * 5)
      const c = 1 + Math.floor(Math.random() * 5)
      ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff'
      ctx.fillRect(c * cell, r * cell, cell, cell)
    }
  }, [value])

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height, imageRendering: 'pixelated' }} />
}

function BarcodeBlock({ value = '', width = 150, height = 40 }) {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#000'
    // Simulate barcode bars
    const barWidth = canvas.width / (value.length * 8 + 10)
    let x = barWidth * 2
    for (let i = 0; i < value.length * 8; i++) {
      if (Math.random() > 0.4) {
        ctx.fillRect(x, 2, barWidth, canvas.height - 6)
      }
      x += barWidth + 0.5
    }
  }, [value])

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />
}

// Resolve field value from data row — tries dataKey first, then common aliases
function resolveValue(field, data) {
  if (!data) return ''
  // Direct key match
  if (field.dataKey && data[field.dataKey] !== undefined && data[field.dataKey] !== '') {
    return data[field.dataKey]
  }
  // Common field aliases so data always shows even if dataKey slightly differs
  const aliases = {
    name:        ['name', 'full_name', 'fullname', 'Full Name', 'employee_name'],
    id_number:   ['id_number', 'id', 'employee_id', 'emp_id', 'ID', 'Employee ID'],
    photo_url:   ['photo_url', 'photo', 'image', 'picture', 'pic', 'Photo', 'Image'],
    extra_field: ['extra_field', 'position', 'department', 'grade', 'section'],
    field_1:     ['field_1', 'field1', 'guardian', 'blood_type'],
    field_2:     ['field_2', 'field2', 'address', 'emergency'],
    field_3:     ['field_3', 'field3', 'contact', 'phone'],
    field_4:     ['field_4', 'field4', 'school_year', 'birthday', 'date'],
  }
  const group = aliases[field.dataKey]
  if (group) {
    for (const key of group) {
      if (data[key] !== undefined && data[key] !== '') return data[key]
    }
  }
  // Last resort: look for case-insensitive match
  const lower = (field.dataKey || '').toLowerCase()
  for (const [k, v] of Object.entries(data)) {
    if (k.toLowerCase() === lower && v !== '') return v
  }
  return ''
}

// Resolve photo src — tries dataKey and all photo-like keys in the row
function resolvePhoto(field, data) {
  if (!data) return ''
  const direct = data[field.dataKey]
  if (direct) return direct
  // Try common photo keys
  for (const key of ['photo_url', 'photo', 'image', 'picture', 'pic', 'Image', 'Photo']) {
    if (data[key]) return data[key]
  }
  return ''
}

// Convert various photo URL formats to a directly loadable URL
function normalizePhotoUrl(url) {
  if (!url) return ''
  // Google Drive share link → direct thumbnail
  // Format: https://drive.google.com/file/d/FILE_ID/view
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveMatch) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w200`
  }
  // Google Drive open link: https://drive.google.com/open?id=FILE_ID
  const driveOpen = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (driveOpen && url.includes('drive.google.com')) {
    return `https://drive.google.com/thumbnail?id=${driveOpen[1]}&sz=w200`
  }
  return url
}

function PhotoField({ field, data, scale, baseStyle, s }) {
  const [imgError, setImgError] = useState(false)
  const rawSrc = resolvePhoto(field, data)
  const src = normalizePhotoUrl(rawSrc)

  // Reset error state when src changes
  const [lastSrc, setLastSrc] = useState(src)
  if (src !== lastSrc) {
    setLastSrc(src)
    setImgError(false)
  }

  const showPlaceholder = !src || imgError

  return (
    <div style={{
      ...baseStyle,
      borderRadius: (s.borderRadius || 0) * scale,
      opacity: s.opacity ?? 1,
      overflow: 'hidden',
      backgroundColor: '#2a2a2a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {!showPlaceholder && (
        <img
          key={src}
          src={src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: s.objectFit || 'cover', display: 'block' }}
          onError={() => setImgError(true)}
        />
      )}
      {showPlaceholder && (
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg,#3a3a4a,#1a1a2a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 2 * scale,
        }}>
          <svg width={20 * scale} height={20 * scale} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          {scale > 0.5 && <span style={{ fontSize: 7 * scale, color: '#555', letterSpacing: 1 }}>PHOTO</span>}
        </div>
      )}
    </div>
  )
}

export function FieldRenderer({ field, data = {}, scale = 1, inline = false }) {
  const value = resolveValue(field, data)
  const s = field.styles || {}

  // inline=true → used inside DraggableField which already handles position/size/rotation
  // inline=false → used inside IDCard which needs absolute positioning
  const baseStyle = inline ? {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  } : {
    position: 'absolute',
    left: field.x * scale,
    top: field.y * scale,
    width: field.width * scale,
    height: field.height * scale,
    transform: `rotate(${field.rotation || 0}deg)`,
    zIndex: field.zIndex || 1,
    overflow: 'hidden',
  }

  if (field.type === 'text') {
    const align = s.textAlign || 'left'
    const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' }
    const strokeVal = s.strokeWidth > 0
      ? `${s.strokeWidth * scale}px ${s.strokeColor || s.stroke || '#000000'}`
      : undefined
    const shadowVal = (s.shadowBlur || 0) > 0
      ? `${(s.shadowX || 0) * scale}px ${(s.shadowY || 2) * scale}px ${(s.shadowBlur || 0) * scale}px ${s.shadowColor || 'rgba(0,0,0,0.8)'}`
      : undefined
    return (
      <div style={{
        ...baseStyle,
        fontFamily: s.fontFamily || 'Arial, sans-serif',
        fontSize: (s.fontSize || 14) * scale,
        color: s.fontColor || '#ffffff',
        fontWeight: s.fontWeight || 'normal',
        fontStyle: s.fontStyle || 'normal',
        letterSpacing: s.letterSpacing || 0,
        lineHeight: s.lineHeight || 1.4,
        textAlign: align,
        WebkitTextStroke: strokeVal,
        paintOrder: 'stroke fill',
        textShadow: shadowVal,
        display: 'flex',
        alignItems: 'center',
        justifyContent: justifyMap[align] || 'flex-start',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}>
        <span style={{
          display: 'block', width: '100%', textAlign: align,
          overflow: 'hidden', textOverflow: 'ellipsis',
          textDecoration: s.textDecoration || 'none',
          textTransform: s.textTransform || 'none',
        }}>
          {value || <span style={{ opacity: 0.3, fontStyle: 'italic', WebkitTextStroke: 'unset', textShadow: 'none', textDecoration: 'none', textTransform: 'none' }}>{field.label}</span>}
        </span>
      </div>
    )
  }

  if (field.type === 'photo' || field.type === 'image') {
    return <PhotoField field={field} data={data} scale={scale} baseStyle={baseStyle} s={s} />
  }

  if (field.type === 'qr') {
    return (
      <div style={{ ...baseStyle, opacity: s.opacity ?? 1 }}>
        <QRBlock value={value} width={field.width * scale} height={field.height * scale} />
      </div>
    )
  }

  if (field.type === 'barcode') {
    return (
      <div style={{ ...baseStyle, opacity: s.opacity ?? 1 }}>
        <BarcodeBlock value={value} width={field.width * scale} height={field.height * scale} />
      </div>
    )
  }

  if (field.type === 'shape') {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: s.backgroundColor || 'rgba(255,255,255,0.2)',
        borderRadius: s.borderRadius || 0,
        border: s.border || 'none',
      }} />
    )
  }

  return null
}

export function IDCard({ template, data = {}, side = 'front', scale = 1, style = {}, className = '', showGrid = false }) {
  const { wPx, hPx } = getCardDimensions(template)
  const fields = side === 'front' ? (template.frontFields || []) : (template.backFields || [])
  const layout = side === 'front' ? template.frontLayout : template.backLayout
  const sorted = [...fields].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1))

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: wPx * scale,
        height: hPx * scale,
        overflow: 'hidden',
        borderRadius: 4 * scale,
        backgroundColor: '#1a2744',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Background */}
      {layout ? (
        <img src={layout} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: side === 'front'
            ? 'linear-gradient(135deg, #1e1044 0%, #0f2156 100%)'
            : 'linear-gradient(135deg, #0f2156 0%, #1e1044 100%)',
        }} />
      )}

      {/* Grid overlay */}
      {showGrid && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 999, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
        }} />
      )}

      {/* Fields */}
      {sorted.map(field => (
        <FieldRenderer key={field.id} field={field} data={data} scale={scale} />
      ))}
    </div>
  )
}
