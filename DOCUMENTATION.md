# eClinic Documentation

This document covers the problem framing, users, solution overview, architecture and tradeoffs, and future vision.

---

## Problem Selection

We are addressing three interconnected problems faced by rural clinics:

- Waiting Room Crisis
  - Long, opaque queues (100–150 patients/day, 2–3 nurses) and no triage visibility.
  - Impact: Anxiety, walkaways, missed urgent cases.
- Consultation Overload
  - Repeated history taking, fragmented records, heavy documentation burden.
  - Impact: Short consults dominated by admin work; errors due to overload; unstable connectivity.
- Knowledge Gap
  - Limited access to updated protocols, specialist input, on-demand guidance.
  - Impact: Diagnostic uncertainty, inconsistent care, delayed referrals.

We solve these because they are high-leverage: better flow, less cognitive load, and fast access to trustworthy guidance directly improve care quality and staff well-being.

---

## User Research (assumptions)

- Users: Nurses and clinicians in rural/low-resource settings; reception staff; clinic managers.
- Constraints:
  - Intermittent or poor connectivity; limited devices.
  - Staff are clinically skilled but time-constrained and not deeply technical.
  - Patients vary in language and literacy; many lack smartphones.
- Needs:
  - Clear patient flow with triage and expectations.
  - Faster, lighter documentation and decision support.
  - Trustworthy, local, and offline knowledge.

---

## Solution Overview

- Queue and Triage
  - Real-time queue dashboard with statuses (waiting, in_progress, done), token numbers, and triage levels.
  - SMS updates optional for patient status.
- Consultation Efficiency
  - Multilingual speech capture with local summarization to prefill structured fields.
  - Fully editable by clinicians; print-ready reports.
- Virtual Assistant and Documentation
  - Offline-first knowledge powered by local JSON references (WHO + Rwanda manuals).
  - Keyword retrieval and answer synthesis with citations.
  - Browsable documentation page for manual exploration.

Key principles: offline-first, local data, transparency, simple UI patterns.

---

## Architecture

- Frontend (Next.js 14, TypeScript, Tailwind)
  - Offline storage via IndexedDB (RxDB if enabled) and local JSON for references (`public/references/index.json`).
  - Virtual Assistant: keyword-based retrieval (`src/lib/references/retriever.ts`) and citation rendering.
  - Documentation UI: search + sidebar sourced from the same JSON reference index.
  - Queue UI: uses `apiService` to interact with backend for queue CRUD and status updates.

- Backend (Laravel 11)
  - REST API under `/api/v1` for patients, queue, consultations, auth.
  - PostgreSQL persistence; Redis for cache/queues.
  - Duplicate-protection on active queue entries enforced at the application layer (tests included).

- Sync and Infra
  - Optional CouchDB replication for multi-device offline sync.
  - Docker Compose for local orchestration.

### Tradeoffs

- Retrieval method is keyword-based (simple, transparent, offline-capable) vs. full semantic vector search (heavier models/assets).
- Web Speech API used for STT; not guaranteed offline across browsers. For strict offline, WASM engines (Vosk/Whisper.cpp) can be added later.
- Strictly local references ensure trust and offline capability but require manual updates to JSON content.

---

## Future Vision (6 months)

- Smart Retrieval
  - Local embeddings and semantic search (WASM + on-device model) while preserving offline operation.
  - Richer citation UX with paragraph-level highlights.
- Decision Support
  - Protocol-driven flows (IMCI, ANC, malaria) as interactive checklists that generate structured notes.
- Integrated Triage Kiosk
  - Patient-facing token dispenser or kiosk; clear wait-time estimates.
- Offline STT & Translation
  - Bundle offline ASR model(s) and small translation modules via WebAssembly and WebGPU acceleration.
- Analytics & Quality
  - Clinic-level dashboards on throughput, wait times, triage distribution, and follow-up compliance.

---

## Developer Pointers

- Virtual Assistant
  - Data: `Frontend/public/references/index.json`
  - Types: `Frontend/src/lib/references/types.ts`
  - Loader: `Frontend/src/lib/references/loader.ts`
  - Retriever: `Frontend/src/lib/references/retriever.ts`
  - UI: `/dashboard/assistant` and `/dashboard/docs`

- Queue
  - API client: `Frontend/src/services/api.ts`
  - Frontend pages: `/dashboard/queue`, `AppointmentModal`
  - Backend endpoints: `/api/v1/queue` (feature tests cover duplicates and token assignment)

- Testing
  - Frontend: Jest + React Testing Library
  - Backend: PHPUnit

This document is intentionally concise (2–4 pages) to maximize clarity.
