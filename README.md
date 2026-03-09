# IDForge — Professional ID Card System

A full-featured ID card generation system built with React + Vite + Zustand.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## 🔐 Demo Login Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@idforge.com | admin123 |
| Operator | operator@idforge.com | op123 |
| Viewer | viewer@idforge.com | view123 |

## ✨ Features

### Authentication
- Login / Register / Logout
- Protected routes
- Three user roles: Admin, Operator, Viewer
- Sessions stored in localStorage

### Admin Dashboard
- Statistics: total IDs generated, templates, sheet records
- Quick action cards
- Recent templates list

### Template Management
- Create, Edit, Delete, Duplicate templates
- Support for landscape/portrait orientation
- CR80 (standard PVC) card size
- All data stored as JSON

### Layout Uploader
- Drag & drop PNG/JPEG backgrounds
- Separate front and back layouts per template
- Up to 5MB per image

### Google Sheets Integration
- Connect any public Google Sheet
- Auto-parse columns: name, id_number, photo_url, extra_field, field_1–4
- Sample data built-in for testing
- Live data table preview

### Advanced ID Designer (Canva-style)
- Drag & drop field positioning
- Resize fields with handles
- Field types: Text, Photo, QR Code, Barcode, Shape
- Layer panel with z-index control
- Lock/unlock elements
- Duplicate elements
- Per-field styling:
  - Text: font family, size, weight, color, align, spacing, stroke
  - Image: border radius, opacity
  - Shape: fill color, radius
- Front/back editing
- Zoom in/out
- Grid overlay

### Live Preview
- Preview cards with real sheet data
- Navigate through all records
- Thumbnail strip
- Front/back toggle

### Professional Print Layout
- A4 paper layout
- Auto grid (1–3 cards per row)
- 4 rows per page
- Multiple pages auto-generated
- Page labels and margins

### Duplex Print Alignment
- Front pages first, then back pages
- Portrait cards auto-rotated 180° for duplex
- Landscape cards mirrored for duplex

### PDF Export
- Uses html2canvas + jsPDF
- Multi-page export
- High quality (2x scale)

### State Management
- Zustand with immer for immutable updates
- Persistent storage (localStorage)
- Global state: templates, layouts, fields, sheet data, print config

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   └── DashboardLayout.jsx   # Sidebar + layout
│   └── IDCard.jsx                # Card renderer + field renderer
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardHome.jsx
│   ├── TemplatesPage.jsx
│   ├── UploadLayoutPage.jsx
│   ├── DesignerPage.jsx          # Main Canva-style editor
│   ├── DataSourcePage.jsx
│   ├── PreviewPage.jsx
│   ├── PrintPage.jsx             # A4 + PDF export
│   └── SettingsPage.jsx
├── store/
│   └── index.js                  # Zustand store
├── App.jsx                       # Router setup
├── main.jsx
└── index.css                     # Tailwind + global styles
```

## 🔧 Google Sheets Setup

1. Create a Google Sheet with these columns:
   - `name`, `id_number`, `photo_url`, `extra_field`
   - `field_1`, `field_2`, `field_3`, `field_4`

2. Make it public: Share → Anyone with the link → Viewer

3. Copy the URL and paste it in Data Source page

## 📦 Tech Stack

- **React 18** + **Vite 5**
- **Zustand** (state management)
- **Immer** (immutable state)
- **React Router v6** (routing)
- **TailwindCSS** (styling)
- **html2canvas** + **jsPDF** (PDF export)
- **Lucide React** (icons)
- **React Hot Toast** (notifications)
