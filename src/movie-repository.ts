// MovieRepository: this is the interface/contract that defines the methods
// for interacting with the data layer
// It's a port in hexagonal architecture,

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

export interface MovieRepository {
  getMovies(): Promise<GetMovieResponse>

  getMovieById(id: number): Promise<GetMovieResponse | MovieNotFoundResponse>

  getMovieByName(
    name: string
  ): Promise<GetMovieResponse | MovieNotFoundResponse>

  deleteMovieById(
    id: number
  ): Promise<DeleteMovieResponse | MovieNotFoundResponse>

  addMovie(
    data: CreateMovieRequest,
    id?: number
  ): Promise<CreateMovieResponse | ConflictMovieResponse>

  updateMovie(
    data: UpdateMovieRequest,
    id: number
  ): Promise<
    UpdateMovieResponse | MovieNotFoundResponse | ConflictMovieResponse
  >
}
