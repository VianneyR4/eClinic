import { RxJsonSchema } from 'rxdb';

interface PatientDoc {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  medicalHistory?: Array<{
    condition?: string;
    diagnosisDate?: string;
    notes?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  _rev?: string;
}

export const patientSchema: RxJsonSchema<PatientDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    phone: {
      type: 'string',
    },
    dateOfBirth: {
      type: 'string',
      format: 'date-time',
    },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        zipCode: { type: 'string' },
      },
    },
    medicalHistory: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          condition: { type: 'string' },
          diagnosisDate: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
    _rev: {
      type: 'string',
    },
  },
  required: ['id', 'firstName', 'lastName'],
  indexes: ['email', 'phone'],
};

export default patientSchema;

