import { useState } from 'react'
import { useAuthStore, useAppStore } from '../store'
import toast from 'react-hot-toast'
import { User, Shield, Database, Trash2, Download, Upload } from 'lucide-react'

export default function SettingsPage() {
  const user = useAuthStore(s => s.user)
  const templates = useAppStore(s => s.templates)
  const sheetData = useAppStore(s => s.sheetData)
  const totalGenerated = useAppStore(s => s.totalGenerated)
  const resetDefaultTemplate = useAppStore(s => s.resetDefaultTemplate)

  const exportData = () => {
    const data = {
      templates,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `idforge-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Templates exported!')
  }

  const importData = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.templates) throw new Error('Invalid format')
        // Would import here
        toast.success(`Found ${data.templates.length} templates in backup`)
      } catch {
        toast.error('Invalid backup file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account and application settings</p>
      </div>

      {/* Profile */}
      <div className="glass rounded-xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-violet-400" />
          <h2 className="font-semibold text-white">Profile</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <input type="text" defaultValue={user?.name} className="input-field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" defaultValue={user?.email} className="input-field" disabled />
          </div>
          <div>
            <label className="label">Role</label>
            <input type="text" value={user?.role} className="input-field capitalize" disabled />
          </div>
        </div>
        <button onClick={() => toast.success('Profile updated!')} className="btn-primary mt-4">Save Changes</button>
      </div>

      {/* Stats */}
      <div className="glass rounded-xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-violet-400" />
          <h2 className="font-semibold text-white">Statistics</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Templates', value: templates.length },
            { label: 'Sheet Records', value: sheetData.length },
            { label: 'IDs Generated', value: totalGenerated },
          ].map(stat => (
            <div key={stat.label} className="bg-white/03 rounded-lg p-4 text-center">
              <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data management */}
      <div className="glass rounded-xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-violet-400" />
          <h2 className="font-semibold text-white">Data Management</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} className="btn-secondary">
            <Download className="w-4 h-4" /> Export Templates
          </button>
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" /> Import Templates
            <input type="file" accept=".json" className="hidden" onChange={importData} />
          </label>
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-xl p-6 border border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
          <h2 className="font-semibold text-white">Danger Zone</h2>
        </div>
        <p className="text-sm text-white/40 mb-4">These actions are permanent and cannot be undone.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => {
            resetDefaultTemplate()
            toast.success('Default template restored!')
          }} className="btn-secondary">
            <Trash2 className="w-4 h-4 text-amber-400" /> Reset Default Template
          </button>
          <button onClick={() => {
            if (confirm('Clear all sheet data?')) {
              useAppStore.getState().setSheetData([])
              toast.success('Sheet data cleared')
            }
          }} className="btn-danger">
            Clear Sheet Data
          </button>
        </div>
      </div>
    </div>
  )
}
