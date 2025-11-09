'use client';

import { useState } from 'react';
import { Profile2User, Edit, Trash, More, Calendar, Location } from 'iconsax-react';
import { useRouter } from 'next/navigation';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender?: string;
  address?: string;
  lastAppointment?: string;
  createdAt?: string;
}

interface PatientListProps {
  onEdit?: (patient: Patient) => void;
  onDelete?: (id: string) => void;
}

export default function PatientList({ onEdit, onDelete }: PatientListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const router = useRouter();

  const patients: Patient[] = [
    { id: 'p1', firstName: 'Alice', lastName: 'Niyonsaba', email: 'alice@example.com', phone: '+250788000001', dateOfBirth: '1993-03-15', gender: 'female', address: 'Kigali, Rwanda', lastAppointment: '2025-09-30T00:00:00Z' },
    { id: 'p2', firstName: 'Brian', lastName: 'Kimenyi', email: 'brian@example.com', phone: '+250788000002', dateOfBirth: '1988-07-22', gender: 'male', address: 'Huye, Rwanda', lastAppointment: '2025-09-30T00:00:00Z' },
    { id: 'p3', firstName: 'Clara', lastName: 'Mukamana', email: 'clara@example.com', phone: '+250788000003', dateOfBirth: '1999-11-02', gender: 'female', address: 'Musanze, Rwanda', lastAppointment: '2025-09-30T00:00:00Z' },
    { id: 'p4', firstName: 'David', lastName: 'Okello', email: 'david@example.com', phone: '+250788000004', dateOfBirth: '1979-05-12', gender: 'male', address: 'Nyagatare, Rwanda', lastAppointment: '2025-09-30T00:00:00Z' },
    { id: 'p5', firstName: 'Emma', lastName: 'Uwera', email: 'emma@example.com', phone: '+250788000005', dateOfBirth: '1990-01-30', gender: 'female', address: 'Rubavu, Rwanda', lastAppointment: '2025-09-30T00:00:00Z' },
    { id: 'p6', firstName: 'Felix', lastName: 'Twagiramungu', email: 'felix@example.com', phone: '+250788000006', dateOfBirth: '1985-09-09', gender: 'male', address: 'Rwamagana, Rwanda', lastAppointment: '2025-09-30T00:00:00Z' },
    { id: 'p7', firstName: 'Grace', lastName: 'Kamali', email: 'grace@example.com', phone: '+250788000007', dateOfBirth: '1996-12-18', gender: 'female', address: 'Gicumbi, Rwanda', lastAppointment: '2025-09-30T00:00:00Z' },
  ];

  const getAge = (dobIso: string) => {
    const dob = new Date(dobIso);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {patients.map((patient) => {
        const initials = `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase();
        const age = patient.dateOfBirth ? getAge(patient.dateOfBirth) : null;
        const gender = patient.gender ?? '—';
        const addressText = patient.address ?? 'Address —';
        return (
          <li key={patient.id} className="relative bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {initials || <Profile2User size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-medium text-gray-900 truncate">{patient.firstName} {patient.lastName}</p>
                  <p className="text-sm text-gray-500 truncate">{age !== null ? `${age} yrs` : 'Age —'} • {gender}</p>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setMenuOpenId(menuOpenId === patient.id ? null : patient.id)} className="p-1.5 hover:bg-gray-100 border border-gray-200 rounded-md">
                  <More size={16} className="text-gray-600" />
                </button>
                {menuOpenId === patient.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button onClick={() => router.push(`/dashboard/patients/${patient.id}`)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">View detail</button>
                    {onEdit && <button onClick={() => onEdit(patient)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Edit</button>}
                    {onDelete && <button onClick={() => onDelete(patient.id)} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50">Delete</button>}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar size={14} className="text-gray-400" />
                <span>Last appointment: {patient.lastAppointment ? new Date(patient.lastAppointment).toLocaleDateString() : '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Location size={14} className="text-gray-400" />
                <span className="truncate">{addressText}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

