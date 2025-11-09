'use client';

interface DoctorFormProps {
  doctor?: any;
  onSave: () => void;
  onCancel: () => void;
}

export default function DoctorForm({ doctor, onSave, onCancel }: DoctorFormProps) {
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">First name</label>
          <input defaultValue={doctor?.firstName || ''} className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Last name</label>
          <input defaultValue={doctor?.lastName || ''} className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Specialty</label>
        <input defaultValue={doctor?.specialty || ''} className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Phone</label>
          <input defaultValue={doctor?.phone || ''} className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email</label>
          <input defaultValue={doctor?.email || ''} className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Address</label>
        <input defaultValue={doctor?.address || ''} className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div className="pt-2 flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white hover:bg-gray-50">Cancel</button>
        <button type="submit" className="px-3 py-1.5 text-sm rounded-md text-white bg-primary hover:bg-opacity-90">Save</button>
      </div>
    </form>
  );
}
