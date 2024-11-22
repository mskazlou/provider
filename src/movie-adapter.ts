import { Prisma } from '@prisma/client'
import type { MovieRepository } from './movie-repository'
import type { PrismaClient } from '@prisma/client'
import type {
  ConflictMovieResponse,
  CreateMovieRequest,
  CreateMovieResponse,
  DeleteMovieResponse,
  GetMovieResponse,
  MovieNotFoundResponse,
  UpdateMovieRequest,
  UpdateMovieResponse
} from './@types'

// Movie Adapter: THis is the implementation of the MovieRepository interface
// responsible for interacting with a specific data source (like Prisma)
// It's an adapter in hexagonal architecture.

// The key benefits are improved flexibility and testability:

// 1) FlexibilityL the business logic (MovieService) is decoupled form
// making it easier to swap or replace adapters (e.g., switch from Prisma)
// without changing the business logic.

// 2) Testability: this separation allows for isolated unit tests of each
// meaning you can test the business logic independently from the data
// and mock the repository for more controlled and efficient tests.

export class MovieAdapter implements MovieRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private handleError(error: unknown): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(
        'Prisma error code: ',
        error.code,
        'Message: ',
        error.message
      )
    } else if (error instanceof Error) {
      console.error('Error: ', error.message)
    } else {
      console.error('An unknown error occurred: ', error)
    }
  }

  async addMovie(
    data: CreateMovieRequest,
    id?: number
  ): Promise<CreateMovieResponse | ConflictMovieResponse> {
    try {
      const existingMovie = await this.prisma.movie.findFirst({
        where: { name: data.name }
      })
      if (existingMovie) {
        return {
          status: 409,
          error: `Movie with name ${data.name} already exists`
        }
      }
      const movie = await this.prisma.movie.create({
        data: id ? { ...data, id } : data
      })
      return {
        status: 200,
        data: movie
      }
    } catch (error) {
      this.handleError(error)
      return {
        status: 500,
        error: 'Internal server error'
      }
    }
  }

  async deleteMovieById(
    id: number
  ): Promise<DeleteMovieResponse | MovieNotFoundResponse> {
    try {
      await this.prisma.movie.delete({ where: { id } })
      return {
        status: 200,
        message: `Movie ${id} has been deleted`
      }
    } catch (error) {
      // Handle specific error codes (e.g., movie not found)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return {
          status: 404,
          message: `Movie with ID ${id} not found.`
        }
      }
      this.handleError(error)
      throw error // rethrow other errors
    }
  }

  async getMovieById(
    id: number
  ): Promise<GetMovieResponse | MovieNotFoundResponse> {
    try {
      const movie = await this.prisma.movie.findUnique({
        where: { id }
      })
      if (movie) {
        return {
          status: 200,
          data: movie,
          error: null
        }
      } else {
        return {
          status: 404,
          data: null,
          error: `Movie with ID ${id} not found`
        }
      }
    } catch (error) {
      this.handleError(error)
      return {
        status: 500,
        data: null,
        error: 'Internal server error'
      }
    }
  }

  async getMovieByName(
    name: string
  ): Promise<GetMovieResponse | MovieNotFoundResponse> {
    try {
      const movie = await this.prisma.movie.findFirst({ where: { name } })
      if (movie) {
        return {
          status: 200,
          data: movie,
          error: null
        }
      } else {
        return {
          status: 404,
          data: null,
          error: `Movie with name ${name} not found`
        }
      }
    } catch (error) {
      this.handleError(error)
      return {
        status: 500,
        data: null,
        error: 'Internal server error'
      }
    }
  }

  async getMovies(): Promise<GetMovieResponse> {
    try {
      // const movies = await this.prisma.movie.findMany();
      const movies = await this.prisma.movie.findMany()
      if (movies.length > 0) {
        return {
          status: 200,
          data: movies,
          error: null
        }
      } else {
        return {
          status: 200,
          data: [],
          error: null
        }
      }
    } catch (error) {
      this.handleError(error)
      return {
        status: 500,
        data: null,
        error: 'Failed to retrieve movies'
      }
    }
  }

  async updateMovie(
    data: UpdateMovieRequest,
    id: number
  ): Promise<
    UpdateMovieResponse | MovieNotFoundResponse | ConflictMovieResponse
  > {
    try {
      const existingMovie = await this.prisma.movie.findUnique({
        where: { id }
      })
      if (!existingMovie) {
        return {
          status: 404,
          error: `Movie with ID ${id} not found.`
        }
      }
      const updatedMovie = await this.prisma.movie.update({
        where: { id },
        data
      })
      return {
        status: 200,
        data: updatedMovie
      }
    } catch (error) {
      this.handleError(error)
      return {
        status: 500,
        error: 'Internal server error'
      }
    }
  }
}
