'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight2,
  TickCircle,
  CloseCircle,
  Profile,
  Call,
  Location,
} from 'iconsax-react';
import { apiService } from '@/services/api';

interface QueueItem {
  id: number;
  patientId: number;
  tokenNumber: number;
  triageLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'waiting' | 'in_progress' | 'done' | 'canceled';
  queueDate: string;
  createdAt: string;
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    phone?: string;
    photo?: string;
    address?: string;
  };
}

const TRIAGE_COLORS = {
  low: 'text-gray-600 border-gray-300',
  medium: 'text-yellow-700 border-yellow-300',
  high: 'text-orange-700 border-orange-300',
  critical: 'text-red-700 border-red-300',
};

const TRIAGE_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export default function QueuePage() {
  const router = useRouter();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadQueueItems();
    const interval = setInterval(loadQueueItems, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadQueueItems = async () => {
    try {
      setLoading(true);
      const response = await apiService.getQueue();
      if (response.success) setQueueItems(response.data || []);
    } catch (error) {
      console.error('Error loading queue items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      const response = await apiService.updateQueueItem(id.toString(), { status });
      if (response.success) await loadQueueItems();
    } catch (error) {
      console.error('Error updating queue item:', error);
      alert('Error updating queue item. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const getTriagePriority = (level: string): number =>
    ({ critical: 4, high: 3, medium: 2, low: 1 }[level] || 2);

  const getItemsByStatus = (status: string) =>
    queueItems
      .filter((item) => item.status === status)
      .sort((a, b) => {
        const pA = getTriagePriority(a.triageLevel);
        const pB = getTriagePriority(b.triageLevel);
        return pB - pA || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

  const columns = [
    { id: 'waiting', label: 'Waiting' },
    { id: 'in_progress', label: 'Under Consultation' },
    { id: 'done', label: 'Done' },
    { id: 'canceled', label: 'Canceled' },
  ];

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-400 border-t-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Patient Queue</h1>
        <button
          onClick={loadQueueItems}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
        >
          Refresh
        </button>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map((col) => {
          const items = getItemsByStatus(col.id);

          return (
            <div
              key={col.id}
              className="rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col"
            >
              {/* Column header */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-primary">{col.label}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {items.length} patient{items.length !== 1 && 's'}
                </p>
              </div>

              {/* Cards */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No patients
                  </div>
                ) : (
                  items.map((item, index) => {
                    const isCurrent = index === 0;
                    const isUpdating = updating === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`border border-gray-200 rounded-md p-4 hover:shadow-md transition ${
                          isCurrent ? 'border-primary' : ''
                        }`}
                      >
                        {/* Patient info */}
                        <div className="flex items-start gap-3 mb-3">
                          {item.patient.photo ? (
                            <img
                              src={item.patient.photo}
                              alt={item.patient.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-primary font-medium text-sm">
                                {item.patient.firstName[0]}
                                {item.patient.lastName[0]}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {item.patient.fullName}
                            </h3>
                            {item.patient.address && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Location size={12} />
                                <span className="truncate">
                                  {item.patient.address}
                                </span>
                              </p>
                            )}
                            {item.patient.phone && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Call size={12} />
                                {item.patient.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Queue data */}
                        <div className="mb-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Token</span>
                            <span className="font-semibold text-gray-800">
                              #{item.tokenNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Triage</span>
                            <span
                              className={`border rounded-full px-2 py-0.5 text-xs font-medium ${TRIAGE_COLORS[item.triageLevel]}`}
                            >
                              {TRIAGE_LABELS[item.triageLevel]}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        {(isCurrent || col.id === 'done' || col.id === 'canceled') && (
                          <div className="pt-3 border-t border-gray-200 space-y-2">
                            {col.id === 'waiting' && (
                              <button
                                onClick={() => updateStatus(item.id, 'in_progress')}
                                disabled={isUpdating}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 transition"
                              >
                                <ArrowRight2 size={16} />
                                {isUpdating ? 'Starting...' : 'Start'}
                              </button>
                            )}
                            {col.id === 'in_progress' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateStatus(item.id, 'done')}
                                  disabled={isUpdating}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition"
                                >
                                  <TickCircle size={16} />
                                  {isUpdating ? 'Processing...' : 'Done'}
                                </button>
                                <button
                                  onClick={() => updateStatus(item.id, 'canceled')}
                                  disabled={isUpdating}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition"
                                >
                                  <CloseCircle size={16} />
                                  Cancel
                                </button>
                              </div>
                            )}
                            {(col.id === 'done' || col.id === 'canceled') && (
                              <button
                                onClick={() =>
                                  router.push(`/dashboard/patients/${item.patient.id}`)
                                }
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                              >
                                <Profile size={16} />
                                View Patient
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
