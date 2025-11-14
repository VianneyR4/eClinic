'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CloseCircle, TickCircle } from 'iconsax-react';
import { apiService } from '@/services/api';

interface AppointmentModalProps {
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    photo?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AppointmentModal({ patient, isOpen, onClose, onSuccess }: AppointmentModalProps) {
  const router = useRouter();
  const [triageLevel, setTriageLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [loading, setLoading] = useState(false);
  const [tokenNumber, setTokenNumber] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Re-check queue to avoid duplicates (race condition protection)
      try {
        const existing = await apiService.getQueue();
        const items = existing?.data || [];
        const alreadyQueued = Array.isArray(items)
          ? items.some((it: any) => it?.patientId === patient.id && (it?.status === 'waiting' || it?.status === 'in_progress'))
          : false;
        if (alreadyQueued) {
          alert('This patient is already in the active queue.');
          return;
        }
      } catch (checkErr) {
        console.error('Error verifying queue status:', checkErr);
        alert('Could not verify queue status. Please try again.');
        return;
      }

      const response = await apiService.createQueueItem({
        patientId: patient.id,
        triageLevel,
        status: 'waiting',
      });

      if (response.success) {
        setTokenNumber(response.data.tokenNumber);
        setTimeout(() => {
          onSuccess();
          router.push('/dashboard/queue');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error creating appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 z-10">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create Appointment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <CloseCircle size={24} />
            </button>
          </div>

          {/* Patient Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {patient.photo ? (
                <img
                  src={patient.photo}
                  alt={patient.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium text-lg">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{patient.fullName}</p>
                <p className="text-sm text-gray-500">Patient ID: {patient.id}</p>
              </div>
            </div>
          </div>

          {tokenNumber ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TickCircle size={32} className="text-green-600" variant="Bold" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointment Created!</h3>
              <p className="text-3xl font-bold text-primary mb-2">Token #{tokenNumber}</p>
              <p className="text-sm text-gray-600">Redirecting to queue...</p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Triage Level *
                </label>
                <select
                  value={triageLevel}
                  onChange={(e) => setTriageLevel(e.target.value as any)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Appointment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

