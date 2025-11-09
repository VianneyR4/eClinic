'use client';

import { useEffect, useMemo, useState } from 'react';
import PatientList from '@/components/PatientList';
import PatientForm from '@/components/PatientForm';
import SlideOver from '@/components/SlideOver';
import AppointmentModal from '@/components/AppointmentModal';
import { useRxDB } from '@/providers/RxDBProvider';
import { Add, Filter } from 'iconsax-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PatientsPage() {
  const { db, isInitialized } = useRxDB();
  const router = useRouter();
  const search = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{ q?: string; gender?: string }>({});
  const [newPatient, setNewPatient] = useState<any>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // Open create modal if ?create=1
  useEffect(() => {
    if (search.get('create') === '1') {
      setEditingPatient(null);
      setShowForm(true);
    }
  }, [search]);

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!db || !isInitialized) {
      alert('Database not initialized');
      return;
    }

    if (!confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      const patientsCollection = db.patients;
      if (patientsCollection) {
        const patient = await patientsCollection.findOne(id).exec();
        if (patient) {
          await patient.remove();
        }
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Error deleting patient. Please try again.');
    }
  };

  const handleSave = (patientData?: any) => {
    setShowForm(false);
    const wasEditing = !!editingPatient;
    const savedPatient = patientData?.data || patientData;
    
    if (!wasEditing && savedPatient) {
      // New patient created - show appointment modal
      setNewPatient({
        id: savedPatient.id,
        firstName: savedPatient.first_name || savedPatient.firstName,
        lastName: savedPatient.last_name || savedPatient.lastName,
        fullName: `${savedPatient.first_name || savedPatient.firstName} ${savedPatient.last_name || savedPatient.lastName}`,
        photo: savedPatient.photo,
      });
      setShowAppointmentModal(true);
    }
    
    setEditingPatient(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Patients List</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white hover:bg-gray-50 flex items-center gap-2 w-full sm:w-auto"
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-20">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Search</label>
                    <input
                      value={filters.q || ''}
                      onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                      placeholder="Name, phone, email"
                      className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Gender</label>
                    <select
                      value={filters.gender || ''}
                      onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
                      className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">All</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button onClick={() => setFilters({})} className="text-xs text-gray-600 hover:underline">Reset</button>
                    <button onClick={() => setShowFilters(false)} className="text-xs text-primary hover:underline">Apply</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setEditingPatient(null);
              setShowForm(true);
              const params = new URLSearchParams(search as any);
              params.set('create', '1');
              router.replace(`?${params.toString()}`);
            }}
            className="ml-auto sm:ml-0 px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-opacity-90 transition flex items-center justify-center gap-2"
          >
            <Add size={16} />
            <span>New Patient</span>
          </button>
        </div>
      </div>

      <div className="">
        <PatientList onEdit={handleEdit} filters={filters} />
      </div>

      <SlideOver
        open={showForm}
        onClose={() => {
          setShowForm(false);
          const params = new URLSearchParams(search as any);
          params.delete('create');
          router.replace(`?${params.toString()}`);
        }}
        title={editingPatient ? 'Edit Patient' : 'Create Patient'}
        widthClass="max-w-lg"
      >
        <div className="p-4">
          <PatientForm
            patient={editingPatient}
            onSave={handleSave}
            onCancel={handleCancel}
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
    </div>
  );
}
