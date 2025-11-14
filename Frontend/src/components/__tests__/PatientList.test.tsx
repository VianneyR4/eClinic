import { render, screen } from '@testing-library/react'
import PatientList from '../PatientList'

// Mock Next.js router used by the component
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}))

// Mock the API service with the correct alias and shape
jest.mock('@/services/api', () => ({
  __esModule: true,
  apiService: {
    getPatients: jest.fn(async () => ({
      success: true,
      data: [
        { id: 1, first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' },
      ],
    })),
    deletePatient: jest.fn(async () => ({ success: true })),
  },
}))

describe('PatientList', () => {
  it('renders a patient list', async () => {
    render(<PatientList />)
    // wait for the async load to finish and list to appear
    expect(await screen.findByRole('list')).toBeInTheDocument()
  })
})

