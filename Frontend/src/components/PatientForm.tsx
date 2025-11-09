'use client';

import { useState, FormEvent, useEffect } from 'react';
import { apiService } from '@/services/api';

interface PatientFormProps {
  patient?: any;
  onSave?: (patientData?: any) => void;
  onCancel?: () => void;
}

export default function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || patient?.first_name || '',
    lastName: patient?.lastName || patient?.last_name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    idNumber: patient?.idNumber || patient?.id_number || '',
    dateOfBirth: patient?.dateOfBirth || patient?.date_of_birth || '',
    birthday: patient?.birthday || '',
    bloodGroup: patient?.blood_group || '',
    gender: patient?.gender || '',
    address: {
      street: patient?.address?.street || (typeof patient?.address === 'string' ? '' : patient?.address?.street) || '',
      city: patient?.address?.city || (typeof patient?.address === 'string' ? '' : patient?.address?.city) || '',
      state: patient?.address?.state || (typeof patient?.address === 'string' ? '' : patient?.address?.state) || '',
      zipCode: patient?.address?.zipCode || patient?.address?.zip_code || (typeof patient?.address === 'string' ? '' : patient?.address?.zipCode) || '',
    },
    vitalSigns: {
      bloodPressure: patient?.vital_signs?.blood_pressure || '',
      heartRate: patient?.vital_signs?.heart_rate || '',
      spo2: patient?.vital_signs?.spo2 || '',
      temperature: patient?.vital_signs?.temperature || '',
      respiratoryRate: patient?.vital_signs?.respiratory_rate || '',
      weight: patient?.vital_signs?.weight || '',
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName || patient.first_name || '',
        lastName: patient.lastName || patient.last_name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        idNumber: patient.idNumber || patient.id_number || '',
        dateOfBirth: patient.dateOfBirth || patient.date_of_birth || '',
        address: {
          street: patient.address?.street || '',
          city: patient.address?.city || '',
          state: patient.address?.state || '',
          zipCode: patient.address?.zipCode || patient.address?.zip_code || '',
        },
      });
    }
  }, [patient]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      const patientData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        id_number: formData.idNumber || undefined,
        date_of_birth: formData.dateOfBirth || undefined,
        birthday: formData.birthday || undefined,
        blood_group: formData.bloodGroup || undefined,
        gender: formData.gender || undefined,
        address: formData.address.street || formData.address.city ? {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zip_code: formData.address.zipCode,
        } : undefined,
        vital_signs: (formData.vitalSigns.bloodPressure || formData.vitalSigns.heartRate || formData.vitalSigns.spo2 || formData.vitalSigns.temperature || formData.vitalSigns.respiratoryRate || formData.vitalSigns.weight) ? {
          blood_pressure: formData.vitalSigns.bloodPressure || undefined,
          heart_rate: formData.vitalSigns.heartRate ? Number(formData.vitalSigns.heartRate) : undefined,
          spo2: formData.vitalSigns.spo2 ? Number(formData.vitalSigns.spo2) : undefined,
          temperature: formData.vitalSigns.temperature ? Number(formData.vitalSigns.temperature) : undefined,
          respiratory_rate: formData.vitalSigns.respiratoryRate ? Number(formData.vitalSigns.respiratoryRate) : undefined,
          weight: formData.vitalSigns.weight ? Number(formData.vitalSigns.weight) : undefined,
        } : undefined,
      };

      let response;
      if (patient?.id) {
        response = await apiService.updatePatient(patient.id.toString(), patientData);
      } else {
        response = await apiService.createPatient(patientData);
      }

      if (response.success) {
        if (onSave) {
          onSave(response.data || response);
        }
      } else {
        alert(response.message || 'Error saving patient. Please try again.');
      }
    } catch (error: any) {
      console.error('Error saving patient:', error);
      alert(error.response?.data?.message || 'Error saving patient. Please try again.');
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          ID Number
        </label>
        <input
          type="text"
          value={formData.idNumber}
          onChange={(e) => handleChange('idNumber', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Phone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Date of Birth
        </label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Address</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Street
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleChange('address.street', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                City
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                State
              </label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleChange('address.state', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Zip Code
            </label>
            <input
              type="text"
              value={formData.address.zipCode}
              onChange={(e) => handleChange('address.zipCode', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : patient ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
}

