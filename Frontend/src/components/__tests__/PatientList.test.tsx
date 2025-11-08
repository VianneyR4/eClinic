import { render, screen } from '@testing-library/react'
import PatientList from '../PatientList'

// Mock the API service
jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    getPatients: jest.fn(),
  },
}))

describe('PatientList', () => {
  it('renders without crashing', () => {
    render(<PatientList />)
    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})

