# 🤖 SpiderX Docs — Executive Letterhead & Document Studio

> **Official Document Studio for SpiderX Robotics Pvt. Ltd.**  
> A high-precision, executive-grade document creation platform designed for perfect letterhead alignment, digital PDF export, multi-page document pagination, and director signature workflow.

---

## 🌟 Overview

**SpiderX Docs** is built to streamline corporate communication, official offer letters, MOU agreements, project proposals, and executive correspondence. It bridges the gap between pre-printed physical letterhead stationary and digital PDF generation by offering real-time margin clearance guides, dynamic multi-page flow, interactive signature drawing pads, and company seal overlays.

---

## ✨ Key Features

### 📐 1. Precision Letterhead Alignment
- **Custom Margin Clearance**: Independently adjust Header Top Margin (mm) and Footer Bottom Margin (mm) to guarantee text never overlaps printed company logos or footer addresses.
- **Visual Ruler Guides**: Toggle dashed visual margin overlays on the editor canvas for pixel-perfect alignment.
- **Letterhead Background Overlay**: Upload digital letterhead background graphics or toggle them off when printing onto physical pre-printed stationary.

### 📄 2. Dynamic Multi-Page Engine (N-Page Support)
- **Unlimited Page Creation**: Expand documents seamlessly across 1, 2, 3, or N pages.
- **Automatic Continuation Notices**: Automatically appends customizable footer notices (e.g. `...Continued on Next Page`) and page numbers (`Page X of Y`).
- **Smart Signature Placement**: Automatically anchors closing salutations, director signatures, and company seals to the final page of multi-page documents.

### ✍️ 3. Director Signatures & Company Seal / Stamp
- **Interactive Signature Pad**: Draw transparent signatures directly using mouse or touchscreen devices.
- **Dual Signatories Support**: Toggle between **Single Director (1 Signatory)** and **Dual Directors (2 Signatory)** modes with side-by-side or stacked layout options.
- **Official Seal / Stamp Overlay**: Upload company stamp graphics with customizable scale (0.5x to 1.5x) and opacity controls.

### 📐 4. Studio Workbench UI
- **ReactFlow Dot Grid Canvas**: Interactive editor canvas set over a subtle ReactFlow dot-matrix background.
- **Fixed & Resizable Sidebar**: Fixed left controls panel with drag-to-resize width (280px to 650px) and collapsible icon mode.
- **Light & Dark Theme Toggle**: Built-in theme switcher with persistent user preference storage.

### 💾 5. Export & Backup Workflow
- **High-Fidelity PDF Export**: One-click browser print engine formatted specifically for standard A4 (`210mm x 297mm`) output.
- **JSON Backup / Restore**: Export entire document configurations to `.json` files and restore them anytime.
- **Built-in Presets**: Quick-load corporate templates (Official Offer Letter, NDA Agreement, Service Quote).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + OKLCH Design Tokens
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / Radix UI Primitives
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js 18+** and **npm** installed on your system.

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/spiderxrobotics/spiderx_docs.git
   cd spiderx_docs
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

### Production Build

To create an optimized production build:
```bash
npm run build
npm run start
```

---

## 📁 Directory Structure

```text
spiderx_docs/
├── app/
│   ├── globals.css         # OKLCH Design System, primary gradient & canvas grid
│   ├── layout.tsx          # Root HTML layout & font declarations
│   └── page.tsx            # Main Studio Workbench page
├── components/
│   ├── HeaderNavbar.tsx    # Top navigation bar, theme toggle & print actions
│   ├── ControlsSidebar.tsx # Fixed resizable control panel with tabbed forms
│   ├── LetterheadCanvas.tsx# Live A4 document canvas with N-page renderer
│   ├── SignaturePadModal.tsx# Canvas-based digital signature drawing modal
│   └── ui/                 # Shadcn UI primitives (Button, Card, Input, Badge)
├── lib/
│   └── utils.ts            # Classname merging utilities (clsx & tailwind-merge)
├── types/
│   └── letterhead.ts       # TypeScript interfaces for documents, pages & layout
└── utils/
    └── defaultTemplates.ts # Corporate templates & default SVG assets
```

---

## 📄 License & Credits

Developed with ❤️ for **SpiderX Robotics Pvt. Ltd.**  
All rights reserved © 2026 SpiderX Robotics.
