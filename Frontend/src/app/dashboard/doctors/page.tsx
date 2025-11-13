"use client";

import { useEffect, useState } from 'react';
import { Add, Filter } from 'iconsax-react';
import { useRouter, useSearchParams } from 'next/navigation';
import SlideOver from '@/components/SlideOver';
import DoctorList from '@/components/DoctorList';
import DoctorForm from '@/components/DoctorForm';

export default function DoctorsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{ q?: string; specialty?: string }>({});
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (search.get('create') === '1') {
      setEditingDoctor(null);
      setShowForm(true);
    }
  }, [search]);

  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    // Ensure the listing refreshes to show latest server data
    try { router.refresh(); } catch {}
    setEditingDoctor(null);
    // Force DoctorList to refetch immediately
    setReloadKey((k) => k + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDoctor(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Doctors List</h1>
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
                    <label className="block text-xs text-gray-500 mb-1">Specialty</label>
                    <input
                      value={filters.specialty || ''}
                      onChange={(e) => setFilters((f) => ({ ...f, specialty: e.target.value }))}
                      placeholder="e.g. Pediatrics"
                      className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
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
              setEditingDoctor(null);
              setShowForm(true);
              const params = new URLSearchParams(search as any);
              params.set('create', '1');
              router.replace(`?${params.toString()}`);
            }}
            className="ml-auto sm:ml-0 px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-opacity-90 transition flex items-center justify-center gap-2"
          >
            <Add size={16} />
            <span>New Doctor</span>
          </button>
        </div>
      </div>

      <div className="">
        <DoctorList onEdit={handleEdit} filters={filters} reloadKey={reloadKey} />
      </div>

      <SlideOver
        open={showForm}
        onClose={() => {
          setShowForm(false);
          const params = new URLSearchParams(search as any);
          params.delete('create');
          router.replace(`?${params.toString()}`);
        }}
        title={editingDoctor ? 'Edit Doctor' : 'Create Doctor'}
        widthClass="max-w-lg"
      >
        <div className="p-4">
          <DoctorForm doctor={editingDoctor} onSave={handleSave} onCancel={handleCancel} />
        </div>
      </SlideOver>
    </div>
  );
}

