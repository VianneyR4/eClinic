'use client';

import { useEffect, useMemo, useState } from 'react';
import { More, Profile, Call, Sms, Location, Calendar } from 'iconsax-react';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  phone?: string;
  email?: string;
  address?: string;
  lastAppointment?: string;
}

interface DoctorListProps {
  onEdit?: (doctor: Doctor) => void;
  onDelete?: (id: string) => void;
  filters?: { q?: string; specialty?: string };
}

export default function DoctorList({ onEdit, onDelete, filters }: DoctorListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    // Mock doctors data
    setDoctors([
      { id: 'd1', firstName: 'Grace', lastName: 'Kamali', specialty: 'General Practitioner', phone: '+250788100001', email: 'grace@example.com', address: 'Kigali, Rwanda', lastAppointment: '2025-09-30T00:00:00Z' },
      { id: 'd2', firstName: 'Ibrahim', lastName: 'M.', specialty: 'Pediatrics', phone: '+250788100002', email: 'ibrahim@example.com', address: 'Musanze, Rwanda', lastAppointment: '2025-09-30T00:00:00Z' },
      { id: 'd3', firstName: 'Sofia', lastName: 'N.', specialty: 'Gynecology', phone: '+250788100003', email: 'sofia@example.com', address: 'Huye, Rwanda', lastAppointment: '2025-09-30T00:00:00Z' },
      { id: 'd4', firstName: 'Aaron', lastName: 'K.', specialty: 'Dermatology', phone: '+250788100004', email: 'aaron@example.com', address: 'Kayonza, Rwanda', lastAppointment: '2025-09-30T00:00:00Z' },
    ]);
  }, []);

  const filtered = useMemo(() => {
    const q = (filters?.q || '').toLowerCase();
    const spec = (filters?.specialty || '').toLowerCase();
    return doctors.filter(d => {
      const matchQ = !q || `${d.firstName} ${d.lastName} ${d.email} ${d.phone}`.toLowerCase().includes(q);
      const matchS = !spec || (d.specialty || '').toLowerCase().includes(spec);
      return matchQ && matchS;
    });
  }, [doctors, filters]);

  return (
    <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {filtered.map((doc) => {
        const initials = `${doc.firstName?.[0] || ''}${doc.lastName?.[0] || ''}`.toUpperCase();
        return (
          <li key={doc.id} className="relative bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {initials || <Profile size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-medium text-gray-900 truncate">{doc.firstName} {doc.lastName}</p>
                  <p className="text-sm text-gray-500 truncate">{doc.specialty || '—'}</p>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setMenuOpenId(menuOpenId === doc.id ? null : doc.id)} className="p-1.5 hover:bg-gray-100 border border-gray-200 rounded-md">
                  <More size={16} className="text-gray-600" />
                </button>
                {menuOpenId === doc.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">View detail</button>
                    {onEdit && <button onClick={() => onEdit(doc)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Edit</button>}
                    {onDelete && <button onClick={() => onDelete(doc.id)} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50">Delete</button>}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              {doc.lastAppointment && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  <span>Last appointment: {new Date(doc.lastAppointment).toLocaleDateString()}</span>
                </div>
              )}
              {!!doc.address && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Location size={14} className="text-gray-400" />
                  <span className="truncate">{doc.address}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-600 pt-1">
                {!!doc.phone && (
                  <span className="inline-flex items-center gap-1"><Call size={14} className="text-gray-400" /> {doc.phone}</span>
                )}
                {!!doc.email && (
                  <span className="inline-flex items-center gap-1"><Sms size={14} className="text-gray-400" /> {doc.email}</span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
