'use client';

import { useState } from 'react';
import PatientList from '@/components/PatientList';
import PatientForm from '@/components/PatientForm';
import { useRxDB } from '@/providers/RxDBProvider';
import { Add } from 'iconsax-react';

export default function PatientsPage() {
  const { db, isInitialized } = useRxDB();
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);

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

  const handleSave = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Patients</h1>
        {!showForm && (
          <button
            onClick={() => {
              setEditingPatient(null);
              setShowForm(true);
            }}
            className="w-full sm:w-auto px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-opacity-90 transition flex items-center justify-center gap-2"
          >
            <Add size={16} />
            <span>Add Patient</span>
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-md p-4 sm:p-6 shadow-sm">
          <PatientForm
            patient={editingPatient}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="bg-white rounded-md p-4 sm:p-6 shadow-sm">
          {!isInitialized ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-sm text-gray-600">Initializing database...</div>
            </div>
          ) : (
            <PatientList onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      )}
    </div>
  );
}
