"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Call,
  Edit,
  Trash,
  Calendar,
  User,
  Star,
  Book,
  Activity,
  Heart,
  HeartCircle,
  More,
  SearchNormal1,
  Filter,
  ArrowDown2,
  DocumentDownload,
  Microphone2,
  Stop,
  TickCircle,
  DocumentText,
  Health,
  ArrowLeft,
} from "iconsax-react";
import { apiService } from "@/services/api";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [patientRaw, setPatientRaw] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getPatient(patientId);
        if (res?.success) setPatientRaw(res.data);
      } catch {
        setPatientRaw(null);
      }
    };
    if (patientId) load();
  }, [patientId]);

  const formatAddress = (addr: any): string => {
    if (!addr) return "N/A";
    if (typeof addr === "string") return addr || "N/A";
    const parts = [addr.street, addr.city, addr.state, addr.zip_code || addr.zipCode].filter(Boolean);
    return parts.length ? parts.join(", ") : "N/A";
  };

  const patient = useMemo(() => {
    const p = patientRaw || {};
    const first = p.first_name || p.firstName || "";
    const last = p.last_name || p.lastName || "";
    return {
      id: p.id ?? patientId ?? "N/A",
      firstName: first || "N/A",
      lastName: last || "N/A",
      address: formatAddress(p.address),
      phone: p.phone || "N/A",
      lastVisited: p.last_visited_at || null,
      email: p.email || "N/A",
      gender: p.gender || "N/A",
      birthday: p.birthday || p.date_of_birth || "N/A",
      bloodGroup: p.blood_group || "N/A",
      vitalSigns: p.vital_signs || {},
    };
  }, [patientRaw, patientId]);

  const [activeTab, setActiveTab] = useState<"history" | "new">("history");
  const initials = `${patient.firstName?.[0] || "N"}${patient.lastName?.[0] || "A"}`.toUpperCase();

  // Consultations state
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loadingConsults, setLoadingConsults] = useState<boolean>(false);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [detailItem, setDetailItem] = useState<any | null>(null);

  const loadConsultations = async () => {
      try {
        setLoadingConsults(true);
        const res = await apiService.getPatientConsultations(patientId);
        if (res?.success) {
          setConsultations(res.data || []);
        } else {
          setConsultations([]);
        }
      } catch {
        setConsultations([]);
      } finally {
        setLoadingConsults(false);
      }
  };
  useEffect(() => { if (patientId) loadConsultations(); }, [patientId]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {/* Back to Patients Link */}
      <button
        onClick={() => router.push("/dashboard/patients")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition"
      >
        <ArrowLeft size={16} />
        <span>Back to Patients</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-stretch gap-4">
          {/* Left: avatar + info */}
          <div className="flex items-center md:items-start gap-4 flex-1">
            <div className="w-28 h-28 bg-gray-100 rounded-md flex items-center justify-center text-2xl font-semibold text-primary shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">ID Number</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{patient.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Names</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{patient.firstName} {patient.lastName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{patient.address || "N/A"}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{patient.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-gray-500">Last visited:</span>
                  <span className="font-medium">{patient.lastVisited ? new Date(patient.lastVisited).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex flex-col items-stretch justify-between w-full md:w-48">
            <div className="grid grid-cols-3 gap-2">
              <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center justify-center">
                <Call size={18} className="text-primary" />
              </button>
              <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center justify-center">
                <Edit size={18} className="text-gray-700" />
              </button>
              <button className="p-2 border border-gray-200 rounded-md hover:bg-red-50 flex items-center justify-center">
                <Trash size={18} className="text-red-600" />
              </button>
            </div>
            <button className="mt-2 w-full flex items-center justify-center gap-2 bg-primary text-white text-sm rounded-md py-2 hover:bg-opacity-90">
              <Calendar size={16} className="text-white" />
              <span>New appointment</span>
            </button>
          </div>
        </div>
      </div>

        {/* Two side by side cards */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* About (2/5) */}
          <div className="bg-white border border-gray-200 rounded-lg lg:w-2/5 w-full">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">About</h3>
            </div>

            <div className="p-4">
              {/* 2 columns */}
              <div className="grid pb-2 grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Birthday", value: patient.birthday || "N/A", icon: <Calendar size={16} className="text-gray-400" /> },
                  { label: "Blood Group", value: patient.bloodGroup || "N/A", icon: <HeartCircle size={16} className="text-gray-400" /> },
                  { label: "Gender", value: patient.gender || "N/A", icon: <User size={16} className="text-gray-400" /> },
                  { label: "Email", value: patient.email || "N/A", icon: <DocumentDownload size={16} className="text-gray-400" /> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="ml-auto sm:ml-0 order-2 sm:order-1 w-8 h-8 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div className="order-1 sm:order-2">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vital Signs (3/5) */}
          <div className="bg-white border border-gray-200 rounded-lg lg:w-3/5 w-full">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Book size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Vital Signs</h3>
            </div>

            <div className="p-4">
              {/* 3 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {(() => {
                  const vs = patient.vitalSigns || {};
                  const items = [
                    { label: "Blood Pressure", value: vs.blood_pressure ? `${vs.blood_pressure}` : "N/A", ok: !!vs.blood_pressure, icon: <Activity size={16} className="text-gray-400" /> },
                    { label: "Heart Rate", value: vs.heart_rate != null ? `${vs.heart_rate} bpm` : "N/A", ok: vs.heart_rate != null, icon: <Heart size={16} className="text-gray-400" /> },
                    { label: "SPO2", value: vs.spo2 != null ? `${vs.spo2}%` : "N/A", ok: vs.spo2 != null, icon: <Activity size={16} className="text-gray-400" /> },
                    { label: "Temperature", value: vs.temperature != null ? `${vs.temperature}°C` : "N/A", ok: vs.temperature != null, icon: <Activity size={16} className="text-gray-400" /> },
                    { label: "Respiratory rate", value: vs.respiratory_rate != null ? `${vs.respiratory_rate} bpm` : "N/A", ok: vs.respiratory_rate != null, icon: <Activity size={16} className="text-gray-400" /> },
                    { label: "Weight", value: vs.weight != null ? `${vs.weight} kg` : "N/A", ok: vs.weight != null, icon: <Activity size={16} className="text-gray-400" /> },
                  ];
                  return items;
                })().map((v) => (
                  <div key={v.label} className="flex items-center gap-3">
                    <div className="ml-auto sm:ml-0 order-2 sm:order-1 w-8 h-8 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center">
                      {v.icon}
                    </div>
                    <div className="order-1 sm:order-2 flex-1">
                      <p className="text-xs text-gray-500">{v.label}</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${v.ok ? "bg-green-500" : "bg-red-500"}`} />
                        <p className="text-sm font-medium text-gray-900">{v.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>



      {/* Switch Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 pt-3">
          <div className="flex items-center gap-6">
            <button
              className={`pb-2 text-sm font-medium ${activeTab === "history" ? "text-primary border-b-2 border-primary" : "text-gray-600"}`}
              onClick={() => setActiveTab("history")}
            >
              Patients Data History
            </button>
            <button
              className={`pb-2 text-sm font-medium ${activeTab === "new" ? "text-primary border-b-2 border-primary" : "text-gray-600"}`}
              onClick={() => setActiveTab("new")}
            >
              New appointment
            </button>
          </div>
        </div>
        <div className="h-px bg-gray-200" />

        {activeTab === "history" ? (
          <HistoryTable
            consultations={consultations}
            loading={loadingConsults}
            onView={(item: any) => {
              setDetailItem(item);
              setDetailOpen(true);
            }}
          />
        ) : (
          <NewAppointmentDesign patientId={patientId} onSaved={loadConsultations} />
        )}
      </div>

      {/* Consultation Detail Modal */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailOpen(false)} />
          <div className="relative bg-white w-full max-w-xl mx-4 rounded-lg border border-gray-200 shadow-lg">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Consultation detail</h3>
              <button onClick={() => setDetailOpen(false)} className="text-gray-500 text-sm">Close</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="text-sm font-medium text-gray-900">{detailItem?.created_at ? new Date(detailItem.created_at).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Doctor</p>
                  <p className="text-sm font-medium text-gray-900">{(() => {
                    const d = detailItem?.doctor || {};
                    const fromNames = (d.first_name || '') + ' ' + (d.last_name || '');
                    const full = fromNames.trim() || d.name || (detailItem?.doctor_id ? `#${detailItem.doctor_id}` : 'N/A');
                    return full || 'N/A';
                  })()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Title</p>
                  <p className="text-sm font-medium text-gray-900">{detailItem?.title || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Report</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{detailItem?.report || 'N/A'}</p>
              </div>
              {/* Vitals in detail if present */}
              {detailItem?.vitals && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Vital Signs</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Blood Pressure', value: detailItem.vitals?.blood_pressure },
                      { label: 'Heart Rate', value: detailItem.vitals?.heart_rate != null ? `${detailItem.vitals.heart_rate} bpm` : null },
                      { label: 'SPO2', value: detailItem.vitals?.spo2 != null ? `${detailItem.vitals.spo2}%` : null },
                      { label: 'Temperature', value: detailItem.vitals?.temperature != null ? `${detailItem.vitals.temperature}°C` : null },
                      { label: 'Respiratory rate', value: detailItem.vitals?.respiratory_rate != null ? `${detailItem.vitals.respiratory_rate} bpm` : null },
                      { label: 'Weight', value: detailItem.vitals?.weight != null ? `${detailItem.vitals.weight} kg` : null },
                    ].map((v) => (
                      <div key={v.label} className="flex items-center justify-between border border-gray-100 rounded-md px-3 py-2">
                        <span className="text-xs text-gray-500">{v.label}</span>
                        <span className="text-sm font-medium text-gray-900">{v.value ?? 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTable({ consultations, loading, onView }: { consultations: any[]; loading: boolean; onView: (item: any) => void }) {
  const [openRow, setOpenRow] = useState<number | null>(null);
  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <SearchNormal1 size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full border border-gray-200 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Search" />
          </div>
          <div className="flex items-center gap-2">
            <input type="date" className="border border-gray-200 rounded-md px-2 py-2 text-sm" />
            <span className="text-xs text-gray-500">to</span>
            <input type="date" className="border border-gray-200 rounded-md px-2 py-2 text-sm" />
          </div>
        </div>
        <div className="relative">
          <button className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white hover:bg-gray-50 flex items-center gap-2">
            <Filter size={16} />
            <span>Filter</span>
            <ArrowDown2 size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-200">
              <th className="py-2 px-3 font-medium">Date & Time</th>
              <th className="py-2 px-3 font-medium">Doctor</th>
              <th className="py-2 px-3 font-medium">Title</th>
              <th className="py-2 px-3 font-medium">Actions</th>
              <th className="py-2 px-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr><td className="py-3 px-3 text-gray-500" colSpan={5}>Loading...</td></tr>
            ) : consultations.length === 0 ? (
              <tr><td className="py-3 px-3 text-gray-500" colSpan={5}>No consultations found.</td></tr>
            ) : (
              consultations.map((c: any) => {
                const dt = c.created_at ? new Date(c.created_at) : null;
                const when = dt ? dt.toLocaleString() : 'N/A';
                const doctorName = c.doctor?.first_name || c.doctor?.last_name
                  ? `${c.doctor?.first_name || ''} ${c.doctor?.last_name || ''}`.trim()
                  : (c.doctor?.name || `#${c.doctor_id || 'N/A'}`);
                return (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-3">{when}</td>
                    <td className="py-2.5 px-3">{doctorName || 'N/A'}</td>
                    <td className="py-2.5 px-3">{c.title || 'N/A'}</td>
                    <td className="py-2.5 px-3">
                      <button className="text-xs text-primary hover:underline" onClick={() => onView(c)}>View detail</button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="relative inline-flex">
                        <button onClick={() => setOpenRow(openRow === c.id ? null : c.id)} className="p-1.5 hover:bg-gray-100 border border-gray-200 rounded-md">
                          <More size={16} className="text-gray-600" />
                        </button>
                        {openRow === c.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <button className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50" onClick={() => onView(c)}>View detail</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-gray-500">Showing 1 to 5 of 25 results</p>
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 text-sm border border-gray-200 rounded-md bg-white">Prev</button>
          {[1, 2, 3, 4, 5].map((p) => (
            <button key={p} className={`px-2.5 py-1 text-sm border rounded-md ${p === 1 ? "bg-primary text-white border-primary" : "bg-white border-gray-200"}`}>{p}</button>
          ))}
          <button className="px-2 py-1 text-sm border border-gray-200 rounded-md bg-white">Next</button>
        </div>
      </div>
    </div>
  );
}

function NewAppointmentDesign({ patientId, onSaved }: { patientId: string; onSaved: () => void }) {
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
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [recognitionRef] = useState<{ rec: any | null }>({ rec: null });
  const [debounceTimer, setDebounceTimer] = useState<any>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [source, setSource] = useState<MediaStreamAudioSourceNode | null>(null);
  const canvasId = "stt-waveform-canvas";

  const startRecognition = async () => {
    if (recognitionRef.rec) {
      try { recognitionRef.rec.stop(); } catch {}
      recognitionRef.rec = null;
    }
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Live speech-to-text not supported in this browser");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (event: any) => {
      let interim = "";
      let finalChunks: string[] = [];
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          const chunk = res[0].transcript.trim();
          if (chunk) finalChunks.push(chunk);
        } else {
          interim += (interim ? " " : "") + res[0].transcript;
        }
      }
      
      // Update final transcript only with finalized chunks
      if (finalChunks.length > 0) {
        setTranscript((prev) => {
          const newText = prev + (prev ? " " : "") + finalChunks.join(" ");
          return newText;
        });
        finalChunks.forEach(chunk => {
          setSegments((s) => [...s, { text: chunk, lang }]);
        });
      }
      
      // Show interim separately (not appended to transcript)
      setInterimText(interim);
      
      // Trigger live summarization on final text
      if (finalChunks.length > 0) {
        setTimeout(() => {
          setTranscript((current) => {
            localSummarize(current);
            return current;
          });
        }, 100);
      }
    };
    rec.onerror = () => {};
    rec.onend = () => {
      if (recording) {
        try { rec.start(); } catch {}
      }
    };
    try { rec.start(); } catch {}
    recognitionRef.rec = rec;
    setRecording(true);

    // setup audio waveform
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      setAudioCtx(ctx);
      setAnalyser(an);
      setSource(src);
      drawWaveform(an);
    } catch {}
  };

  const stopRecognition = () => {
    setRecording(false);
    if (recognitionRef.rec) {
      try { recognitionRef.rec.stop(); } catch {}
      recognitionRef.rec = null;
    }
    if (audioCtx) {
      try { audioCtx.close(); } catch {}
      setAudioCtx(null);
      setAnalyser(null);
      setSource(null);
    }
    // Auto-regenerate summary when stopping
    setTimeout(() => {
      if (transcript) {
        regenerateSummary();
      }
    }, 500);
  };

  const translateLocal = (text: string, from: string) => {
    if (!text) return "";
    if (from.startsWith("en")) return text;
    // lightweight dictionary-based replacements for key medical terms
    const maps: Record<string, Record<string, string>> = {
      "fr": {
        "douleur": "pain",
        "fièvre": "fever",
        "toux": "cough",
        "mal de tête": "headache",
        "maux de tête": "headache",
        "fatigue": "fatigue",
        "nausée": "nausea",
        "vomissement": "vomiting",
        "diarrhée": "diarrhea",
        "frissons": "chills",
        "grippe": "flu",
        "infection": "infection",
        "paludisme": "malaria",
        "typhoïde": "typhoid",
        "paracétamol": "paracetamol",
        "repos": "rest",
        "hydratation": "hydration",
        "depuis": "for",
        "jour": "day",
        "jours": "days",
        "semaine": "week",
        "semaines": "weeks",
        "mois": "months",
        "heure": "hour",
        "heures": "hours",
      },
      "rw": {
        "umuriro": "fever",
        "inkorora": "cough",
        "umutwe": "headache",
        "kubabara": "pain",
        "kunanirwa": "fatigue",
        "isungu": "diarrhea",
        "malaria": "malaria",
        "grippe": "flu",
        "imiti": "medication",
        "paracetamol": "paracetamol",
        "uruhuko": "rest",
        "iminsi": "days",
        "icyumweru": "week",
        "amezi": "months",
        "isaha": "hour",
      },
    };
    const key = from.slice(0,2);
    const dict = maps[key];
    if (!dict) return text;
    let out = text;
    for (const [k, v] of Object.entries(dict)) {
      const re = new RegExp(`\\b${k}\\b`, 'gi');
      out = out.replace(re, v);
    }
    return out;
  };

  const localSummarize = (text: string) => {
    if (!text || text.trim().length < 5) return;
    
    // build English input from segments if available
    const englishText = segments.length
      ? segments.map((s) => translateLocal(s.text, s.lang)).join(' ')
      : translateLocal(text, lang);
    const t = (englishText || "").toLowerCase();
    
    // Extract symptoms - look for medical keywords
    const symptomsKeys = ["pain", "ache", "headache", "belly", "stomach", "back", "chest", "fever", "cough", "fatigue", "tired", "vomit", "nausea", "diarrhea", "sore", "chills", "hurt", "sick", "weak", "dizzy", "swelling", "rash", "itch", "throat"];
    const foundSymptoms: string[] = [];
    symptomsKeys.forEach(key => {
      if (t.includes(key)) {
        foundSymptoms.push(key);
      }
    });
    if (foundSymptoms.length > 0) {
      setSymptoms(foundSymptoms.join(", "));
    }
    
    // Extract duration
    const durMatch = t.match(/(\d+)\s*(day|days|week|weeks|month|months|hour|hours|year|years)/);
    if (durMatch) {
      setDuration(durMatch[0]);
    }
    
    // Possible diagnosis based on symptoms
    const diagKeys = {
      "malaria": ["fever", "chills", "headache"],
      "flu": ["fever", "cough", "fatigue", "ache"],
      "gastritis": ["stomach", "belly", "nausea"],
      "migraine": ["headache", "dizzy"],
      "infection": ["fever", "pain", "swelling"],
      "allergy": ["rash", "itch", "swelling"],
    };
    
    const possibleDiag: string[] = [];
    Object.entries(diagKeys).forEach(([diag, symptoms]) => {
      const matches = symptoms.filter(s => foundSymptoms.includes(s));
      if (matches.length >= 2) {
        possibleDiag.push(diag);
      }
    });
    if (possibleDiag.length > 0) {
      setDiagnosis(possibleDiag.join(" or "));
    }
    
    // Treatment suggestions
    const rxKeys = ["paracetamol", "ibuprofen", "antibiotic", "rest", "hydration", "ORS", "aspirin", "medication"];
    const foundRx: string[] = [];
    rxKeys.forEach(key => {
      if (t.includes(key)) {
        foundRx.push(key);
      }
    });
    
    // Auto-suggest treatment based on symptoms
    if (foundSymptoms.includes("headache") || foundSymptoms.includes("pain")) {
      if (!foundRx.includes("paracetamol")) foundRx.push("paracetamol");
    }
    if (foundSymptoms.includes("fever")) {
      if (!foundRx.includes("rest")) foundRx.push("rest");
      if (!foundRx.includes("hydration")) foundRx.push("hydration");
    }
    
    if (foundRx.length > 0) {
      setTreatment(foundRx.join(", "));
    }
  };

  const onTranscriptChange = (val: string) => {
    setTranscript(val);
    if (debounceTimer) clearTimeout(debounceTimer);
    const t = setTimeout(() => localSummarize(val), 400);
    setDebounceTimer(t);
  };

  const drawWaveform = (an: AnalyserNode) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bufferLength = an.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!recording || !analyser) return; // stop when not recording
      an.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#fef2f2");
      gradient.addColorStop(1, "#fee2e2");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Modern bar visualization
      const barCount = 60;
      const barWidth = canvas.width / barCount;
      const barGap = 2;
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex];
        const barHeight = (value / 255) * canvas.height * 0.8;
        
        const x = i * barWidth;
        const y = canvas.height - barHeight;
        
        // Gradient for bars
        const barGradient = ctx.createLinearGradient(x, y, x, canvas.height);
        barGradient.addColorStop(0, "#ef4444");
        barGradient.addColorStop(0.5, "#f87171");
        barGradient.addColorStop(1, "#fca5a5");
        
        ctx.fillStyle = barGradient;
        ctx.fillRect(x + barGap / 2, y, barWidth - barGap, barHeight);
        
        // Add rounded top
        ctx.beginPath();
        ctx.arc(x + barWidth / 2, y + 2, (barWidth - barGap) / 2, Math.PI, 0);
        ctx.fill();
      }
      
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      // optional: brief UX delay
      await new Promise((r) => setTimeout(r, 800));
      // Build a concise report from transcript and summary data
      const parts: string[] = [];
      if (transcript) parts.push(`Transcript:\n${transcript}`);
      if (symptoms) parts.push(`Symptoms: ${symptoms}`);
      if (duration) parts.push(`Duration: ${duration}`);
      if (diagnosis) parts.push(`Possible diagnosis: ${diagnosis}`);
      if (treatment) parts.push(`Recommended treatment: ${treatment}`);
      if (comment) parts.push(`Comment: ${comment}`);
      const reportText = parts.join("\n\n");

      const payload: any = {
        patient_id: patientId,
        title: diagnosis || 'Consultation',
        report: reportText || 'N/A',
      };
      // Save consultation
      const res = await apiService.createConsultation(payload);
      if (res?.success) {
        setShowReport(true);
        onSaved && onSaved();
        // Auto-scroll to report
        setTimeout(() => {
          const reportEl = document.getElementById('consultation-report');
          if (reportEl) {
            reportEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        alert(res?.message || 'Failed to save consultation');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to save consultation');
    } finally {
      setGenerating(false);
    }
  };

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart? All current data will be lost and cannot be recovered.")) {
      setTranscript("");
      setInterimText("");
      setSegments([]);
      setSymptoms("");
      setDuration("");
      setDiagnosis("");
      setTreatment("");
      setComment("");
      setShowReport(false);
      if (recording) {
        stopRecognition();
      }
    }
  };

  const regenerateSummary = () => {
    // Clear existing summary
    setSymptoms("");
    setDuration("");
    setDiagnosis("");
    setTreatment("");
    // Re-run summarization
    setTimeout(() => localSummarize(transcript), 100);
  };

  const generateReport = () => {
    const reportHtml = `
      <html>
      <head>
        <title>Consultation Report</title>
        <style>
          body{font-family:ui-sans-serif,system-ui; padding:24px; color:#111827}
          h1{font-size:18px;margin:0 0 8px;font-weight:700}
          h2{font-size:14px;margin:16px 0 8px;font-weight:600;border-bottom:1px solid #E5E7EB;padding-bottom:4px}
          .grid{display:grid;gap:8px}
          .two{grid-template-columns:1fr 1fr}
          .card{border:1px solid #E5E7EB;border-radius:8px;padding:12px;margin-top:8px}
          .muted{color:#6B7280;font-size:12px}
          .kv{display:flex;justify-content:space-between;margin:4px 0}
          .badge{display:inline-block;padding:2px 8px;border:1px solid #D1D5DB;border-radius:999px;font-size:12px}
          header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #E5E7EB;padding-bottom:8px;margin-bottom:10px}
          .brand{font-weight:700;color:#111827}
          .qr{width:88px;height:88px;border:1px solid #D1D5DB;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#6B7280}
          @media print { .no-print{display:none} }
        </style>
      </head>
      <body>
        <header>
          <div>
            <div class="brand">eClinic</div>
            <div class="muted">Consultation Report • ${new Date().toLocaleString()}</div>
          </div>
          <div class="qr">QR ${escapeHtml(((document.querySelector("p.text-sm.font-medium.text-gray-900.break-all") as any)?.textContent)||"")}</div>
        </header>

        <h2>Patient Info</h2>
        <div class="grid two">
          <div class="kv"><span>ID Number</span><strong>${(document.querySelector("p.text-sm.font-medium.text-gray-900.break-all") as any)?.textContent || ""}</strong></div>
          <div class="kv"><span>Names</span><strong>${(document.querySelector("p.text-sm.font-medium.text-gray-900.truncate") as any)?.textContent || ""}</strong></div>
          <div class="kv"><span>Address</span><strong>${(document.querySelectorAll("p.text-sm.font-medium.text-gray-900.truncate") as any)[1]?.textContent || ""}</strong></div>
          <div class="kv"><span>Phone</span><strong>${findInnerTextContains("Phone:")}</strong></div>
          <div class="kv"><span>Last visited</span><strong>${findInnerTextContains("Last visited:")}</strong></div>
        </div>

        <h2>About</h2>
        <div class="grid two">
          ${collectAbout()}
        </div>

        <h2>Vital Signs</h2>
        <div class="grid two">
          ${collectVitals()}
        </div>

        <h2>Transcript & Summary</h2>
        <div class="card">
          <div class="kv"><span>Transcript</span></div>
          <div class="muted" style="white-space:pre-wrap">${escapeHtml(transcript)}</div>
        </div>
        <div class="grid two">
          <div class="card">
            <div class="kv"><span>Symptoms</span></div>
            <div>${escapeHtml(symptoms || "")}</div>
          </div>
          <div class="card">
            <div class="kv"><span>Duration</span></div>
            <div>${escapeHtml(duration || "")}</div>
          </div>
          <div class="card">
            <div class="kv"><span>Possible diagnosis</span></div>
            <div>${escapeHtml(diagnosis || "")}</div>
          </div>
          <div class="card">
            <div class="kv"><span>Recommended treatment</span></div>
            <div>${escapeHtml(treatment || "")}</div>
          </div>
        </div>

        <h2>Comment</h2>
        <div class="card">${escapeHtml(comment || "")}</div>

        <div class="no-print" style="margin-top:16px">
          <button onclick="window.print()" style="padding:8px 12px;border:1px solid #D1D5DB;border-radius:6px;background:#fff">Print / Download PDF</button>
        </div>
      </body>
      </html>
    `;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(reportHtml);
    w.document.close();
  };

  const escapeHtml = (s: string) => s.replace(/[&<>"]+/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c] as string));
  const findInnerTextContains = (label: string) => {
    const els = Array.from(document.querySelectorAll("div.flex.items-center.gap-2.text-sm.text-gray-700"));
    const el = els.find((e) => e.textContent?.includes(label));
    return el ? (el.querySelector("span.font-medium") as any)?.textContent || "" : "";
  };
  const collectAbout = () => {
    const items = Array.from(document.querySelectorAll("div.bg-white.border.rounded-lg:nth-of-type(1) .p-4 .grid > div"));
    return items
      .map((el: any) => {
        const label = el.querySelector("p.text-xs.text-gray-500")?.textContent || "";
        const value = el.querySelector("p.text-sm.font-medium.text-gray-900")?.textContent || "";
        return `<div class=\"kv\"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
      })
      .join("");
  };
  const collectVitals = () => {
    const rootCards = Array.from(document.querySelectorAll("div.grid.grid-cols-1.lg\\:grid-cols-2.gap-4 > div"));
    const vitalCard = rootCards[1] as HTMLElement | undefined;
    if (!vitalCard) return "";
    const items = Array.from(vitalCard.querySelectorAll(".p-4 .grid > div"));
    return items
      .map((el: any) => {
        const label = el.querySelector("p.text-xs.text-gray-500")?.textContent || "";
        const value = el.querySelector("p.text-sm.font-medium.text-gray-900")?.textContent || "";
        const okDot = el.querySelector("span.rounded-full") as HTMLElement | null;
        const ok = okDot && okDot.className.includes("bg-green-500");
        return `<div class=\"kv\"><span>${escapeHtml(label)}</span><span><span class=\"badge\" style=\"margin-right:6px;${ok ? "border-color:#10B981;color:#065F46;" : "border-color:#EF4444;color:#991B1B;"}\">${ok ? "OK" : "Alert"}</span><strong>${escapeHtml(value)}</strong></span></div>`;
      })
      .join("");
  };

  return (
    <div className="p-4 space-y-4">
      {/* Control Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">Language:</label>
            <select value={lang} onChange={(e) => {
              const v = e.target.value;
              setLang(v);
              if (recognitionRef.rec) {
                try { recognitionRef.rec.lang = v; } catch {}
              }
            }} className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-primary">
              <option value="en-US">🇺🇸 English</option>
              <option value="fr-FR">🇫🇷 Français</option>
              <option value="rw-RW">🇷🇼 Kinyarwanda</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <button disabled={recording} onClick={startRecognition} className={`px-4 py-2 text-sm rounded-md inline-flex items-center gap-2 font-medium transition ${recording ? "bg-gray-300 text-white cursor-not-allowed" : "bg-primary text-white hover:bg-opacity-90"}`}>
              <Microphone2 size={18} className="text-white" />
              {recording ? "Recording..." : "Start"}
            </button>
            <button disabled={!recording} onClick={stopRecognition} className="px-4 py-2 text-sm border border-gray-200 rounded-md bg-white inline-flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
              <Stop size={18} className="text-red-600" />
              Stop
            </button>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <button onClick={handleRestart} className="px-4 py-2 text-sm border border-red-200 rounded-md bg-white inline-flex items-center gap-2 hover:bg-red-50 transition text-red-600 font-medium">
              <Trash size={18} />
              Restart
            </button>
            <button onClick={regenerateSummary} className="px-4 py-2 text-sm border border-primary rounded-md bg-white inline-flex items-center gap-2 hover:bg-primary/5 transition text-primary font-medium">
              <Activity size={18} />
              Regenerate
            </button>
            <button onClick={handleGenerateReport} disabled={generating || !transcript} className="px-4 py-2 text-sm rounded-md bg-green-600 text-white inline-flex items-center gap-2 disabled:opacity-50 hover:bg-green-700 transition font-medium">
              <DocumentText size={18} className="text-white" />
              {generating ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transcript Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Waveform */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Live Audio</h3>
              {recording && <span className="flex items-center gap-2 text-xs text-red-600"><span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>Recording</span>}
            </div>
            <div className={`h-32 rounded-lg border-2 ${recording ? "border-red-400 bg-gradient-to-br from-red-50 to-pink-50" : "border-dashed border-gray-300 bg-gray-50"} flex items-center justify-center overflow-hidden`}>
              {recording ? (
                <canvas id={canvasId} className="w-full h-full" width={800} height={128} />
              ) : (
                <div className="text-center text-gray-400">
                  <Microphone2 size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click Start to begin recording</p>
                </div>
              )}
            </div>
          </div>

          {/* Transcript */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Full Transcript <small className="font-normal text-gray-400">(Or you can manually type)</small></h3>
            <div className="relative">
              <textarea 
                value={transcript} 
                onChange={(e) => onTranscriptChange(e.target.value)} 
                className="w-full border border-gray-200 rounded-lg p-3 text-sm h-64 focus:ring-2 focus:ring-primary focus:border-transparent resize-none" 
                placeholder="Your spoken words will appear here in real-time..."
              />
              {interimText && (
                <div className="absolute bottom-3 left-3 right-3 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-xs text-yellow-800 italic">
                  {interimText}...
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{transcript.split(/\s+/).filter(w => w).length} words</span>
              <span>{segments.length} segments</span>
            </div>
          </div>
        </div>

        {/* Summary Section - Takes 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">AI Summary</h3>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Live</span>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Symptoms</label>
                <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary" rows={3} placeholder="Auto-detected symptoms..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Duration</label>
                <input value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary" placeholder="e.g., 3 days" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Possible Diagnosis</label>
                <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary" placeholder="Auto-detected diagnosis..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Recommended Treatment</label>
                <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary" rows={3} placeholder="Treatment suggestions..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Additional Notes</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary" rows={3} placeholder="Add your notes here..."></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Page Loader */}
      {generating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Report</h3>
            <p className="text-sm text-gray-600">Please wait while we compile your consultation data...</p>
          </div>
        </div>
      )}

      {showReport && (
        <div
        id="consultation-report"
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden text-gray-800"
        >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold tracking-tight">Consultation Report</h3>
            <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
            <DocumentDownload size={16} />
            Print / Download PDF
            </button>
        </div>

        <div id="printable-report" className="p-6 space-y-6">
            {/* Report Header with QR Code */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
            <div>
                <div className="flex items-center gap-2 mb-2">
                <Health size={32} className="text-gray-700" />
                <div>
                    <div className="text-2xl font-bold text-gray-800">eClinic</div>
                    <div className="text-xs text-gray-500">Healthcare Management System</div>
                </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                <div>TrustCare Clinic, Musanze</div>
                <div>Phone: +250 788 000 000</div>
                <div className="font-medium mt-1">
                    Report Date: {new Date().toLocaleDateString()} at{" "}
                    {new Date().toLocaleTimeString()}
                </div>
                </div>
            </div>
            <div className="text-center">
                <div className="w-24 h-24 border border-gray-300 rounded-md flex items-center justify-center bg-white mb-1">
                <div className="text-center text-xs text-gray-600">
                    QR CODE
                    <div className="text-[10px] mt-1">
                    {(document.querySelector(
                        "p.text-sm.font-medium.text-gray-900.break-all"
                    ) as any)?.textContent?.slice(0, 8) || "N/A"}
                    </div>
                </div>
                </div>
                <div className="text-xs text-gray-500">Scan for details</div>
            </div>
            </div>

            {/* Patient Information */}
            <div className="border border-gray-200 rounded-md p-4 bg-white">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <User size={16} className="text-gray-700" />
                Patient Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                <span className="text-gray-600">ID Number:</span>{" "}
                <span className="font-medium">
                    {(document.querySelector(
                    "p.text-sm.font-medium.text-gray-900.break-all"
                    ) as any)?.textContent || "N/A"}
                </span>
                </div>
                <div>
                <span className="text-gray-600">Name:</span>{" "}
                <span className="font-medium">
                    {(document.querySelector(
                    "p.text-sm.font-medium.text-gray-900.truncate"
                    ) as any)?.textContent || ""}
                </span>
                </div>
                <div>
                <span className="text-gray-600">Phone:</span>{" "}
                <span className="font-medium">
                    {(
                    Array.from(document.querySelectorAll("span.font-medium")).find(
                        (el) => el.textContent?.startsWith("+")
                    ) as any
                    )?.textContent || ""}
                </span>
                </div>
                <div>
                <span className="text-gray-600">Address:</span>{" "}
                <span className="font-medium">
                    {(
                    document.querySelectorAll(
                        "p.text-sm.font-medium.text-gray-900.truncate"
                    )[1] as any
                    )?.textContent || ""}
                </span>
                </div>
            </div>
            </div>

            {/* About Section */}
            <div className="border border-gray-200 rounded-md p-4 bg-white">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Star size={16} className="text-gray-700" />
                About Patient
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
                {(() => {
                const aboutCard = Array.from(
                    document.querySelectorAll("div.bg-white.border.rounded-lg")
                ).find((el) => el.textContent?.includes("About"));
                if (!aboutCard)
                    return (
                    <div className="col-span-2 text-gray-500">No data available</div>
                    );
                const items = Array.from(
                    aboutCard.querySelectorAll(".grid > div")
                ).slice(0, 4);
                return items.map((item: any, i: number) => {
                    const label =
                    item.querySelector("p.text-xs.text-gray-500")?.textContent || "";
                    const value =
                    item.querySelector("p.text-sm.font-medium.text-gray-900")
                        ?.textContent || "";
                    return (
                    <div key={i}>
                        <span className="text-gray-600">{label}:</span>{" "}
                        <span className="font-medium">{value}</span>
                    </div>
                    );
                });
                })()}
            </div>
            </div>

            {/* Vital Signs */}
            <div className="border border-gray-200 rounded-md p-4 bg-white">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Activity size={16} className="text-gray-700" />
                Vital Signs
            </h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
                {(() => {
                const vitalCard = Array.from(
                    document.querySelectorAll("div.bg-white.border.rounded-lg")
                ).find((el) => el.textContent?.includes("Vital Signs"));
                if (!vitalCard)
                    return (
                    <div className="col-span-3 text-gray-500">No data available</div>
                    );
                const items = Array.from(vitalCard.querySelectorAll(".grid > div"));
                return items.map((item: any, i: number) => {
                    const label =
                    item.querySelector("p.text-xs.text-gray-500")?.textContent || "";
                    const value =
                    item.querySelector("p.text-sm.font-medium.text-gray-900")
                        ?.textContent || "";
                    const dot = item.querySelector("span.rounded-full");
                    const isOk = dot?.className.includes("bg-green-500");
                    return (
                    <div key={i} className="flex items-center gap-2">
                        <span
                        className={`w-2 h-2 rounded-full ${
                            isOk ? "bg-green-500" : "bg-red-500"
                        }`}
                        ></span>
                        <div>
                        <span className="text-gray-600 text-xs">{label}:</span>{" "}
                        <span className="font-medium">{value}</span>
                        </div>
                    </div>
                    );
                });
                })()}
            </div>
            </div>

            {/* Consultation Transcript */}
            <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Microphone2 size={16} className="text-gray-700" />
                Consultation Transcript
            </h4>
            <div className="border border-gray-200 rounded-md p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {transcript || "No transcript available"}
            </div>
            </div>

            {/* AI Analysis Summary */}
            <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Activity size={16} className="text-gray-700" />
                AI Analysis Summary<small className="font-normal text-gray-400">(Reviewed by Dr. Vianney R.)</small>
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-md p-3">
                <div className="text-xs text-gray-500 uppercase mb-1">
                    Symptoms Detected
                </div>
                <div className="text-sm text-gray-700">{symptoms || "None detected"}</div>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                <div className="text-xs text-gray-500 uppercase mb-1">Duration</div>
                <div className="text-sm text-gray-700">{duration || "Not specified"}</div>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                <div className="text-xs text-gray-500 uppercase mb-1">
                    Possible Diagnosis
                </div>
                <div className="text-sm text-gray-700">
                    {diagnosis || "Pending evaluation"}
                </div>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                <div className="text-xs text-gray-500 uppercase mb-1">
                    Recommended Treatment
                </div>
                <div className="text-sm text-gray-700">
                    {treatment || "To be determined"}
                </div>
                </div>
            </div>
            </div>

            {/* Additional Notes */}
            {comment && (
            <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <DocumentText size={16} className="text-gray-700" />
                Additional Notes
                </h4>
                <div className="border border-gray-200 rounded-md p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {comment}
                </div>
            </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-gray-200 text-center space-y-1 text-xs text-gray-500">
            <div>
                This report was generated by eClinic AI Assistant on{" "}
                {new Date().toLocaleString()}
            </div>
            <div>For inquiries: TrustCare Clinic – +250 788 000 000</div>
            <div className="text-gray-400">
                © {new Date().getFullYear()} eClinic. All rights reserved.
            </div>
            </div>
        </div>
        </div>
      )}
    </div>
  );
}
