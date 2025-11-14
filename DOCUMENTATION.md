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
  - Real-time queue dashboard with statuses (waiting, in_progress, done), token numbers, and triage.
  - Optional SMS updates for patient status.
- Consultation Efficiency
  - Multilingual speech capture with smart analysis to prefill structured fields.
  - Fully editable by clinicians; print-ready reports.
- Virtual Assistant and Documentation
  - Offline-capable knowledge powered by local JSON references (WHO + Rwanda manuals).
  - Keyword retrieval and synthesized answers with citations.
  - Browsable documentation page for manual exploration.

Key principles: local-first UX, transparent logic, simple UI patterns.

---

## Architecture

- Frontend (Next.js 14, TypeScript, Tailwind)
  - Local storage/IndexedDB for caching, plus a lightweight form-level sync queue for writes.
  - Virtual Assistant: keyword-based retrieval (`Frontend/src/lib/references/retriever.ts`) and citation rendering.
  - Documentation UI: search + sidebar sourced from the same JSON reference index.
  - Queue UI: uses `apiService` to interact with backend for queue CRUD and status updates.

- Backend (Laravel 11)
  - REST API under `/api/v1` for patients, queue, consultations, auth.
  - PostgreSQL persistence.
  - Duplicate-protection on active queue entries enforced at the application layer (tests included).

- Infra
  - Docker Compose for local orchestration.

### Tradeoffs

- Retrieval method is keyword-based (simple, transparent, offline-capable) vs. full semantic vector search (heavier models/assets).
- Web Speech API used for STT; not guaranteed offline across browsers. For strict offline, WASM engines (Vosk/Whisper.cpp) can be added later.
- Strictly local references ensure trust and offline capability but require manual updates to JSON content.

---

## Future Vision (6 months)

- Full offline with local mirror DB
  - Solution: Ship a local-first database (e.g., SQLite/IndexedDB with background replication, CRDT-friendly merges). Sync to Laravel when online.
  - Impact: App runs fully offline for days; zero data loss in connectivity deserts.

- SMS-first workflows
  - Solution: Token/triage notifications, appointment reminders, follow-up prompts via SMS; simple USSD for basic actions.
  - Impact: Reaches patients without smartphones; reduces no-shows and crowding.

- Smart Consultation v2 (on-device)
  - Solution: WASM ASR (Vosk/Whisper.cpp) and small on-device models for better offline STT and smarter, local analysis.
  - Impact: Higher accuracy and reliability without internet; multilingual robustness.

- Health-specialized Assistant (local RAG)
  - Solution: Retrieval-augmented generation over clinic + national protocols, with guardrails; prefer local models when feasible.
  - Impact: Faster, trustworthy guidance aligned to national standards; reduces cognitive load.

- Portable Patient Record (QR/NFC card)
  - Solution: Patient card with QR (and optional NFC) embedding a compact, signed summary or locator to fetch full data on consent.
  - Impact: Continuity of care across clinics even without internet; helps referrals and return visits.

- Multi-clinic (multi-tenant) with shared directory
  - Solution: Tenant isolation by clinic, with a consented regional patient directory to discover/import records.
  - Impact: Data follows the patient; clinics keep autonomy while enabling secure interoperability.

- Queue hardware and kiosks
  - Solution: Low-cost token dispensers/kiosks for check-in; visible wait-time boards.
  - Impact: Smoother flow, less front-desk pressure, clearer expectations.

- Outcomes & quality analytics
  - Solution: Dashboards for throughput, wait times, triage distribution, follow-ups; SMS campaign effectiveness.
  - Impact: Managers see bottlenecks and improvements; supports funding and oversight.

---

## Developer Pointers

- Virtual Assistant
  - Data: `Frontend/public/references/index.json`
  - Types: `Frontend/src/lib/references/types.ts`
  - Loader: `Frontend/src/lib/references/loader.ts`
  - Retriever: `Frontend/src/lib/references/retriever.ts`
  - UI: `/dashboard/assistant` and `/dashboard/docs`
  - Update intelligence: curate/add entries in `index.json` (topics, tags, citations). No external model needed.

- Queue
  - API client: `Frontend/src/services/api.ts`
  - Frontend pages: `/dashboard/queue`, `AppointmentModal`
  - Backend endpoints: `/api/v1/queue` (feature tests cover duplicates and token assignment)

- Testing
  - Frontend: Jest + React Testing Library
  - Backend: PHPUnit

This document is intentionally concise (2–4 pages) to maximize clarity.

---

## Feature Briefs

- Real-time Queue (how it’s built and impact)
  - Built with Next.js UI + Laravel API. Status transitions and token assignment via `/api/v1/queue`.
  - Impact: Clear flow and triage reduce confusion and shorten perceived waits; enables SMS updates.

- Virtual Assistant (how it’s built and why “Assistant”)
  - Built as a local keyword retriever over curated references with citation rendering; browsable docs UI.
  - Why “Assistant”: it assists clinicians with fast, trustworthy, and local guidance, not a generic chatbot.
  - Update intelligence by editing `Frontend/public/references/index.json`.

- Smart Consultation (how it’s built and why “Smart”)
  - Built with Web Speech API (STT), simple translation dictionaries, and rule-based smart analysis to extract key info.
  - Why “Smart”: logic is explicit and local; provides structured suggestions without external AI services.
  - To evolve, extend dictionaries and patterns; optional WASM modules can be added for offline STT later.
