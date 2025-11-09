'use client';

import { useState, FormEvent, useEffect } from 'react';
import { apiService } from '@/services/api';

interface DoctorFormProps {
  doctor?: any;
  onSave: (doctorData?: any) => void;
  onCancel: () => void;
}

export default function DoctorForm({ doctor, onSave, onCancel }: DoctorFormProps) {
  const [formData, setFormData] = useState({
    firstName: (() => {
      const f = doctor?.firstName || doctor?.first_name;
      if (f) return f;
      if (doctor?.name) {
        const parts = String(doctor.name).trim().split(/\s+/);
        return parts[0] || '';
      }
      return '';
    })(),
    lastName: (() => {
      const l = doctor?.lastName || doctor?.last_name;
      if (l) return l;
      if (doctor?.name) {
        const parts = String(doctor.name).trim().split(/\s+/);
        return parts.slice(1).join(' ') || '';
      }
      return '';
    })(),
    email: doctor?.email || '',
    phone: doctor?.phone || '',
    idNumber: doctor?.idNumber || doctor?.id_number || '',
    specialty: doctor?.specialty || '',
    address: {
      street: doctor?.address?.street || (typeof doctor?.address === 'string' ? '' : doctor?.address?.street) || '',
      city: doctor?.address?.city || (typeof doctor?.address === 'string' ? '' : doctor?.address?.city) || '',
      state: doctor?.address?.state || (typeof doctor?.address === 'string' ? '' : doctor?.address?.state) || '',
      zipCode: doctor?.address?.zipCode || doctor?.address?.zip_code || (typeof doctor?.address === 'string' ? '' : doctor?.address?.zipCode) || '',
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      const splitFromName = ((): { first: string; last: string } => {
        if (!doctor.firstName && !doctor.first_name && doctor.name) {
          const parts = String(doctor.name).trim().split(/\s+/);
          return { first: parts[0] || '', last: parts.slice(1).join(' ') || '' };
        }
        return { first: doctor.firstName || doctor.first_name || '', last: doctor.lastName || doctor.last_name || '' };
      })();
      setFormData({
        firstName: splitFromName.first,
        lastName: splitFromName.last,
        email: doctor.email || '',
        phone: doctor.phone || '',
        idNumber: doctor.idNumber || doctor.id_number || '',
        specialty: doctor.specialty || '',
        address: {
          street: doctor.address?.street || '',
          city: doctor.address?.city || '',
          state: doctor.address?.state || '',
          zipCode: doctor.address?.zipCode || doctor.address?.zip_code || '',
        },
      });
    }
  }, [doctor]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const doctorData = {
        name: fullName || undefined,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        id_number: formData.idNumber || undefined,
        specialty: formData.specialty || undefined,
        address: formData.address.street || formData.address.city ? {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zip_code: formData.address.zipCode,
        } : undefined,
      };

      let response;
      if (doctor?.id) {
        response = await apiService.updateDoctor(doctor.id.toString(), doctorData);
      } else {
        response = await apiService.createDoctor(doctorData);
      }

      if (response.success) {
        if (onSave) {
          onSave(response.data || response);
        }
      } else {
        alert(response.message || 'Error saving doctor. Please try again.');
      }
    } catch (error: any) {
      console.error('Error saving doctor:', error);
      alert(error.response?.data?.message || 'Error saving doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">First name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
            className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Last name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
            className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Specialty</label>
        <input
          type="text"
          value={formData.specialty}
          onChange={(e) => handleChange('specialty', e.target.value)}
          className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">ID Number</label>
        <input
          type="text"
          value={formData.idNumber}
          onChange={(e) => handleChange('idNumber', e.target.value)}
          className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div className="border-t border-gray-200 pt-3">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Address</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Street</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleChange('address.street', e.target.value)}
              className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">City</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
                className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">State</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleChange('address.state', e.target.value)}
                className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Zip Code</label>
            <input
              type="text"
              value={formData.address.zipCode}
              onChange={(e) => handleChange('address.zipCode', e.target.value)}
              className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
      <div className="pt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 text-sm rounded-md text-white bg-primary hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : doctor ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
}
