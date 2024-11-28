import type { NextFunction, Response, Request } from 'express'
import { validateId } from './validate-id'

describe('validate-movie-id', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: NextFunction

  beforeEach(() => {
    mockRequest = {
      params: {}
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    nextFunction = jest.fn()
  })

  it('should validate movie id and call next function', () => {
    mockRequest.params = { id: '123' }

    validateId(mockRequest as Request, mockResponse as Response, nextFunction)

    expect(mockRequest.params.id).toBe('123')
    expect(nextFunction).toHaveBeenCalled()
    expect(mockResponse.status).not.toHaveBeenCalled()
    expect(mockResponse.json).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid movie Id', () => {
    mockRequest.params = { id: 'abc' }

    validateId(mockRequest as Request, mockResponse as Response, nextFunction)

    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid movie ID provided'
    })

    expect(nextFunction).not.toHaveBeenCalled()
    expect(mockRequest.params.id).toBe('abc')
  })

  it('should handle missing ID parameter', () => {
    validateId(mockRequest as Request, mockResponse as Response, nextFunction)

    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid movie ID provided'
    })
    expect(nextFunction).not.toHaveBeenCalled()
    expect(mockRequest.params!.id).toBeUndefined()
  })
})
