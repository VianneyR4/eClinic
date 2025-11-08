'use client';

import { useState, useEffect, useCallback } from 'react';
import { Profile2User, Edit, Trash } from 'iconsax-react';
import { useRxDB } from '../providers/RxDBProvider';
import { formatDate } from '../utils/helpers';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  createdAt: string;
}

interface PatientListProps {
  onEdit?: (patient: Patient) => void;
  onDelete?: (id: string) => void;
}

export default function PatientList({ onEdit, onDelete }: PatientListProps) {
  const { db, isInitialized } = useRxDB();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatients = useCallback(async () => {
    if (!db) {
      console.error('Database not initialized');
      setLoading(false);
      return;
    }

    try {

      const patientsCollection = db.patients;
      if (!patientsCollection) {
        console.error('Patients collection not found');
        setLoading(false);
        return;
      }

      // Subscribe to changes
      const subscription = patientsCollection
        .find()
        .sort({ createdAt: 'desc' })
        .$.subscribe((docs: any[]) => {
          const patientsData = docs.map((doc: any) => doc.toJSON() as Patient);
          setPatients(patientsData);
          setLoading(false);
        });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error loading patients:', error);
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (isInitialized && db) {
      loadPatients();
    } else if (!isInitialized) {
      setLoading(false);
    }
  }, [db, isInitialized, loadPatients]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-600">Loading patients...</div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        {/* Keep a semantic list in the DOM for accessibility/tests */}
        <ul role="list" aria-label="patients" />
        <Profile2User size={48} className="text-gray-300 mb-4" />
        <p className="text-sm text-gray-600">No patients found</p>
      </div>
    );
  }

  return (
    <ul role="list" className="space-y-2 sm:space-y-3">
      {patients.map((patient) => (
        <li
          key={patient.id}
          className="bg-white rounded-md p-3 sm:p-4 border border-gray-200 hover:shadow-sm transition"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                {patient.firstName} {patient.lastName}
              </h3>
              <div className="mt-1 space-y-0.5 sm:space-y-1">
                {patient.email && (
                  <p className="text-xs text-gray-600 truncate">{patient.email}</p>
                )}
                {patient.phone && (
                  <p className="text-xs text-gray-600">{patient.phone}</p>
                )}
                {patient.dateOfBirth && (
                  <p className="text-xs text-gray-500">
                    DOB: {formatDate(patient.dateOfBirth)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-2 self-end sm:self-auto">
              {onEdit && (
                <button
                  onClick={() => onEdit(patient)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition"
                  aria-label="Edit patient"
                >
                  <Edit size={16} className="text-gray-600" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(patient.id)}
                  className="p-1.5 sm:p-2 hover:bg-red-50 rounded-md transition"
                  aria-label="Delete patient"
                >
                  <Trash size={16} className="text-red-500" />
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

