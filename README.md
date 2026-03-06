# RadVoice

A local desktop application for radiologists — AI-powered structured radiology reporting with voice dictation.

## What is RadVoice?

RadVoice transforms a radiologist's voice dictation into a structured radiology report using AI. The app uses pre-filled templates with normal findings and intelligently maps dictated text to the corresponding report sections.

All processing happens locally on your machine — audio transcription runs through a local Whisper model, and patient data never leaves the device (except for LLM mapping via OpenRouter API).

## Key Features

- **Voice dictation** — built-in microphone recording + local transcription (Whisper.cpp, ggml-large-v3)
- **Template system** — 27 JSON templates (12 CT, 15 MRI) with pre-filled normal findings and structured checklists
- **AI mapping** — LLM distributes dictated fragments across template sections with source traceability
- **Horos/OsiriX integration** — reads patient demographics directly from the Horos DICOM database
- **Structured checklists** — per-template reporting checklists to ensure completeness
- **Auto-norma** — one-click fill of all sections with normal findings
- **AI impression** — automatic generation of the conclusion section based on findings
- **Radiology calculators** — built-in BI-RADS, PI-RADS, TI-RADS, and Bosniak scoring
- **Template editor** — full-page editor for creating and modifying templates
- **Traceability** — hover over a report section to see the source dictation fragment
- **Inline editing** — manual editing of any report section after AI mapping
- **Rich clipboard** — copy final report as formatted text + HTML with one click

## Templates

Templates are grouped by modality in the selector:

**CT (12 templates):**
CT Head, CT Cervical Spine, CT Lumbar Spine, CT Chest, CT Chest-Abdomen-Pelvis, CT Abdomen, CT Pelvis, CT Pulmonary Angiography (CTPA), CT Urography, CT Aorta CTA, CT Paranasal Sinuses, CT Neck Soft Tissues

**MRI (15 templates):**
MRI Brain, MRI Breast (BI-RADS), MRI Cervical/Thoracic/Lumbar Spine, MRI Shoulder, MRI Elbow, MRI Wrist, MRI Hip, MRI Knee, MRI Ankle, MRI Abdomen (Pancreatic Cancer), MRI Pelvis (Rectal Cancer), MRI Retroperitoneum, MRI Pituitary

All templates include Ukrainian-language normal findings, structured sections, and keyword-based checklists.

## Tech Stack

- **Electron** — desktop shell with native OS integration
- **React + TypeScript** — UI framework
- **Vite** — build tooling
- **Tailwind CSS** — styling with custom design tokens
- **Zustand** — lightweight state management (5 stores)
- **Whisper.cpp** — local audio transcription (ggml-large-v3 model)
- **OpenRouter API** — LLM mapping and impression generation
- **better-sqlite3** — reading Horos/OsiriX DICOM database

## Getting Started

### Prerequisites

- Node.js 18+
- Whisper.cpp CLI (`whisper-cli`) installed and available in PATH
- Whisper model file `models/ggml-large-v3.bin`
- An OpenRouter API key

### Installation

```bash
git clone https://github.com/berezovskiya/radvoice_local.git
cd radvoice_local
npm install
npx electron-rebuild -o better-sqlite3
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
├── electron/              # Electron main process
│   ├── main.ts            # IPC handlers, window management
│   ├── preload.ts         # Context bridge API
│   ├── store.ts           # Persistent settings (electron-store)
│   └── dicomStudies.ts    # Horos SQLite database reader
├── src/
│   ├── components/        # React UI components
│   │   ├── Layout/        # Main 2-panel layout
│   │   ├── Toolbar/       # Top toolbar with template selector
│   │   ├── ReportPanel/   # Left panel — structured report
│   │   ├── DictationPanel/# Right panel — voice dictation
│   │   ├── ChecklistPanel/# Right panel — reporting checklist
│   │   ├── StudyPicker/   # DICOM study selector (Horos)
│   │   ├── Calculator/    # Radiology scoring calculators
│   │   ├── Settings/      # Settings modal
│   │   ├── TemplateEditor/# Reusable section editor
│   │   └── TemplateEditorPage/ # Full template editor
│   ├── store/             # Zustand state stores
│   ├── services/          # Audio recording, LLM API
│   ├── prompts/           # LLM prompt templates
│   ├── calculators/       # Scoring system logic + references
│   └── types/             # TypeScript type definitions
├── templates/             # JSON report templates (CT + MRI)
└── models/                # Whisper model files (gitignored)
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — application architecture and data flow
- [FEATURES.md](./FEATURES.md) — functional requirements
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — implementation plan

## License

Private — for personal use only.
