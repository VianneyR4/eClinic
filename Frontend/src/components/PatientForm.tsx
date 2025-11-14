'use client';

import { useState, FormEvent, useEffect } from 'react';
import type { ChangeEvent } from 'react';
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
    photo: patient?.photo || '',
    medicalHistory: typeof patient?.medical_history === 'string' ? patient.medical_history : (patient?.medical_history ? JSON.stringify(patient.medical_history) : ''),
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
        birthday: patient.birthday || '',
        bloodGroup: patient.blood_group || '',
        gender: patient.gender || '',
        photo: patient.photo || '',
        medicalHistory: typeof patient.medical_history === 'string' ? patient.medical_history : (patient.medical_history ? JSON.stringify(patient.medical_history) : ''),
        address: {
          street: patient.address?.street || '',
          city: patient.address?.city || '',
          state: patient.address?.state || '',
          zipCode: patient.address?.zipCode || patient.address?.zip_code || '',
        },
        vitalSigns: {
          bloodPressure: patient.vital_signs?.blood_pressure || '',
          heartRate: patient.vital_signs?.heart_rate || '',
          spo2: patient.vital_signs?.spo2 || '',
          temperature: patient.vital_signs?.temperature || '',
          respiratoryRate: patient.vital_signs?.respiratory_rate || '',
          weight: patient.vital_signs?.weight || '',
        },
      });
    }
  }, [patient]);

  // Helper function to format address
  const formatAddress = (address: { street?: string; city?: string; state?: string; zipCode?: string } | undefined): string => {
    if (!address) return '';
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      // Prepare the patient data
      const patientData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        id_number: formData.idNumber || undefined,
        date_of_birth: formData.dateOfBirth || formData.birthday || undefined, // Use either date field
        blood_group: formData.bloodGroup || undefined,
        gender: formData.gender || undefined,
        photo: formData.photo || undefined,
        medical_history: formData.medicalHistory || undefined,
        address: (formData.address?.street || formData.address?.city || formData.address?.state || formData.address?.zipCode)
          ? {
              street: formData.address.street || '',
              city: formData.address.city || '',
              state: formData.address.state || '',
              zip_code: formData.address.zipCode || '',
            }
          : undefined,
        vital_signs: {
          blood_pressure: formData.vitalSigns.bloodPressure || '',
          heart_rate: formData.vitalSigns.heartRate || '',
          spo2: formData.vitalSigns.spo2 || '',
          temperature: formData.vitalSigns.temperature || '',
          respiratory_rate: formData.vitalSigns.respiratoryRate || '',
          weight: formData.vitalSigns.weight || ''
        }
      };

      let response;
      
      // Determine if we're updating or creating
      if (patient?.id) {
        // Update existing patient
        response = await apiService.updatePatient(patient.id, patientData);
      } else {
        // Create new patient
        response = await apiService.createPatient(patientData);
      }

      // Handle the response
      if (response?.success) {
        // Call the onSave callback with the updated/created patient data
        onSave?.(response.data || response);
      } else {
        // Show error message from the API or a generic one
        const errorMessage = response?.message || 'An error occurred while saving the patient';
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error saving patient:', error);
      // Show a user-friendly error message
      const errorMessage = error.response?.data?.message || 'Failed to save patient. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData((prev: any) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (field.startsWith('vitalSigns.')) {
      const vitalField = field.split('.')[1];
      setFormData((prev: any) => ({
        ...prev,
        vitalSigns: {
          ...prev.vitalSigns,
          [vitalField]: value,
        },
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <div className="flex flex-col h-[100%]">
      {/* Scrollable form area */}
      <form
        id="patient-form"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto"
      >
        {/* --- Personal Info --- */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name *" value={formData.firstName} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('firstName', e.target.value)} />
            <Input label="Last Name *" value={formData.lastName} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('lastName', e.target.value)} />
          </div>

          <Input label="Email" type="email" value={formData.email} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)} />
          <Input label="ID Number" value={formData.idNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('idNumber', e.target.value)} />
          <Input label="Phone" type="tel" value={formData.phone} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('phone', e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('dateOfBirth', e.target.value)} />
            <Input label="Birthday" type="date" value={formData.birthday} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('birthday', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Gender" value={formData.gender} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange('gender', e.target.value)} options={["Male", "Female"]} />
            <Select
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange('bloodGroup', e.target.value)}
              options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            />
          </div>

          <Input label="Photo URL" type="url" value={formData.photo} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('photo', e.target.value)} placeholder="https://example.com/photo.jpg" />
        </section>

        {/* --- Vital Signs --- */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Vital Signs</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Blood Pressure" value={formData.vitalSigns.bloodPressure} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('vitalSigns.bloodPressure', e.target.value)} placeholder="e.g., 120/80" />
            <Input label="Heart Rate (bpm)" type="number" value={formData.vitalSigns.heartRate} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('vitalSigns.heartRate', e.target.value)} placeholder="e.g., 72" />
            <Input label="SPO2 (%)" type="number" value={formData.vitalSigns.spo2} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('vitalSigns.spo2', e.target.value)} placeholder="e.g., 98" />
            <Input label="Temperature (°C)" type="number" step="0.1" value={formData.vitalSigns.temperature} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('vitalSigns.temperature', e.target.value)} placeholder="e.g., 36.5" />
            <Input label="Respiratory Rate (bpm)" type="number" value={formData.vitalSigns.respiratoryRate} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('vitalSigns.respiratoryRate', e.target.value)} placeholder="e.g., 16" />
            <Input label="Weight (kg)" type="number" step="0.1" value={formData.vitalSigns.weight} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('vitalSigns.weight', e.target.value)} placeholder="e.g., 70" />
          </div>
        </section>

        {/* --- Medical History --- */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Medical History</h2>
          <textarea
            value={formData.medicalHistory}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange('medicalHistory', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
            rows={4}
            placeholder="Enter medical history (text or JSON format)"
          />
        </section>

        {/* --- Address --- */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Address</h2>
          <Input label="Street" value={formData.address.street} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('address.street', e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="City" value={formData.address.city} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('address.city', e.target.value)} />
            <Input label="State" value={formData.address.state} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('address.state', e.target.value)} />
          </div>
          <Input label="Zip Code" value={formData.address.zipCode} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('address.zipCode', e.target.value)} />
        </section>
      </form>

      {/* --- Sticky Buttons --- */}
      <div className="sticky bottom-0 w-full bg-white border-t border-gray-200 px-6 sm:px-10 py-4 flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          form="patient-form"
          disabled={loading}
          className="px-5 py-2 text-sm text-white bg-primary rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : patient?.id ? 'Update Patient' : 'Create Patient'}
        </button>
      </div>
    </div>
  );
}


/* --- Reusable Input and Select Components --- */
function Input({ label, type = "text", value, onChange, placeholder, step }: { label: string; type?: string; value?: string | number; onChange?: (e: ChangeEvent<HTMLInputElement>) => void; placeholder?: string; step?: number | string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value as any}
        onChange={onChange}
        placeholder={placeholder}
        step={step as any}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none bg-white"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none bg-white"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}