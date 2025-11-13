'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { More, Profile, Call, Sms, Location, Add, ArrowRight2 } from 'iconsax-react';
import { apiService } from '@/services/api';
import PatientForm from './PatientForm';
import DoctorForm from './DoctorForm';
import SlideOver from './SlideOver';
import AppointmentModal from './AppointmentModal';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  idNumber?: string;
  photo?: string;
  address?: string | { street?: string; city?: string; state?: string; zip_code?: string; zipCode?: string };
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  idNumber?: string;
  photo?: string;
  specialty?: string;
  address?: string | { street?: string; city?: string; state?: string; zip_code?: string; zipCode?: string };
}

interface SearchDropdownProps {
  query: string;
  onClose: () => void;
}

export default function SearchDropdown({ query, onClose }: SearchDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [newPatient, setNewPatient] = useState<any>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // Format address whether it's a string or an object
  const getAddressText = (
    address: string | { street?: string; city?: string; state?: string; zip_code?: string; zipCode?: string } | undefined
  ): string => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode ?? address.zip_code,
    ].filter(Boolean) as string[];
    return parts.length ? parts.join(', ') : '';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If any modal/slide-over is open, do not auto-close the dropdown
      if (showPatientForm || showDoctorForm || showAppointmentModal) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, showPatientForm, showDoctorForm, showAppointmentModal]);

  useEffect(() => {
    if (!query.trim()) {
      setPatients([]);
      setDoctors([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const response = await apiService.search(query);
        if (response.success) {
          setPatients(response.data.patients || []);
          setDoctors(response.data.doctors || []);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handlePatientAction = (action: string, patient: Patient) => {
    setMenuOpenId(null);
    if (action === 'view') {
      router.push(`/dashboard/patients/${patient.id}`);
      onClose();
    } else if (action === 'appointment') {
      setNewPatient(patient);
      setShowAppointmentModal(true);
    }
  };

  const handleDoctorAction = (action: string, doctor: Doctor) => {
    setMenuOpenId(null);
    if (action === 'view') {
      router.push(`/dashboard/doctors/${doctor.id}`);
      onClose();
    }
  };

  const handlePatientCreated = async (patientData: any) => {
    setShowPatientForm(false);
    // Fetch the created patient to get full details
    try {
      const response = await apiService.getPatient(patientData.id || patientData.data?.id);
      if (response.success) {
        const patient = response.data;
        setNewPatient({
          id: patient.id,
          firstName: patient.first_name,
          lastName: patient.last_name,
          fullName: `${patient.first_name} ${patient.last_name}`,
          photo: patient.photo,
        });
        setShowAppointmentModal(true);
        // Ensure the page reflects the new data
        try { router.refresh(); } catch {}
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      // Fallback to patientData if API call fails
      if (patientData.data) {
        setNewPatient({
          id: patientData.data.id,
          firstName: patientData.data.first_name,
          lastName: patientData.data.last_name,
          fullName: `${patientData.data.first_name} ${patientData.data.last_name}`,
          photo: patientData.data.photo,
        });
        setShowAppointmentModal(true);
        try { router.refresh(); } catch {}
      }
    }
  };

  const hasResults = patients.length > 0 || doctors.length > 0;
  const showEmptyState = query.trim() && !loading && !hasResults;

  return (
    <>
      <div
        ref={dropdownRef}
        className="w-full max-w-4xl bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col"
      >
        {loading && (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm">Searching...</p>
          </div>
        )}

        {showEmptyState && (
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-4">No results found for &quot;{query}&quot;</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setShowPatientForm(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition"
                >
                  <Add size={20} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Add New Patient</span>
                </button>
                <button
                  onClick={() => {
                    setShowDoctorForm(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition"
                >
                  <Add size={20} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Add New Doctor</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {hasResults && !loading && (
          <div className="flex divide-x divide-gray-200 max-h-[600px] overflow-auto">
            {/* Patients Column */}
            <div className="flex-1 min-w-0">
              <div className="sticky top-0 bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Patients ({patients.length})</h3>
              </div>
              <div className="overflow-auto">
                {patients.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500 mb-4">No patients found</p>
                    <button
                      onClick={() => {
                        setShowPatientForm(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/5 transition"
                    >
                      <Add size={16} />
                      Add New Patient
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {patients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{patient.id}</td>
                          <td className="px-4 py-3">
                            {patient.photo ? (
                              <img src={patient.photo} alt={patient.fullName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Profile size={20} className="text-primary" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{patient.fullName}</div>
                          
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{patient.phone || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{patient.email || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <button
                                onClick={() => setMenuOpenId(`patient-${patient.id}`)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <More size={16} className="text-gray-600" />
                              </button>
                              {menuOpenId === `patient-${patient.id}` && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)}></div>
                                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                                    <button
                                      onClick={() => handlePatientAction('appointment', patient)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <ArrowRight2 size={14} />
                                      New Appointment
                                    </button>
                                    <button
                                      onClick={() => handlePatientAction('view', patient)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <Profile size={14} />
                                      View Detail
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Doctors Column */}
            <div className="flex-1 min-w-0">
              <div className="sticky top-0 bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Doctors ({doctors.length})</h3>
              </div>
              <div className="overflow-auto">
                {doctors.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500 mb-4">No doctors found</p>
                    <button
                      onClick={() => {
                        setShowDoctorForm(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/5 transition"
                    >
                      <Add size={16} />
                      Add New Doctor
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {doctors.map((doctor) => (
                        <tr key={doctor.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{doctor.id}</td>
                          <td className="px-4 py-3">
                            {doctor.photo ? (
                              <img src={doctor.photo} alt={doctor.fullName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Profile size={20} className="text-primary" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{doctor.fullName}</div>
                            {doctor.specialty && (
                              <div className="text-xs text-gray-500 mt-1">{doctor.specialty}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{doctor.phone || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{doctor.email || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <button
                                onClick={() => setMenuOpenId(`doctor-${doctor.id}`)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <More size={16} className="text-gray-600" />
                              </button>
                              {menuOpenId === `doctor-${doctor.id}` && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)}></div>
                                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                                    <button
                                      onClick={() => handleDoctorAction('view', doctor)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <Profile size={14} />
                                      View Detail
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Form SlideOver */}
      <SlideOver
        title="Add New Patient"
        open={showPatientForm}
        onClose={() => setShowPatientForm(false)}
      >
        <div className="p-4">
          <PatientForm
            onSave={handlePatientCreated}
            onCancel={() => setShowPatientForm(false)}
          />
        </div>
      </SlideOver>

      {/* Doctor Form SlideOver */}
      <SlideOver
        title="Add New Doctor"
        open={showDoctorForm}
        onClose={() => setShowDoctorForm(false)}
      >
        <div className="p-4">
          <DoctorForm
            doctor={undefined}
            onSave={() => {
              setShowDoctorForm(false);
              try { router.refresh(); } catch {}
            }}
            onCancel={() => setShowDoctorForm(false)}
          />
        </div>
      </SlideOver>

      {/* Appointment Modal */}
      {newPatient && (
        <AppointmentModal
          patient={newPatient}
          isOpen={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setNewPatient(null);
          }}
          onSuccess={() => {
            setShowAppointmentModal(false);
            setNewPatient(null);
          }}
        />
      )}
    </>
  );
}

