'use client';

import { useEffect, useState } from 'react';
import { More, Profile, Call, Sms, Location, Calendar } from 'iconsax-react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

interface Doctor {
  id: number | string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  specialty?: string;
  phone?: string;
  email?: string;
  address?: string | { street?: string; city?: string; state?: string; zipCode?: string };
  lastAppointment?: string;
}

interface DoctorListProps {
  onEdit?: (doctor: Doctor) => void;
  onDelete?: (id: string) => void;
  filters?: { q?: string; specialty?: string };
  reloadKey?: number;
}

export default function DoctorList({ onEdit, onDelete, filters, reloadKey }: DoctorListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpenId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
          setMenuOpenId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

  useEffect(() => {
    loadDoctors();
  }, [filters, reloadKey]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDoctors({
        search: filters?.q,
        specialty: filters?.specialty,
      });

      if (response.success) {
        setDoctors(response.data || []);
      } else {
        setError('Failed to load doctors.');
      }
    } catch (err: any) {
      console.error('Error loading doctors:', err);
      setError(err.response?.data?.message || 'Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  const getDoctorName = (doctor: any): { first: string; last: string; full: string } => {
    let first = doctor.firstName || doctor.first_name || '';
    let last = doctor.lastName || doctor.last_name || '';
    let full = `${first} ${last}`.trim();
    if (!full && doctor.name) {
      full = doctor.name;
      const parts = String(doctor.name).trim().split(/\s+/);
      first = parts[0] || '';
      last = parts.slice(1).join(' ') || '';
    }
    return {
      first,
      last,
      full: full || 'N/A',
    };
  };

  const getAddressText = (address: string | { street?: string; city?: string; state?: string; zipCode?: string } | undefined): string => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address || 'N/A';
    const parts = [address.street, address.city, address.state, address.zipCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
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
          onClick={loadDoctors}
          className="mt-2 text-sm text-red-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No doctors found.</p>
      </div>
    );
  }

  return (
    <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {doctors.map((doc) => {
        const name = getDoctorName(doc);
        const words = (name.full && name.full !== 'N/A') ? name.full.split(/\s+/) : [];
        const initials = ((words[0]?.[0] || '') + (words[1]?.[0] || '')).toUpperCase();
        const addressText = getAddressText(doc.address);
        const doctorId = doc.id.toString();

        return (
          <li 
            key={doctorId} 
            onClick={() => router.push(`/dashboard/doctors/${doctorId}`)}
            className="relative bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {initials || <Profile size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-medium text-gray-900 truncate">{name.full}</p>
                  <p className="text-sm text-gray-500 truncate">{doc.specialty || 'Specialty: N/A'}</p>
                </div>
              </div>
              <div className="relative dropdown-container">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === doctorId ? null : doctorId);
                  }} 
                  className="p-1.5 hover:bg-gray-100 border border-gray-200 rounded-md"
                >
                  <More size={16} className="text-gray-600" />
                </button>
                {menuOpenId === doctorId && (
                  <>
                    <div 
                      className="fixed inset-0 z-0" 
                      onClick={() => setMenuOpenId(null)}
                    />
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/doctors/${doctorId}`);
                          setMenuOpenId(null);
                        }} 
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                      >
                        View detail
                      </button>
                      {onEdit && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(doc);
                            setMenuOpenId(null);
                          }} 
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this doctor?')) {
                              try {
                                await apiService.deleteDoctor(doctorId);
                                await loadDoctors();
                              } catch (err) {
                                alert('Failed to delete doctor. Please try again.');
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
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Location size={14} className="text-gray-400" />
                <span className="truncate">{addressText}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600 pt-1">
                <span className="inline-flex items-center gap-1">
                  <Call size={14} className="text-gray-400" /> 
                  <span className="truncate">{doc.phone || 'Phone: N/A'}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Sms size={14} className="text-gray-400" /> 
                  <span className="truncate">{doc.email || 'Email: N/A'}</span>
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
