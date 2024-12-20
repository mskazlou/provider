import { Router } from 'express'
import { authMiddleware } from './middleware/auth.middleware'
import { PrismaClient } from '@prisma/client'
import { MovieAdapter } from './movie-adapter'
import { MovieService } from './movie-service'
import { formatResponse } from './utils/format-response'
import { validateId } from './middleware/validate-id'

export const moviesRoute = Router()

// apply auth middleware to all routes under this prefix

moviesRoute.use(authMiddleware)

const prisma = new PrismaClient()

// Create the MovieAdapter and inject it into the MovieService
const movieAdapter = new MovieAdapter(prisma)
const movieService = new MovieService(movieAdapter)

// Routes are focused on handling HTTP requests and responses,
// delegating business logic to the MoviesService (Separation of Concerns)

moviesRoute.get('/', async (req, res) => {
  const name = req.query.name

  if (typeof name === 'string') {
    const movie = await movieService.getMovieByName(name)
    return formatResponse(res, movie)
  } else if (name) {
    return res.status(400).json({ error: 'Invalid movie name provided' })
  } else {
    const allMovies = await movieService.getMovies()
    return formatResponse(res, allMovies)
  }
})

moviesRoute.post('/', async (req, res) => {
  const result = await movieService.addMovie(req.body)

  // if ('data' in result) {
  //   const movie = result.data
  //    // do Kafka things
  // }

  return formatResponse(res, result)
})

moviesRoute.get('/:id', async (req, res) => {
  const result = await movieService.getMovieById(Number(req.params.id))

  return formatResponse(res, result)
})

moviesRoute.put('/:id', validateId, async (req, res) => {
  const result = await movieService.updateMovie(req.body, Number(req.params.id))

  return formatResponse(res, result)
})

moviesRoute.delete('/:id', async (req, res) => {
  // check if the movie exists before attempting to delete it
  const movieId = req.params.id
  const movieResponse = await movieService.getMovieById(Number(movieId))
  // proceed only if the movie exists
  if ('data' in movieResponse && movieResponse.data) {
    // const movie = movieResponse.data as Movie
    const result = await movieService.deleteMovieById(Number(movieId))

    // if ('message' in result) {
    // do Kafka things
    return formatResponse(res, result)
  } else {
    // if the movie was not found, return a 404 or an appropriate error response
    return formatResponse(res, {
      status: 404,
      error: `Movie with ID ${Number(movieId)} not found`
    })
  }
})
