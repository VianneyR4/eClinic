'use client';

import { useState, useEffect } from 'react';
import { Profile2User, Edit, Trash, More, Calendar, Location } from 'iconsax-react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

interface Patient {
  id: number | string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string | { street?: string; city?: string; state?: string; zipCode?: string };
  lastAppointment?: string;
  createdAt?: string;
}

interface PatientListProps {
  onEdit?: (patient: Patient) => void;
  onDelete?: (id: string) => void;
  filters?: { q?: string; gender?: string };
}

export default function PatientList({ onEdit, onDelete, filters }: PatientListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadPatients();
  }, [filters]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getPatients({ 
        search: filters?.q,
        ...filters 
      });
      
      if (response.success) {
        setPatients(response.data || []);
      } else {
        setError('Failed to load patients.');
      }
    } catch (err: any) {
      console.error('Error loading patients:', err);
      setError(err.response?.data?.message || 'Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  const getAge = (dobIso: string | undefined) => {
    if (!dobIso) return null;
    const dob = new Date(dobIso);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getAddressText = (address: string | { street?: string; city?: string; state?: string; zipCode?: string } | undefined): string => {
    if (!address) return 'Address —';
    if (typeof address === 'string') return address;
    const parts = [address.street, address.city, address.state, address.zipCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address —';
  };

  const getPatientName = (patient: Patient): { first: string; last: string; full: string } => {
    const first = patient.firstName || patient.first_name || '';
    const last = patient.lastName || patient.last_name || '';
    return {
      first,
      last,
      full: `${first} ${last}`.trim() || 'Unknown',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-800">{error}</p>
        <button
          onClick={loadPatients}
          className="mt-2 text-sm text-red-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No patients found.</p>
      </div>
    );
  }

  return (
    <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {patients.map((patient) => {
        const name = getPatientName(patient);
        const initials = `${name.first?.[0] || ''}${name.last?.[0] || ''}`.toUpperCase();
        const dob = patient.dateOfBirth || patient.date_of_birth;
        const age = dob ? getAge(dob) : null;
        const gender = patient.gender ?? '—';
        const addressText = getAddressText(patient.address);
        const patientId = patient.id.toString();

        return (
          <li key={patientId} className="relative bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {initials || <Profile2User size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-medium text-gray-900 truncate">{name.full}</p>
                  <p className="text-sm text-gray-500 truncate">{age !== null ? `${age} yrs` : 'Age —'} • {gender}</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setMenuOpenId(menuOpenId === patientId ? null : patientId)} 
                  className="p-1.5 hover:bg-gray-100 border border-gray-200 rounded-md"
                >
                  <More size={16} className="text-gray-600" />
                </button>
                {menuOpenId === patientId && (
                  <>
                    <div 
                      className="fixed inset-0 z-0" 
                      onClick={() => setMenuOpenId(null)}
                    />
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <button 
                        onClick={() => {
                          router.push(`/dashboard/patients/${patientId}`);
                          setMenuOpenId(null);
                        }} 
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                      >
                        View detail
                      </button>
                      {onEdit && (
                        <button 
                          onClick={() => {
                            onEdit(patient);
                            setMenuOpenId(null);
                          }} 
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this patient?')) {
                              try {
                                await apiService.deletePatient(patientId);
                                await loadPatients();
                              } catch (err) {
                                alert('Failed to delete patient. Please try again.');
                              }
                            }
                            setMenuOpenId(null);
                          }} 
                          className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              {patient.email && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
              {patient.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="truncate">{patient.phone}</span>
                </div>
              )}
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

