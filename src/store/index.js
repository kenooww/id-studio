import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// ─── Auth Store ─────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      users: [
        { id: '1', email: 'admin@idforge.com', password: 'admin123', role: 'admin', name: 'Admin User' },
        { id: '2', email: 'operator@idforge.com', password: 'op123', role: 'operator', name: 'Operator' },
        { id: '3', email: 'viewer@idforge.com', password: 'view123', role: 'viewer', name: 'Viewer' },
      ],
      login: (email, password) => {
        const users = get().users
        const user = users.find(u => u.email === email && u.password === password)
        if (user) {
          const { password: _, ...safeUser } = user
          set({ user: safeUser })
          return { success: true, user: safeUser }
        }
        return { success: false, error: 'Invalid credentials' }
      },
      register: (name, email, password, role = 'viewer') => {
        const users = get().users
        if (users.find(u => u.email === email)) {
          return { success: false, error: 'Email already exists' }
        }
        const newUser = { id: Date.now().toString(), email, password, role, name }
        set(state => ({ users: [...state.users, newUser] }))
        const { password: _, ...safeUser } = newUser
        set({ user: safeUser })
        return { success: true, user: safeUser }
      },
      logout: () => set({ user: null }),
    }),
    { name: 'idforge-auth', partialize: (s) => ({ user: s.user, users: s.users }) }
  )
)

// ─── App Store ───────────────────────────────────────────────────────────────
const defaultTemplate = {
  id: 'default-template',
  name: 'Company ID Card',
  orientation: 'landscape',
  cardSize: 'cr80',
  customWidth: 85.6,
  customHeight: 54,
  createdAt: new Date().toISOString(),
  frontLayout: null,
  backLayout: null,
  // CR80 landscape = ~323 × 204 px at 96dpi
  frontFields: [
    {
      id: 'photo-1',
      type: 'photo',
      label: 'Photo',
      dataKey: 'photo_url',
      x: 8, y: 8, width: 80, height: 90,
      rotation: 0, zIndex: 1, locked: false,
      styles: { borderRadius: 4, opacity: 1, objectFit: 'cover' },
    },
    {
      id: 'name-1',
      type: 'text',
      label: 'Full Name',
      dataKey: 'name',
      x: 100, y: 20, width: 200, height: 26,
      rotation: 0, zIndex: 2, locked: false,
      styles: {
        fontFamily: 'Arial, sans-serif', fontSize: 15,
        fontColor: '#ffffff', fontWeight: 'bold',
        letterSpacing: 0, lineHeight: 1.2,
        textAlign: 'left', stroke: '', strokeWidth: 0,
      },
    },
    {
      id: 'idnum-1',
      type: 'text',
      label: 'ID Number',
      dataKey: 'id_number',
      x: 100, y: 55, width: 180, height: 20,
      rotation: 0, zIndex: 2, locked: false,
      styles: {
        fontFamily: 'Arial, sans-serif', fontSize: 11,
        fontColor: '#a0c4ff', fontWeight: 'normal',
        letterSpacing: 1.5, lineHeight: 1.2,
        textAlign: 'left', stroke: '', strokeWidth: 0,
      },
    },
    {
      id: 'dept-1',
      type: 'text',
      label: 'Department',
      dataKey: 'extra_field',
      x: 100, y: 80, width: 180, height: 20,
      rotation: 0, zIndex: 2, locked: false,
      styles: {
        fontFamily: 'Arial, sans-serif', fontSize: 10,
        fontColor: '#cccccc', fontWeight: 'normal',
        letterSpacing: 0, lineHeight: 1.2,
        textAlign: 'left', stroke: '', strokeWidth: 0,
      },
    },
    {
      id: 'qr-1',
      type: 'qr',
      label: 'QR Code',
      dataKey: 'id_number',
      x: 260, y: 10, width: 50, height: 50,
      rotation: 0, zIndex: 2, locked: false,
      styles: { opacity: 1 },
    },
  ],
  // CR80 landscape = ~323 × 204 px
  backFields: [
    {
      id: 'back-field1',
      type: 'text',
      label: 'Guardian / Emergency',
      dataKey: 'field_1',
      x: 14, y: 20, width: 200, height: 20,
      rotation: 0, zIndex: 1, locked: false,
      styles: {
        fontFamily: 'Arial, sans-serif', fontSize: 11,
        fontColor: '#ffffff', fontWeight: 'normal',
        letterSpacing: 0, lineHeight: 1.4,
        textAlign: 'left', stroke: '', strokeWidth: 0,
      },
    },
    {
      id: 'back-field2',
      type: 'text',
      label: 'Address',
      dataKey: 'field_2',
      x: 14, y: 55, width: 200, height: 20,
      rotation: 0, zIndex: 1, locked: false,
      styles: {
        fontFamily: 'Arial, sans-serif', fontSize: 11,
        fontColor: '#ffffff', fontWeight: 'normal',
        letterSpacing: 0, lineHeight: 1.4,
        textAlign: 'left', stroke: '', strokeWidth: 0,
      },
    },
    {
      id: 'back-field3',
      type: 'text',
      label: 'Contact Number',
      dataKey: 'field_3',
      x: 14, y: 90, width: 200, height: 20,
      rotation: 0, zIndex: 1, locked: false,
      styles: {
        fontFamily: 'Arial, sans-serif', fontSize: 11,
        fontColor: '#ffffff', fontWeight: 'normal',
        letterSpacing: 0, lineHeight: 1.4,
        textAlign: 'left', stroke: '', strokeWidth: 0,
      },
    },
    {
      id: 'back-field4',
      type: 'text',
      label: 'School Year / Date',
      dataKey: 'field_4',
      x: 14, y: 125, width: 200, height: 20,
      rotation: 0, zIndex: 1, locked: false,
      styles: {
        fontFamily: 'Arial, sans-serif', fontSize: 11,
        fontColor: '#ffffff', fontWeight: 'normal',
        letterSpacing: 0, lineHeight: 1.4,
        textAlign: 'left', stroke: '', strokeWidth: 0,
      },
    },
    {
      id: 'back-barcode',
      type: 'barcode',
      label: 'Barcode',
      dataKey: 'id_number',
      x: 14, y: 155, width: 180, height: 36,
      rotation: 0, zIndex: 1, locked: false,
      styles: { opacity: 1 },
    },
  ],
}

export const useAppStore = create(
  persist(
    immer((set, get) => ({
      // Templates
      templates: [defaultTemplate],
      activeTemplateId: defaultTemplate.id,

      // Sheet data
      sheetData: [],
      sheetUrl: '',
      sheetLoading: false,

      // Layouts (base64 or urls)
      layouts: {},

      // Designer state
      designerSide: 'front',
      selectedFieldId: null,
      zoom: 1,
      history: [],
      historyIndex: -1,

      // Print config
      printConfig: {
        cardsPerRow: 2,
        cardsPerPage: 8,
        showBleed: false,
        paperSize: 'a4',
      },

      // Stats
      totalGenerated: 0,

      // ── Template Actions ──────────────────────────────────────────────────
      createTemplate: (data) => {
        const tmpl = {
          id: Date.now().toString(),
          name: data.name || 'New Template',
          orientation: data.orientation || 'landscape',
          cardSize: data.cardSize || 'cr80',
          customWidth: 85.6,
          customHeight: 54,
          createdAt: new Date().toISOString(),
          frontLayout: null,
          backLayout: null,
          frontFields: [],
          backFields: [],
          ...data,
        }
        set(state => { state.templates.push(tmpl) })
        return tmpl
      },

      updateTemplate: (id, updates) => {
        set(state => {
          const idx = state.templates.findIndex(t => t.id === id)
          if (idx !== -1) Object.assign(state.templates[idx], updates)
        })
      },

      deleteTemplate: (id) => {
        set(state => {
          state.templates = state.templates.filter(t => t.id !== id)
          if (state.activeTemplateId === id) {
            state.activeTemplateId = state.templates[0]?.id || null
          }
        })
      },

      duplicateTemplate: (id) => {
        const tmpl = get().templates.find(t => t.id === id)
        if (!tmpl) return
        const copy = { ...tmpl, id: Date.now().toString(), name: tmpl.name + ' (Copy)', createdAt: new Date().toISOString() }
        set(state => { state.templates.push(copy) })
      },

      setActiveTemplate: (id) => set(state => { state.activeTemplateId = id }),

      getActiveTemplate: () => {
        const s = get()
        return s.templates.find(t => t.id === s.activeTemplateId)
      },

      // ── Field Actions ─────────────────────────────────────────────────────
      addField: (side, field) => {
        const tmplId = get().activeTemplateId
        set(state => {
          const tmpl = state.templates.find(t => t.id === tmplId)
          if (!tmpl) return
          const newField = {
            id: `field-${Date.now()}`,
            x: 20, y: 20, width: 100, height: 30,
            rotation: 0, zIndex: tmpl[`${side}Fields`].length + 1,
            locked: false,
            styles: {},
            ...field,
          }
          tmpl[`${side}Fields`].push(newField)
          state.selectedFieldId = newField.id
        })
      },

      updateField: (side, fieldId, updates) => {
        const tmplId = get().activeTemplateId
        set(state => {
          const tmpl = state.templates.find(t => t.id === tmplId)
          if (!tmpl) return
          const field = tmpl[`${side}Fields`].find(f => f.id === fieldId)
          if (field) Object.assign(field, updates)
        })
      },

      deleteField: (side, fieldId) => {
        const tmplId = get().activeTemplateId
        set(state => {
          const tmpl = state.templates.find(t => t.id === tmplId)
          if (!tmpl) return
          tmpl[`${side}Fields`] = tmpl[`${side}Fields`].filter(f => f.id !== fieldId)
          if (state.selectedFieldId === fieldId) state.selectedFieldId = null
        })
      },

      duplicateField: (side, fieldId) => {
        const tmplId = get().activeTemplateId
        const tmpl = get().templates.find(t => t.id === tmplId)
        if (!tmpl) return
        const field = tmpl[`${side}Fields`].find(f => f.id === fieldId)
        if (!field) return
        const copy = { ...field, id: `field-${Date.now()}`, x: field.x + 10, y: field.y + 10 }
        set(state => {
          const t = state.templates.find(t => t.id === tmplId)
          t[`${side}Fields`].push(copy)
          state.selectedFieldId = copy.id
        })
      },

      setSelectedField: (id) => set(state => { state.selectedFieldId = id }),
      setDesignerSide: (side) => set(state => { state.designerSide = side; state.selectedFieldId = null }),
      setZoom: (zoom) => set(state => { state.zoom = zoom }),

      // ── Layout Actions ────────────────────────────────────────────────────
      setLayout: (templateId, side, dataUrl) => {
        set(state => {
          const tmpl = state.templates.find(t => t.id === templateId)
          if (tmpl) tmpl[`${side}Layout`] = dataUrl
        })
      },

      // ── Sheet Data ────────────────────────────────────────────────────────
      setSheetData: (data) => set(state => { state.sheetData = data }),
      setSheetUrl: (url) => set(state => { state.sheetUrl = url }),
      setSheetLoading: (v) => set(state => { state.sheetLoading = v }),

      // ── Print Config ──────────────────────────────────────────────────────
      setPrintConfig: (cfg) => set(state => { Object.assign(state.printConfig, cfg) }),

      // ── Stats ─────────────────────────────────────────────────────────────
      incrementGenerated: (n) => set(state => { state.totalGenerated += n }),

      // ── Reset default template (clears stale localStorage data) ──────────
      resetDefaultTemplate: () => set(state => {
        const idx = state.templates.findIndex(t => t.id === 'default-template')
        if (idx !== -1) {
          state.templates[idx] = { ...defaultTemplate, createdAt: state.templates[idx].createdAt }
        } else {
          state.templates.unshift(defaultTemplate)
        }
        state.activeTemplateId = 'default-template'
      }),
    })),
    {
      name: 'idforge-app-v2',   // bumped version → clears old stale localStorage
      partialize: (s) => ({
        templates: s.templates,
        activeTemplateId: s.activeTemplateId,
        sheetUrl: s.sheetUrl,
        sheetData: s.sheetData,
        printConfig: s.printConfig,
        totalGenerated: s.totalGenerated,
      }),
    }
  )
)
