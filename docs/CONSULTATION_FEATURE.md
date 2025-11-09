# Consultation Feature Documentation

## Overview

The Consultation Feature is an AI-powered, multilingual speech-to-text system that enables healthcare providers to conduct patient consultations efficiently. It combines real-time speech recognition, automatic medical information extraction, and report generation.

## Table of Contents

1. [Architecture](#architecture)
2. [Features](#features)
3. [Technical Implementation](#technical-implementation)
4. [User Workflow](#user-workflow)
5. [API Reference](#api-reference)
6. [Customization](#customization)

---

## Architecture

### Component Structure

```
PatientDetailPage
└── NewAppointmentDesign
    ├── Speech Recognition (Web Speech API)
    ├── Audio Visualization (Web Audio API)
    ├── AI Summarizer (Local Rule-Based)
    ├── Translation Engine (Dictionary-Based)
    └── Report Generator (HTML/Print)
```

### Data Flow

```
User Speech → Speech Recognition → Transcript Segments
                                          ↓
                                   Translation (if needed)
                                          ↓
                                   AI Summarization
                                          ↓
                            Extract: Symptoms, Duration, Diagnosis, Treatment
                                          ↓
                                   Editable Summary Fields
                                          ↓
                                   Generate Report → Print/PDF
```

---

## Features

### 1. **Multilingual Speech-to-Text**

- **Supported Languages**: English (US), French (FR), Kinyarwanda (RW)
- **Technology**: Web Speech API (browser-native)
- **Capabilities**:
  - Real-time transcription
  - Continuous recognition (doesn't stop until user clicks "Stop")
  - Interim results (shows partial recognition in yellow badge)
  - Language switching on-the-fly

**Implementation Details**:
```typescript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = selectedLanguage; // e.g., "en-US", "fr-FR", "rw-RW"
recognition.continuous = true;
recognition.interimResults = true;
```

### 2. **Live Audio Waveform Visualization**

- **Technology**: Web Audio API + Canvas
- **Display**: 60 frequency bars with gradient colors
- **Purpose**: Visual feedback during recording

**Implementation**:
```typescript
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 1024;
// Draw bars based on frequency data
```

### 3. **Local Translation Engine**

- **Type**: Dictionary-based keyword translation
- **Languages**: French → English, Kinyarwanda → English
- **Medical Terms**: 30+ common medical terms per language

**Translation Dictionaries**:
```typescript
{
  "fr": {
    "douleur": "pain",
    "fièvre": "fever",
    "tête": "head",
    "ventre": "belly",
    // ... more terms
  },
  "rw": {
    "ububabare": "pain",
    "umuriro": "fever",
    "umutwe": "head",
    // ... more terms
  }
}
```

### 4. **AI Summarization**

**Type**: Rule-based keyword extraction and pattern matching

**Extraction Logic**:

#### Symptoms Detection
- **Keywords**: pain, ache, headache, belly, stomach, back, fever, cough, fatigue, etc.
- **Method**: Searches for medical keywords in translated text
- **Output**: Comma-separated list of detected symptoms

#### Duration Extraction
- **Pattern**: Regex matching time expressions
- **Examples**: "3 days", "2 weeks", "1 month"
- **Regex**: `/(\d+)\s*(day|days|week|weeks|month|months|hour|hours|year|years)/`

#### Diagnosis Suggestion
- **Method**: Symptom combination matching
- **Rules**:
  - Malaria: fever + chills + headache
  - Flu: fever + cough + fatigue
  - Gastritis: stomach/belly + nausea
  - Migraine: headache + dizzy
  - Infection: fever + pain + swelling
  - Allergy: rash + itch + swelling

#### Treatment Recommendation
- **Auto-suggestions**:
  - Pain/headache → paracetamol
  - Fever → rest + hydration
- **Keyword detection**: Looks for mentioned medications in transcript

**Code Example**:
```typescript
const localSummarize = (text: string) => {
  const englishText = segments.map(s => translateLocal(s.text, s.lang)).join(' ');
  
  // Extract symptoms
  const symptomsKeys = ["pain", "ache", "headache", "belly", ...];
  const foundSymptoms = symptomsKeys.filter(key => englishText.includes(key));
  
  // Extract duration
  const durMatch = englishText.match(/(\d+)\s*(day|days|week|weeks|...)/);
  
  // Suggest diagnosis based on symptom combinations
  // Suggest treatment based on symptoms
};
```

### 5. **Editable Summary**

- All AI-generated fields are editable
- Doctor can review and modify before finalizing
- Fields: Symptoms, Duration, Diagnosis, Treatment, Additional Notes

### 6. **Comprehensive Report Generation**

**Report Sections**:
1. **Header**: Clinic branding, date/time, QR code
2. **Patient Information**: ID, Name, Phone, Address
3. **About Patient**: Birthday, Blood Group, Gender, Email
4. **Vital Signs**: All 6 vitals with status indicators
5. **Consultation Transcript**: Full spoken text
6. **AI Analysis Summary**: Symptoms, Duration, Diagnosis, Treatment
7. **Additional Notes**: Doctor's comments
8. **Footer**: Timestamp, contact info, copyright

**Print Functionality**:
- CSS `@media print` styles
- Color preservation (`print-color-adjust: exact`)
- A4 page size with 1.5cm margins
- Save as PDF via browser print dialog

---

## Technical Implementation

### State Management

```typescript
const [recording, setRecording] = useState(false);
const [transcript, setTranscript] = useState("");
const [interimText, setInterimText] = useState("");
const [segments, setSegments] = useState<Array<{ text: string; lang: string }>>([]);
const [lang, setLang] = useState("en-US");
const [symptoms, setSymptoms] = useState("");
const [duration, setDuration] = useState("");
const [diagnosis, setDiagnosis] = useState("");
const [treatment, setTreatment] = useState("");
const [comment, setComment] = useState("");
const [showReport, setShowReport] = useState(false);
const [generating, setGenerating] = useState(false);
```

### Speech Recognition Flow

1. **Start Recording**:
   - Initialize SpeechRecognition
   - Set language and options
   - Request microphone access
   - Start audio visualization
   - Begin recognition

2. **Process Results**:
   - Separate final and interim results
   - Append final chunks to transcript
   - Store segments with language metadata
   - Show interim text in temporary badge
   - Trigger live summarization

3. **Stop Recording**:
   - Stop recognition
   - Close audio context
   - Auto-regenerate summary (500ms delay)

### Transcript Accumulation

**Problem**: Interim results were causing duplicate text.

**Solution**: Separate final and interim text.

```typescript
rec.onresult = (event) => {
  let interim = "";
  let finalChunks = [];
  
  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      finalChunks.push(event.results[i][0].transcript.trim());
    } else {
      interim += event.results[i][0].transcript;
    }
  }
  
  // Update transcript with final chunks only
  if (finalChunks.length > 0) {
    setTranscript(prev => prev + (prev ? " " : "") + finalChunks.join(" "));
  }
  
  // Show interim separately (temporary)
  setInterimText(interim);
};
```

### Translation Process

1. Segment is recognized in original language (e.g., French)
2. Stored with language metadata: `{ text: "j'ai mal à la tête", lang: "fr-FR" }`
3. Before summarization, all segments are translated to English
4. AI summarizer works on English text only
5. Original transcript remains in mixed languages for doctor review

### Report Generation with 5-Second Loader

```typescript
const handleGenerateReport = async () => {
  setGenerating(true);
  await new Promise(r => setTimeout(r, 5000)); // Fake delay
  setGenerating(false);
  setShowReport(true);
  
  // Auto-scroll to report
  setTimeout(() => {
    document.getElementById("consultation-report")?.scrollIntoView({ 
      behavior: "smooth", 
      block: "start" 
    });
  }, 100);
};
```

---

## User Workflow

### Step-by-Step Guide

1. **Navigate to Patient**:
   - Go to Patients list
   - Click "View detail" on a patient
   - Click "New appointment" tab

2. **Select Language**:
   - Choose from: 🇺🇸 English, 🇫🇷 Français, 🇷🇼 Kinyarwanda
   - Can switch mid-consultation

3. **Start Consultation**:
   - Click "Start" button
   - Grant microphone permission (first time)
   - Speak naturally about patient's condition
   - Watch waveform animate and transcript appear

4. **Review Transcript**:
   - Interim text shows in yellow badge (temporary)
   - Final text appears in main textarea
   - Can manually edit transcript if needed

5. **Stop Recording**:
   - Click "Stop" button
   - AI automatically regenerates summary

6. **Review AI Summary**:
   - Check detected symptoms
   - Verify duration
   - Review possible diagnosis
   - Confirm treatment recommendations
   - Add additional notes

7. **Edit if Needed**:
   - All fields are editable
   - Click "Regenerate" to re-run AI on current transcript
   - Click "Restart" to clear everything (with confirmation)

8. **Generate Report**:
   - Click "Generate Report" button
   - Wait 5 seconds (loader animation)
   - Page auto-scrolls to report

9. **Print/Download**:
   - Click "Print / Download PDF"
   - Choose printer or "Save as PDF"
   - Report includes all patient data, vitals, transcript, and summary

---

## API Reference

### Component Props

```typescript
interface NewAppointmentDesignProps {
  // No props - self-contained component
}
```

### Key Functions

#### `startRecognition()`
Initializes speech recognition and audio visualization.

```typescript
const startRecognition = async () => {
  // Initialize SpeechRecognition
  // Set up audio context and analyser
  // Start recording
};
```

#### `stopRecognition()`
Stops recording and auto-regenerates summary.

```typescript
const stopRecognition = () => {
  // Stop recognition
  // Close audio context
  // Trigger auto-regenerate after 500ms
};
```

#### `localSummarize(text: string)`
Extracts medical information from transcript.

```typescript
const localSummarize = (text: string) => {
  // Translate segments to English
  // Extract symptoms, duration, diagnosis, treatment
  // Update state
};
```

#### `translateLocal(text: string, from: string)`
Translates medical terms using dictionary.

```typescript
const translateLocal = (text: string, from: string) => {
  // Return text if already English
  // Apply dictionary replacements
  // Return translated text
};
```

#### `handleGenerateReport()`
Generates report with loader and auto-scroll.

```typescript
const handleGenerateReport = async () => {
  // Show loader
  // Wait 5 seconds
  // Show report
  // Auto-scroll to report
};
```

#### `handleRestart()`
Clears all data with confirmation.

```typescript
const handleRestart = () => {
  // Show confirmation dialog
  // Clear all state if confirmed
  // Stop recording if active
};
```

---

## Customization

### Adding New Languages

1. **Add to language selector**:
```typescript
<option value="sw-KE">🇰🇪 Swahili</option>
```

2. **Add translation dictionary**:
```typescript
const maps: Record<string, Record<string, string>> = {
  "sw": {
    "maumivu": "pain",
    "homa": "fever",
    // ... more terms
  }
};
```

### Adding New Symptoms/Diagnoses

**Symptoms**:
```typescript
const symptomsKeys = [
  "pain", "ache", "headache", 
  "new-symptom", // Add here
];
```

**Diagnoses**:
```typescript
const diagKeys = {
  "new-diagnosis": ["symptom1", "symptom2", "symptom3"],
};
```

### Customizing Report Design

Edit the report JSX in the `showReport` section:

```typescript
{showReport && (
  <div id="consultation-report" className="...">
    {/* Customize header, sections, footer */}
  </div>
)}
```

### Adjusting Loader Duration

Change the timeout in `handleGenerateReport`:

```typescript
await new Promise(r => setTimeout(r, 3000)); // 3 seconds instead of 5
```

---

## Browser Compatibility

### Speech Recognition
- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)
- ❌ Firefox (not supported - requires polyfill)

### Web Audio API
- ✅ All modern browsers

### Print Styles
- ✅ All modern browsers

---

## Future Enhancements

1. **Offline Speech Recognition**:
   - Integrate Vosk or Whisper WASM
   - No internet required

2. **Advanced AI Summarization**:
   - Use local LLM (e.g., Llama.cpp WASM)
   - Better context understanding

3. **Voice Commands**:
   - "Next section", "Save report", etc.

4. **Multi-speaker Detection**:
   - Distinguish doctor vs patient speech

5. **Prescription Generation**:
   - Auto-generate prescription from treatment field

6. **Integration with RxDB**:
   - Save consultations to local database
   - Sync when online

---

## Troubleshooting

### Issue: Duplicate text in transcript
**Solution**: Already fixed - interim results are shown separately.

### Issue: Speech recognition not working
**Possible causes**:
- Browser doesn't support Web Speech API (use Chrome/Edge)
- Microphone permission denied
- No internet connection (Web Speech API requires internet)

### Issue: Wrong language detected
**Solution**: Ensure correct language is selected before starting.

### Issue: AI summary not accurate
**Solution**: 
- Edit fields manually
- Click "Regenerate" after editing transcript
- Add more keywords to detection arrays

### Issue: Report not printing correctly
**Solution**: 
- Ensure print styles are loaded
- Use "Print / Download PDF" button, not browser's Ctrl+P
- Check print preview before printing

---

## Performance Considerations

- **Memory**: Audio context and analyser are cleaned up on stop
- **CPU**: Waveform rendering uses `requestAnimationFrame` for smooth 60fps
- **Network**: Speech recognition requires internet (Web Speech API limitation)
- **Storage**: Reports are generated on-demand, not stored

---

## Security & Privacy

- **Microphone Access**: Requested only when user clicks "Start"
- **Data Storage**: No data sent to external servers (except Web Speech API)
- **Patient Data**: Extracted from DOM (ensure proper access control)
- **Reports**: Generated client-side, no server upload

---

## License

This feature is part of the eClinic Healthcare Management System.
© 2024 eClinic. All rights reserved.
