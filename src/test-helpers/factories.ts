import { faker } from '@faker-js/faker'
import type { Movie } from '@prisma/client'

export const generateMovieWithoutId = (): Omit<Movie, 'id'> => ({
  name: faker.lorem.word(3),
  year: faker.date.past({ years: 50 }).getFullYear(),
  rating: faker.number.float({ min: 1, max: 10, fractionDigits: 1 })
})

export const generateMovieWithId = (): Movie => ({
  id: faker.number.int({ min: 1, max: 1000 }),
  name: faker.lorem.word(3),
  year: faker.date.past({ years: 50 }).getFullYear(),
  rating: faker.number.float({ min: 1, max: 10, fractionDigits: 1 })
})
