import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchDropdown from '../SearchDropdown'

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}))

jest.mock('@/services/api', () => ({
  __esModule: true,
  apiService: {
    search: jest.fn(async () => ({ success: true, data: { patients: [
      { id: 1, firstName: 'John', lastName: 'Doe', fullName: 'John Doe', phone: '123', email: 'john@example.com' },
    ], doctors: [] } })),
    getQueue: jest.fn(async () => ({ success: true, data: [] })),
  },
}))

describe('SearchDropdown (patients modal actions)', () => {
  it('shows results and opens patient actions modal on row click', async () => {
    const onClose = jest.fn()
    render(<SearchDropdown query="john" onClose={onClose} />)

    await waitFor(() => expect(screen.getByText('Patients (1)')).toBeInTheDocument())
    expect(screen.getByText('John Doe')).toBeInTheDocument()

    fireEvent.click(screen.getByText('John Doe'))

    await waitFor(() => expect(screen.getByText('Choose an action')).toBeInTheDocument())
    expect(screen.getByText('New Appointment')).toBeInTheDocument()
    expect(screen.getByText('Send to queue')).toBeInTheDocument()
    expect(screen.getByText('View Detail')).toBeInTheDocument()
  })

  it('close icon triggers onClose for the search dropdown', async () => {
    const onClose = jest.fn()
    render(<SearchDropdown query="" onClose={onClose} />)

    const closeButtons = screen.getAllByRole('button')
    // The close icon is rendered even without results
    fireEvent.click(closeButtons[0])
    expect(onClose).toHaveBeenCalled()
  })

  it('outside click closes the search dropdown', async () => {
    const onClose = jest.fn()
    const { container } = render(<SearchDropdown query="" onClose={onClose} />)
    fireEvent.mouseDown(document.body)
    expect(onClose).toHaveBeenCalled()
  })
})
