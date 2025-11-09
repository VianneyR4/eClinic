# eClinic – Rural Healthcare Management System

**eClinic** is an offline-first healthcare platform designed for rural clinics.  
It improves patient flow, reduces nurse workload, and provides instant access to medical knowledge — even with poor connectivity.

---

## Overview

### Core Features
- Offline-first patient registration and consultation  
- **AI-Powered Multilingual Consultation** (Speech-to-Text + Auto-Summarization)
- Automatic background synchronization when online  
- Real-time queue management and triage dashboard  
- Consultation assistant with prefilled patient data  
- Integrated micro-learning and clinical guidelines (Knowledge Hub)  
- SMS notifications for patient queue updates  
- One-command Docker deployment  

---

## System Architecture

```
Frontend (Next.js / RxDB)  ⇄  Backend (Laravel / REST API)
       │                           │
       │                           ├── PostgreSQL (relational data)
       │                           ├── CouchDB (offline sync)
       │                           └── Redis (cache / sessions)
       └──────────── Docker Network ────────────────────────────────
```

**Frontend**
- Next.js 14 (App Router), TypeScript, Tailwind CSS  
- RxDB + IndexedDB for local storage  
- CouchDB replication for multi-device offline sync  

**Backend**
- Laravel 11 (API first, modular architecture)  
- PostgreSQL 16 for persistence  
- Redis 7 for caching and queue management  

**Infrastructure**
- Docker Compose orchestration  
- Apache + mod_php for Laravel runtime  
- GitHub Actions CI/CD pipeline  

---

## Quick Start

**Prerequisites**
- Docker Desktop 20.10+  
- Git  

**Setup**
```bash
git clone <repository-url>
cd eClinic
docker-compose up -d --build
```

When the setup completes, visit:
- Frontend: http://localhost:3000  
- Backend API: http://localhost:8000/api/v1  
- CouchDB Admin: http://localhost:5984/_utils (admin/admin)

**Run Tests**
```bash
docker-compose exec backend php artisan test
```

---

## Project Structure

```
eClinic/
├── frontend/          # Next.js app (UI, RxDB, sync)
├── backend/           # Laravel API (controllers, services, tests)
├── docs/              # Architecture & CI/CD docs
├── docker-compose.yml
└── README.md
```

---

## Key Workflows

### Offline Sync
1. Data stored locally in RxDB (IndexedDB).  
2. When internet returns, RxDB replicates with CouchDB.  
3. CouchDB syncs changes to the backend (PostgreSQL).  

### CI/CD
- GitHub Actions runs tests on pull requests.  
- Docker images built automatically.  
- Deployment triggered on merge to `main`.  
- Project management integration through GitHub Projects / Linear.  

---

## API Reference

**Base URL**  
`http://localhost:8000/api/v1`

| Endpoint | Method | Description |
|-----------|--------|-------------|
| `/health` | GET | Health check |
| `/patients` | GET/POST | List / create patients |
| `/patients/{id}` | GET/PUT/DELETE | Retrieve, update, delete patient |

Example:
```bash
curl http://localhost:8000/api/v1/patients
```

---

## Configuration

**Frontend (.env.local)**  
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_COUCHDB_URL=http://localhost:5984
NEXT_PUBLIC_COUCHDB_DB_NAME=eclinic
```

**Backend (.env)**  
```
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_DATABASE=eclinic
DB_USERNAME=postgres
DB_PASSWORD=postgres
REDIS_HOST=redis
```

---

## Development Commands

```bash
# Start services
docker-compose up -d

# Stop
docker-compose down

# Backend shell
docker-compose exec backend bash

# Run Laravel migrations
docker-compose exec backend php artisan migrate

# Restart specific container
docker-compose restart frontend
```

---

## Testing & Quality

- Backend : PHPUnit feature + unit tests  
- Frontend : Jest / React Testing Library  
- Linting : ESLint + Prettier  
- Code style : PSR-12 (PHP)  

---

## Smart Consultation Feature

### Overview
The consultation feature uses **browser-native speech recognition** combined with **local AI summarization** to streamline patient consultations. Doctors can speak naturally in multiple languages, and the system automatically extracts medical information.

### How It Works

#### 1. **Multilingual Speech-to-Text**
- **Technology**: Web Speech API (browser-native, requires internet)
- **Languages**: English (US), French (FR), Kinyarwanda (RW)
- **Process**:
  - Doctor selects language and clicks "Start"
  - Speaks naturally about patient symptoms
  - Transcript appears in real-time with live waveform visualization
  - Can switch languages mid-consultation
  - Interim results shown temporarily (yellow badge)
  - Final text accumulated continuously (never resets)

#### 2. **Local Translation**
- **Type**: Dictionary-based keyword translation
- **Purpose**: Translate French/Kinyarwanda medical terms to English before AI analysis
- **Storage**: Each speech segment stored with original language metadata
- **Example**: `"j'ai mal à la tête"` → `"I have head pain"`

#### 3. **AI Summarization**
- **Type**: Rule-based pattern matching (runs locally, no server needed)
- **Extracts**:
  - **Symptoms**: Searches for medical keywords (pain, fever, cough, headache, etc.)
  - **Duration**: Regex pattern matching (`"3 days"`, `"2 weeks"`)
  - **Diagnosis**: Symptom combination analysis (e.g., fever + chills + headache → malaria)
  - **Treatment**: Auto-suggests based on symptoms (headache → paracetamol, fever → rest + hydration)

#### 4. **Doctor Review & Edit**
- All AI-generated fields are **fully editable**
- Doctor can:
  - Manually edit transcript
  - Modify symptoms, diagnosis, treatment
  - Add additional notes
  - Click "Regenerate" to re-run AI on edited transcript
  - Click "Restart" to clear everything (with confirmation)

#### 5. **Report Generation**
- **Content**: Patient info, vitals, transcript, AI summary, notes
- **Design**: Professional layout with clinic branding and QR code
- **Output**: Print-ready PDF via browser's print dialog
- **Process**: 5-second loader → auto-scroll to report → print/download

### Technical Stack
```
Web Speech API → Transcript Segments (with language)
                        ↓
                 Translation Dictionary
                        ↓
                 AI Summarizer (local)
                        ↓
              Editable Summary Fields
                        ↓
                 Report Generator → PDF
```

### Usage Example
1. Navigate to patient detail → "New appointment" tab
2. Select language (🇺🇸 English / 🇫🇷 Français / 🇷🇼 Kinyarwanda)
3. Click "Start" and speak: *"Patient has headache and belly pain for 3 days"*
4. AI extracts: Symptoms: `headache, belly, pain` | Duration: `3 days` | Diagnosis: `gastritis or migraine`
5. Review and edit if needed
6. Click "Generate Report" → Print/Download PDF

### Browser Compatibility
- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)  
- ⚠️ Firefox (limited - Web Speech API not supported)

📖 **Full Documentation**: See [`docs/CONSULTATION_FEATURE.md`](docs/CONSULTATION_FEATURE.md) for detailed technical implementation.

---

## License

MIT License – see `LICENSE` for details.

---

**eClinic**  











<!-- Notes and limitations
Offline STT reality: The Web Speech API behavior offline varies by browser/platform. If you require guaranteed offline STT, we should embed a WASM engine (e.g., Vosk WASM or Whisper.cpp via WebAssembly). That needs model files shipped locally and is heavier. I can add this if you want.
Local summarizer: The summarizer is rule-based to meet the no-internet requirement and runs fully in the browser. If you want smarter summaries offline, we can integrate a small on-device model (e.g., WebLLM/WebGPU) but this adds assets and complexity.
Next steps (optional)
Guaranteed offline STT: Integrate Vosk WASM and a small language model, add a toggle to switch engines.
Language support: Set rec.lang (e.g., “en-US”, “fr-FR”, “rw-RW”) or match your clinic languages.
Persist locally: Save transcript/summary to IndexedDB (RxDB) for later viewing.
Filter menu content: Define actual filters for History table.
Report branding: Add clinic logo/header/footer and QR code for record lookup.
Task status: Implemented live speech-to-text, live local summarization, comment field, and a printable/downloadable report on the New appointment tab. -->