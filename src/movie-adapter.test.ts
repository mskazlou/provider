import { mockDeep } from 'jest-mock-extended'
import type { DeepMockProxy } from 'jest-mock-extended'
import { Prisma, PrismaClient } from '@prisma/client'
import type { Movie } from '@prisma/client'
import { MovieAdapter } from './movie-adapter'
import {
  generateMovieWithId,
  generateMovieWithoutId
} from './test-helpers/factories'

// In this test suite, we are testing the Adapter,
//   which is responsible for interacting with the data source (Prisma).
//
// Since this is an adapter in the hexagonal architecture (ports & adapters),
//   its primary role is to handle data persistence and retrieval,
//   and the tests here ensure that it behaves correctly in terms of data handling and error management.
//
//   By mocking PrismaClient, we isolate the tests to focus solely on the adapter's logic and its interaction with Prisma's API
// This allows us to test how the adapter handles different scenarios,
//   like successfully retrieving or creating data, and how it manages errors (e.g., database connection issues).
//
// These tests do not touch the real database, making them unit tests that ensure correctness
// of the adapter's interaction with the mocked data layer.

jest.mock('@prisma/client', () => {
  const actualPrisma = jest.requireActual('@prisma/client')
  return {
    ...actualPrisma,
    PrismaClient: jest.fn(() => mockDeep<PrismaClient>())
  }
})

describe('Movie Adapter', () => {
  let prismaMock: DeepMockProxy<PrismaClient>
  let movieAdapter: MovieAdapter

  const mockMovie: Movie = generateMovieWithId()

  beforeEach(() => {
    prismaMock = new PrismaClient() as DeepMockProxy<PrismaClient>
    movieAdapter = new MovieAdapter(prismaMock)
  })

  describe('getMovies', () => {
    it('should get all movies', async () => {
      prismaMock.movie.findMany.mockResolvedValue([mockMovie])

      const { data } = await movieAdapter.getMovies()

      expect(data).toEqual([mockMovie])
      expect(prismaMock.movie.findMany).toHaveBeenCalledTimes(1)
    })

    it('should get all movies and get an empty array', async () => {
      const emptyArray: Movie[] = []
      prismaMock.movie.findMany.mockResolvedValue(emptyArray)

      const { data } = await movieAdapter.getMovies()

      expect(data).toEqual(emptyArray)
      expect(prismaMock.movie.findMany).toHaveBeenCalledTimes(1)
    })

    it('should handle errors in getMovies', async () => {
      prismaMock.movie.findMany.mockRejectedValue(
        new Error('Error fetching all movies')
      )

      const result = await movieAdapter.getMovies()
      expect(result.data).toBeNull()
      expect(prismaMock.movie.findMany).toHaveBeenCalledTimes(1)
    })
  })

  describe('getMovieById', () => {
    it('should get a movie by id', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(mockMovie)

      // @ts-expect-error Typescript error
      const { data } = await movieAdapter.getMovieById(mockMovie.id)

      expect(data).toEqual(mockMovie)
      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: { id: mockMovie.id }
      })
    })

    it('should return null if movie by id not found', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(null)
      const id = 999

      // @ts-expect-error ts error is expected here
      const { data } = await movieAdapter.getMovieById(id)
      expect(data).toBeNull()
      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: { id: id }
      })
    })

    it('should handle errors in getMovieById', async () => {
      prismaMock.movie.findUnique.mockRejectedValue(
        new Error('Error fetching movie by id')
      )

      // @ts-expect-error ts error is expected here
      const { data } = await movieAdapter.getMovieById(1)

      expect(data).toBeNull()
      expect(prismaMock.movie.findUnique).toHaveBeenCalledTimes(1)
    })
  })

  describe('getMovieByName', () => {
    it('should get a movie by name', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(mockMovie)

      // @ts-expect-error ts error is expected here
      const { data } = await movieAdapter.getMovieByName(mockMovie.name)

      expect(data).toEqual(mockMovie)
      expect(prismaMock.movie.findFirst).toHaveBeenCalledWith({
        where: { name: mockMovie.name }
      })
    })

    it('should return null if movie by name not found', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(null)
      const name = 'non-existent Movie'

      // @ts-expect-error ts error is expected here
      const { data } = await movieAdapter.getMovieByName(name)

      expect(data).toBeNull()
      expect(prismaMock.movie.findFirst).toHaveBeenCalledWith({
        where: { name }
      })
    })

    it('should handle errors in getMovieByName', async () => {
      prismaMock.movie.findFirst.mockRejectedValue(
        new Error('Error fetching movie by name')
      )

      // @ts-expect-error ts error is expected here
      const { data } = await movieAdapter.getMovieByName('Inception')

      expect(data).toBeNull()
      expect(prismaMock.movie.findFirst).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteMovieById', () => {
    it('should delete a movie by id', async () => {
      const expected = {
        status: 200,
        message: `Movie ${mockMovie.id} has been deleted`
      }
      prismaMock.movie.delete.mockResolvedValue({} as Movie)

      const result = await movieAdapter.deleteMovieById(mockMovie.id)

      expect(result).toStrictEqual(expected)

      expect(prismaMock.movie.delete).toHaveBeenCalledWith({
        where: { id: mockMovie.id }
      })
    })

    it('should delete a movie and return false if the movie is not found', async () => {
      const id = 333
      const expected = {
        status: 404,
        message: `Movie with ID ${id} not found.`
      }

      prismaMock.movie.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Movie not found', {
          code: 'P2025',
          clientVersion: '1'
        })
      )

      const result = await movieAdapter.deleteMovieById(id)

      expect(result).toStrictEqual(expected)

      expect(prismaMock.movie.delete).toHaveBeenCalledWith({
        where: { id }
      })
    })

    it('should call handle error and rethrow unexpected errors in deleteMovieById', async () => {
      const unExpectedError = new Error('Unexpected error')

      prismaMock.movie.delete.mockRejectedValue(unExpectedError)
      const id = 999

      // spy on the handle
      // @ts-expect-error this error is expected
      const handleErrorSpy = jest.spyOn(movieAdapter, 'handleError')

      await expect(movieAdapter.deleteMovieById(id)).rejects.toThrow(
        'Unexpected error'
      )

      expect(handleErrorSpy).toHaveBeenCalledWith(unExpectedError)
      expect(prismaMock.movie.delete).toHaveBeenCalledTimes(1)
    })
  })

  describe('addMovie', () => {
    const movieData = { ...generateMovieWithoutId(), name: 'Inception' }
    const id = 1
    const movie = { id, ...movieData }

    it('should successfully add a movie without specifying an id', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(null) // no existing movie
      prismaMock.movie.create.mockResolvedValue(movie)

      const result = await movieAdapter.addMovie(movieData)
      expect(result).toEqual({
        status: 200,
        data: movie
      })

      expect(prismaMock.movie.create).toHaveBeenCalledWith({ data: movieData })
    })

    it('should successfully add a movie specifying an id', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(null) // no existing movie
      prismaMock.movie.create.mockResolvedValue(movie)

      const result = await movieAdapter.addMovie(movieData, id)
      expect(result).toEqual({
        status: 200,
        data: movie
      })

      expect(prismaMock.movie.create).toHaveBeenCalledWith({ data: movie })
    })

    it('should return 409 if the movie already exists', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(movie) // existing movie

      const result = await movieAdapter.addMovie(movieData)

      expect(result).toEqual(
        expect.objectContaining({
          status: 409,
          error: `Movie with name ${movie.name} already exists`
        })
      )
    })

    it('should return 500 if an unexpected error occurs', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(null) // existing movie
      const error = 'Unexpected error'
      prismaMock.movie.create.mockRejectedValue(new Error(error))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleErrorSpy = jest.spyOn(movieAdapter as any, 'handleError')

      const result = await movieAdapter.addMovie(movieData)

      expect(result).toEqual(
        expect.objectContaining({
          status: 500,
          error: 'Internal server error'
        })
      )
      expect(handleErrorSpy).toHaveBeenCalledWith(new Error(error))
    })
  })
})
