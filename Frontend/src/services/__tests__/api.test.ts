import ApiService from '../api'

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}))

describe('ApiService', () => {
  it('should be defined', () => {
    expect(ApiService).toBeDefined()
  })

  it('should create an instance', () => {
    const apiService = new ApiService()
    expect(apiService).toBeInstanceOf(ApiService)
  })
})

