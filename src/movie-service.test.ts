// because we use ports & adapters / hex pattern
// the data layer (MovieRepository) is a dependency we can mock
// this ensures we're testing only the business logic and not the database.

// in this test suite, we are focusing on the Service which encapsulates the business logic
// Since we are following the ports & adapters (hexagonal) architecture,
// the service depends on a port/interface/contract, defined by the Repository

// We mock the data layer (Repository) to isolate and test only the business login in the service
// By mocking the data layer (Repository), we ensure that the tests focus purely on how the service behaves:
// handling input, interacting with the repository, and returning the appropriate output or errors
// this approach allows us to write unit tests that are fast, isolated and independent of any external system like database

import { MovieService } from './movie-service'
import type { MovieRepository } from './movie-repository'
import { generateMovieWithoutId } from './test-helpers/factories'
import type { Movie } from '@prisma/client'

describe('Movie Service', () => {
  let movieService: MovieService
  let mockMovieRepository: jest.Mocked<MovieRepository>

  const id = 1
  const mockMovie: Movie = { ...generateMovieWithoutId(), id }
  const mockMovieResponse = { status: 200, data: mockMovie, error: null }
  const notFoundResponse = { status: 404, data: null, error: null }

  beforeEach(() => {
    mockMovieRepository = {
      getMovieById: jest.fn(),
      getMovieByName: jest.fn(),
      deleteMovieById: jest.fn(),
      addMovie: jest.fn(),
      updateMovie: jest.fn(),
      getMovies: jest.fn()
    }

    movieService = new MovieService(mockMovieRepository)
  })

  it('should get all movies', async () => {
    mockMovieRepository.getMovies.mockResolvedValue(mockMovieResponse)

    const { data } = await movieService.getMovies()

    expect(data).toEqual(mockMovie)
    expect(mockMovieRepository.getMovies).toHaveBeenCalledTimes(1)
  })

  it('should get a movie by id', async () => {
    mockMovieRepository.getMovieById.mockResolvedValue(mockMovieResponse)

    // @ts-expect-error the error is expected here
    const { data } = await movieService.getMovieById(id)

    expect(data).toEqual(mockMovie)
    expect(mockMovieRepository.getMovieById).toHaveBeenCalledWith(id)
  })

  it('should return null if movie by id not found', async () => {
    mockMovieRepository.getMovieById.mockResolvedValue(notFoundResponse)

    const id = 999

    // @ts-expect-error the error is expected here
    const { data } = await movieService.getMovieById(id)

    expect(data).toBeNull()
    expect(mockMovieRepository.getMovieById).toHaveBeenCalledWith(id)
  })

  it('should get a movie by name', async () => {
    mockMovieRepository.getMovieByName.mockResolvedValue(mockMovieResponse)

    // @ts-expect-error the error is expected here
    const { data } = await movieService.getMovieByName(mockMovie.name)

    expect(data).toEqual(mockMovie)
    expect(mockMovieRepository.getMovieByName).toHaveBeenCalledWith(
      mockMovie.name
    )
  })

  it('should return null if movie by name not found', async () => {
    mockMovieRepository.getMovieByName.mockResolvedValue(notFoundResponse)
    const name = 'Not Found'

    // @ts-expect-error the error is expected here
    const { data } = await movieService.getMovieByName(name)

    expect(data).toBeNull()
    expect(mockMovieRepository.getMovieByName).toHaveBeenCalledWith(name)
  })

  it('should add a new movie', async () => {
    const expectedResult = {
      status: 200,
      data: mockMovie,
      error: undefined
    }

    mockMovieRepository.addMovie.mockResolvedValue(expectedResult)
    const result = await movieService.addMovie(mockMovie)

    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.addMovie).toHaveBeenCalledWith(
      mockMovie,
      undefined
    )
  })

  it('should update a movie', async () => {
    const expectedResult = {
      status: 200,
      data: mockMovie,
      error: undefined
    }

    mockMovieRepository.updateMovie.mockResolvedValue(expectedResult)

    const result = await movieService.updateMovie(
      {
        name: mockMovie.name,
        year: mockMovie.year
      },
      id
    )

    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.updateMovie).toHaveBeenCalledWith(
      {
        name: mockMovie.name,
        year: mockMovie.year
      },
      id
    )
  })

  it('should delete a movie by id', async () => {
    const expectedResult = {
      status: 200,
      message: 'Movie deleted'
    }
    mockMovieRepository.deleteMovieById.mockResolvedValue(expectedResult)

    const result = await movieService.deleteMovieById(id)

    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.deleteMovieById).toHaveBeenCalledWith(id)
  })

  it('should return 400 if addMovie validation fails', async () => {
    const invalidMovieData = { name: '', year: 1899, rating: 7.5 }

    const result = await movieService.addMovie(invalidMovieData)

    expect(result).toEqual(
      expect.objectContaining({
        status: 400,
        error:
          'String must contain at least 1 character(s), Number must be greater than or equal to 1900'
      })
    )
  })

  it('should return 400 if updateMovie validation fails', async () => {
    const invalidMovieData = { name: '', year: 2030 }

    const result = await movieService.updateMovie(invalidMovieData, id)

    expect(result).toEqual(
      expect.objectContaining({
        status: 400,
        error:
          'String must contain at least 1 character(s), Number must be less than or equal to 2024'
      })
    )
  })

  it('should try to delete and not find a movie', async () => {
    const expectedResult = {
      status: 404,
      error: 'Movie not found'
    }
    mockMovieRepository.deleteMovieById.mockResolvedValue(expectedResult)
    const id = 999

    const result = await movieService.deleteMovieById(id)

    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.deleteMovieById).toHaveBeenCalledWith(id)
  })
})
