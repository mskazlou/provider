import type { MovieRepository } from './movie-repository'
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
import { CreateMovieSchema, UpdateMovieSchema } from './@types/schema'
import { validateSchema } from './validate-schema'

// In the context of the MovieService, what you care about is the contract/interface
// (i.e., the methods defined by the MovieRepository interface).
// The service doesn't care if it's using Prisma, a REST API, or an in-memory database
// it only cares that the object implements MovieRepository

/**
 * API (Driving Adapter - entry point)
 *              |
 *              |
 *              V
 *         MovieService
 *         (Application Core/Hexagon)
 *              |
 *              |
 *              V
 *        MovieRepository (Port)
 *              |
 *              |
 *              V
 *     Movie Adapter (Driven Adapter - secondary, interacts with outside)
 *
 *              |
 *              |
 *              V
 *           Database
 */

export class MovieService {
  constructor(private readonly movieRepository: MovieRepository) {
    this.movieRepository = movieRepository
  }

  async getMovies(): Promise<GetMovieResponse> {
    return this.movieRepository.getMovies()
  }

  async getMovieById(
    id: number
  ): Promise<GetMovieResponse | MovieNotFoundResponse> {
    return this.movieRepository.getMovieById(id)
  }

  async getMovieByName(
    name: string
  ): Promise<GetMovieResponse | MovieNotFoundResponse> {
    return this.movieRepository.getMovieByName(name)
  }

  async deleteMovieById(
    id: number
  ): Promise<DeleteMovieResponse | MovieNotFoundResponse> {
    return this.movieRepository.deleteMovieById(id)
  }

  async addMovie(
    data: CreateMovieRequest,
    id?: number
  ): Promise<CreateMovieResponse | ConflictMovieResponse> {
    // Zod Key feature 3: safeParse
    // Zod note: if you have a frontend, you can use the schema + safeParse there
    // in order to perform form validation before sending the data tot the server
    const validationResult = validateSchema(CreateMovieSchema, data)
    if (!validationResult.success)
      return { status: 400, error: validationResult.error }
    return this.movieRepository.addMovie(data, id)
  }

  async updateMovie(
    data: UpdateMovieRequest,
    id: number
  ): Promise<
    UpdateMovieResponse | MovieNotFoundResponse | ConflictMovieResponse
  > {
    const validationResult = validateSchema(UpdateMovieSchema, data)
    if (!validationResult.success)
      return { status: 400, error: validationResult.error }
    return this.movieRepository.updateMovie(data, id)
  }
}
