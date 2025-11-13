export const getVitalSignColor = (type: string, value: string | number | null | undefined): string => {
  if (!value) return 'bg-gray-500';
  
  const numValue = typeof value === 'string' ? parseFloat(value.toString().replace(/[^0-9./]/g, '')) : value;
  if (isNaN(numValue)) return 'bg-gray-500';

  switch (type) {
    case 'blood_pressure': {
      if (typeof value !== 'string') return 'bg-gray-500';
      const [systolic, diastolic] = value.toString().split('/').map(Number);
      if (systolic >= 90 && systolic <= 140 && diastolic >= 60 && diastolic <= 90) {
        return 'bg-green-500';
      }
      return 'bg-red-500';
    }
    case 'heart_rate':
      return numValue >= 60 && numValue <= 100 ? 'bg-green-500' : 'bg-red-500';
    case 'spo2':
      return numValue >= 95 ? 'bg-green-500' : 'bg-red-500';
    case 'temperature':
      return numValue >= 36 && numValue <= 37.5 ? 'bg-green-500' : 'bg-red-500';
    case 'respiratory_rate':
      return numValue >= 12 && numValue <= 20 ? 'bg-green-500' : 'bg-red-500';
    case 'weight':
      return numValue > 0 ? 'bg-green-500' : 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export const getVitalSignUnit = (type: string): string => {
  switch (type) {
    case 'blood_pressure':
      return 'mmHg';
    case 'heart_rate':
    case 'respiratory_rate':
      return 'bpm';
    case 'spo2':
      return '%';
    case 'temperature':
      return '°C';
    case 'weight':
      return 'kg';
    default:
      return '';
  }
};

export const formatVitalSignValue = (type: string, value: any): string => {
  if (value === null || value === undefined || value === '') return 'N/A';
  
  const unit = getVitalSignUnit(type);
  if (type === 'blood_pressure') {
    return value;
  }
  return `${value} ${unit}`;
};
