# eClinic – Rural Healthcare Management System

**eClinic** is a healthcare platform designed for rural clinics.  
It improves patient flow, reduces nurse workload, and provides instant access to medical knowledge — even with poor connectivity.

---

## Overview

### Core Features
- Form-level offline edits with background sync on reconnect  
- **Virtual Assistant** (offline-first, local WHO + Rwanda manuals, citations, documentation browser)  
- **Smart Multilingual Consultation** (Speech-to-Text + Smart analysis)  
- Real-time queue management and triage dashboard  
- Consultation assistant with prefilled patient data  
- Integrated micro-learning and clinical guidelines (Knowledge Hub)  
- SMS notifications for patient queue updates  
- One-command Docker deployment  

---

## System Architecture

```
Frontend (Next.js)  ⇄  Backend (Laravel / REST API)
       │                    │
       │                    └── PostgreSQL (relational data)
       └──────────── Docker Network ─────────────────────────
```

**Frontend**
- Next.js 14 (App Router), TypeScript, Tailwind CSS  
- Local storage/IndexedDB for caching and a lightweight form-level sync queue  

**Backend**
- Laravel 11 (API first, modular architecture)  
- PostgreSQL 16 for persistence  

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

**Run Tests**
```bash
docker-compose exec backend-app php artisan test
```

---

## Project Structure

```
eClinic/
├── frontend/          # Next.js app (UI, local cache + sync queue)
├── backend/           # Laravel API (controllers, services, tests)
├── docs/              # Architecture & CI/CD docs
├── docker-compose.yml
└── README.md
```

---

## Key Workflows

### Form-level Offline Edits
1. In any form (e.g., consultation), edits continue even if internet drops.  
2. On Save/Action, data is stored locally and enqueued.  
3. When internet returns, queued writes are sent to the API and the UI refreshes.  

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
```

**Backend (.env)**  
```
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_DATABASE=eclinic
DB_USERNAME=postgres
DB_PASSWORD=postgres
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

## Offline Strategy

We support form-level offline editing and saving for critical workflows.

- Service Worker: caches the app shell and static assets for smooth navigation.
- Local Storage/IndexedDB: cache reads and store pending writes.
- Sync Queue: when offline, saves are enqueued and retried on reconnect.
- Optimistic UI: reflect local changes immediately, then reconcile on sync.

### Data Flow

Read operations
- Serve from local cache first, then validate/refresh with network when available.

Write operations
- Save locally with status=pending and enqueue the request for background sync.
- When back online, the queue flushes and updates the server.

Conflict resolution
- Prefer timestamp-based resolution; fall back to manual merge where needed.

Backend strategy
- Provide idempotent sync endpoints for batch operations (create/update).
- Detect conflicts via updated_at/version and return details for merge.

### Files

- Public Service Worker: `Frontend/public/sw.js` (network-first for API; cache-first for assets)
- SW registration and offline banner: `Frontend/src/components/ServiceWorkerProvider.tsx` and wired in `Frontend/src/app/layout.tsx`
- Minimal sync queue utility: `Frontend/src/lib/offline/syncQueue.ts`

### How to use

- The service worker auto-registers on first load (in supported browsers).
- To enqueue a write when offline:
  ```ts
  import { enqueue, flushQueue } from '@/lib/offline/syncQueue';
  enqueue('http://localhost:8000/api/v1/patients', { method: 'POST', body: JSON.stringify({ ... }) });
  // Later, when back online
  await flushQueue();
  ```

### Test offline

- Open DevTools → Network → Offline; navigate the app and perform actions.
- Note the yellow banner indicating offline mode.
- Go back online; the queue flushes automatically.

---

## Testing & Quality

- Backend: PHPUnit feature + unit tests  
- Frontend: Jest / React Testing Library  
- Linting: ESLint + Prettier  
- Code style: PSR-12 (PHP)  

### Running tests
- Frontend
  ```bash
  cd Frontend && npm test
  ```
- Backend
  ```bash
  docker-compose exec backend-app php artisan test
  ```

Unit tests cover queue duplicate prevention, SearchDropdown modal actions and closing behavior, and API contract basics.

---

## Virtual Assistant

The Virtual Assistant helps clinicians quickly find answers from trusted local sources and works offline.

- Data source: local JSON at `Frontend/public/references/index.json`
- Sources: WHO clinical guidelines and Rwandan health manuals
- Features: keyword search, synthesized answers with citations, documentation browser at `/dashboard/docs`
- Access: via Topbar "Virtual Assistant" or `/dashboard/assistant`

How it’s built (brief):
- Keyword retriever over local JSON references, client-side rendering of citations and docs.
- No external model is required; runs fully in the browser.

How to update its “intelligence”:
- Edit `Frontend/public/references/index.json` (add/curate entries, tags, and content). Changes are picked up on refresh.

### Learn more
- Documentation: [DOCUMENTATION.md](./DOCUMENTATION.md)

---

## API Docs (Static OpenAPI)

We serve Swagger UI statically via Apache (no Composer packages).

- UI: http://localhost:8000/api/documentation/
- Spec JSON: http://localhost:8000/api-docs/openapi.json
- Files:
  - Public UI: `backend/public/api/documentation/index.html`
  - Spec: `backend/public/api-docs/openapi.json`

To update the docs, edit `backend/public/api-docs/openapi.json` and refresh the page.

### Backend one‑liner

- Clear config cache and run tests
  ```bash
  docker-compose exec backend-app sh -lc 'php artisan config:clear && php artisan test'
  ```

## Three Key Problems We Solve

- **Problem 1: The Waiting Room Crisis**
  - Reality: 100–150 patients/day, 2–3 nurses, 4–6h waits, no visibility/triage.
  - Solution: Real-time queue with triage, tokens, patient status, and optional SMS.
  - Impact: Reduces uncertainty and walkaways; surfaces urgent cases; shortens perceived wait times.

- **Problem 2: The Consultation Overload**
  - Reality: Repeated questions, fragmented history, heavy admin burden, connectivity drops.
  - Solution: Multilingual speech capture + smart analysis; prefilled patient context; form-level offline queue for saves.
  - Impact: Less typing, faster documentation, fewer errors, continues working during connectivity blips.

- **Problem 3: The Knowledge Gap**
  - Reality: Limited protocols/specialists; need quick, trustworthy guidance offline.
  - Solution: Virtual Assistant uses curated local references with citations and browsable docs.
  - Impact: Faster, more consistent decisions; confidence for nurses and clinicians.

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

#### 3. **Smart analysis**
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

### Technical Stack (Smart Consultation)
```
Web Speech API → Transcript Segments (with language)
                        ↓
                 Translation Dictionary
                        ↓
                 Smart Analysis (local)
                        ↓
              Editable Summary Fields
                        ↓
                 Report Generator → PDF
```

How it’s built (brief):
- Web Speech API for STT, local translation dictionaries, and rule-based smart analysis.
- No external AI service is required; everything runs in-browser.

How to update its “intelligence”:
- Extend translation dictionaries and keyword patterns in the code to improve detection and suggestions.

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