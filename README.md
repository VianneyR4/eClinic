# eClinic – Rural Healthcare Management System

**eClinic** is a healthcare platform designed for rural clinics.  
It improves patient flow, reduces nurse workload, and provides instant access to medical knowledge — even with poor connectivity.

>Time spent disiging the system: 9 days.  
 >2 full days understanding the system and the requirements + Researches + Planninng the system.

---

## Architecture & Practices (Short Notes)

- **Proper separation of concerns**
  - Backend: Controllers → Services/Models → Resources; validation via Form Requests/Validator; routes under `routes/api.php`.
  - Frontend: UI components (App Router) + `apiService` for HTTP; local sync queue isolated in `src/lib/offline`.

- **Thoughtful error handling**
  - Backend: Try/catch around DB/JWT/mail; clear HTTP status codes; user‑friendly messages; logs via Laravel `Log`.
  - Frontend: Inline toasts/messages; fallbacks for offline; retries for queue flush; guarded navigation.

- **Security best practices**
  - JWT auth for API; hashed passwords; email verification with expiring codes; `.env` driven secrets; CORS restricted in server config.
  - Debug verification code only in local/testing (or when `SHOW_VERIFICATION_CODE=true`). Never show in production.

## Overview

### Core Features
- Form-level offline edits with background sync on reconnect  
- **Virtual Assistant** (offline-first, local WHO + Rwanda manuals, citations, documentation browser)  
- **Smart Multilingual Consultation** (Speech-to-Text techology + Smart analysis)  
> Consultations feature is under Patient details page.
- **Real-time queue management and triage** dashboard  
> How it works: search if patient exist open 3 dots menu to get the optio to send to the queue, if not exist create new one, then it will directly propose you to add hime/her to the queue. (you can skape in all 2 cases)
> As the Rural clinic may not have a big infrustructure (like Tv in waiting room to display the queue + sound) i decided to provide the to each patient the line queue id on a paper to know where he is standing in the queue.
- Consultation assistant with prefilled patient data  
- Integrated micro-learning and clinical guidelines (Knowledge Hub)  
- SMS notifications for patient queue updates (now we don't have package for Bulk sms but we can add it in the future) 
- One-command Docker deployment Or via github actions to deploy (We only deploy docker image on dockerhub)

> How to test in the app: Use the seeded admin account to log in, explore Dashboard → Patients/Queue, and try the Consultation flow; offline edits can be tested by toggling browser offline.  
> Real‑world usability: Designed for low-connectivity clinics with simple flows, offline-tolerant forms, SMS cues, and minimal training overhead.

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
- Local storage for caching and a lightweight form-level sync queue  

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

### Database seeding & first login (Users are Doctors)
- Migrations and seeders run automatically on backend container start.  
- A default doctor admin user is created:
  - Email: `doctor@gmail.com`
  - Password: `123456`
- Login uses 2‑step verification (email code). In local/testing, the API also returns `debug_verification_code` and the UI shows it for convenience.  
  - Note: This debug display is only for non‑production; do not enable in production.
- Then you can create an other doctor and give access to other users:
  - a new doctor you create will have a default password `123456`
  - Note: every doctor can login in the system

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
- Deployment triggered on merge to `main`. (we only deploy docker image on dockerhub) 
- Project management integration through GitHub Projects / Linear.  

### Automation & Delivery
- CI/CD Pipeline (`.github/workflows/ci-cd.yml`)
  - On PRs: build and test Frontend (Node 18) and Backend (PHP 8.2 + Postgres service).
  - On push to main: builds Frontend/Backend, runs tests; used by deployments.
- Deploy on main (`.github/workflows/deploy.yml`) (we only deploy docker image on dockerhub) 
  - On push to main: logs into Docker registry and builds/pushes images for Frontend and Backend.
  - SSH deployment block is scaffolded and can be re-enabled to roll out to a server.
- Community Automation (`.github/workflows/automation.yml`)
  - On PR open: creates a linked GitHub Issue, annotates the PR, optionally adds to a Project (requires PAT).
  - On issue label changes: syncs labels to related PRs that reference the issue.

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

## Testing & Quality

- Backend: PHPUnit feature + unit tests  
- Frontend: Jest / React Testing Library  
- Linting: ESLint + Prettier  
- Code style: PSR-12 (PHP)  

### Running tests
- Frontend
  ```bash
  docker-compose exec frontend npm test
  ```
- Backend
  ```bash
  docker-compose exec backend-app php artisan test
  ```

Unit tests cover queue duplicate prevention, SearchDropdown modal actions and closing behavior, and API contract basics.

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
  - Solution: Real-time queue with triage, tokens, patient status, and optional SMS to the patient (this will not work for the moment because i don't have free package for Bulk SMS).
  - Impact: Reduces uncertainty and walkaways; surfaces urgent cases; shortens perceived wait times.

- **Problem 2: The Consultation Overload**
  - Reality: Repeated questions, fragmented history, heavy admin burden, connectivity drops.
  - Solution: Multilingual speech capture + smart analysis; prefilled patient context; form-level offline queue for saves.
  - Impact: Less typing, faster analysis and give suggestions to the doctor to proceed fastly, fewer errors, continues working during connectivity blips.

- **Problem 3: The Knowledge Gap**
  - Reality: Limited protocols/specialists; need quick, trustworthy guidance offline.
  - Solution: Virtual Assistant uses curated local references with citations and browsable docs.
  > Note: i the future i will make it more smarter with some images illustrations and videos to help the doctor to make a better decision.
  - Impact: Faster, more consistent decisions; confidence for nurses and clinicians.

## Smart Consultation Feature

### Overview
The consultation feature uses **browser-native speech recognition** combined with **local Smart summarization** to streamline patient consultations. Doctors can speak naturally in multiple languages, and the system automatically extracts medical information.

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
- **Purpose**: Translate French/Kinyarwanda medical terms to English before Smart analysis
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
- All Smart-generated fields are **fully editable**
- Doctor can:
  - Manually edit transcript
  - Modify symptoms, diagnosis, treatment
  - Add additional notes
  - Click "Regenerate" to re-run Smart analysis on edited transcript
  - Click "Restart" to clear everything (with confirmation)

#### 5. **Report Generation**
- **Content**: Patient info, vitals, transcript, Smart analysis summary, notes
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
4. The Smart analysis summarizer extracts: Symptoms: `headache, belly, pain` | Duration: `3 days` | Diagnosis: `gastritis or migraine`
5. Review and edit if needed
6. Click "Generate Report" → Print/Download PDF


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

---

### Browser Compatibility
- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)  
- ⚠️ Firefox (limited - Web Speech API not supported)

---

# Future Features (6-Month Vision)

- 1. Always-Available Offline Mode
  - Work completely without internet for extended periods
  - Automatic background sync when connection returns
  - Zero data loss in areas with poor connectivity

- 2. SMS Patient Communication
  - Appointment reminders via text message
  - Simple follow-up prompts and health check-ins
  - Accessible to patients without smartphones

- 3. Smart Voice Assistant
  - Offline voice-to-text for patient notes
  - Multilingual medical term recognition
  - Clinical decision support and documentation aid

- 4. Digital Health Card
  - QR code with essential medical history
  - Secure cross-clinic record sharing
  - Emergency information access

- 5. Clinic Analytics Dashboard
  - Real-time patient queue management
  - Performance metrics and wait time tracking
  - Staff efficiency and resource optimization

## License

MIT License – see `LICENSE` for details.

---

**eClinic**  