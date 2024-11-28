import 'cypress-ajv-schema-validator'
import { retryableBefore } from '../support/retryable-before'
import { generateMovieWithoutId } from '../../src/test-helpers/factories'
import type { Movie } from '@prisma/client'
import spok from 'cy-spok'
import type { OpenAPIV3_1 } from 'openapi-types'
import schema from '../../src/api-docs/openapi.json'
import { number } from 'zod'

const typedSchema: OpenAPIV3_1.Document = schema as OpenAPIV3_1.Document

describe('CRUD movie', () => {
  const movie = generateMovieWithoutId()
  const updatedMovie = generateMovieWithoutId()
  const sessionName = 'token-session'
  const movieProps: Omit<Movie, 'id'> = {
    name: spok.string,
    year: spok.number,
    rating: spok.number
  }

  retryableBefore(() => {
    cy.api({
      method: 'GET',
      url: '/'
    })
      .its('body.message')
      .should('eq', 'Server is running.')

    cy.maybeGetToken(sessionName)
  })

  it('should crud', () => {
    cy.maybeGetToken(sessionName)
      .should('be.a', 'string')
      .then((token: string) => {
        cy.addMovie(token, movie)
          .validateSchema(typedSchema, {
            endpoint: '/movies',
            method: 'POST'
          })
          .its('body')
          .then(
            spok({
              status: number,
              data: {
                id: spok.number,
                ...movieProps
              }
            })
          )
          .its('data.id')
          .as('id')

        cy.getAllMovies(token)
          .validateSchema(typedSchema, {
            endpoint: '/movies',
            method: 'GET'
          })
          .its('body')
          .should(
            spok({
              status: spok.number,
              data: (arr: Movie[]) =>
                arr.map(
                  spok({
                    id: spok.number,
                    ...movieProps
                  })
                )
            })
          )

        cy.get('@id')
          .then((id: unknown) => cy.getMovieById(token, id as number))
          .validateSchema(typedSchema, {
            endpoint: '/movies/{id}',
            method: 'GET'
          })
          .its('body')
          .then(
            spok({
              status: spok.number,
              data: {
                id: spok.number,
                ...movieProps
              }
            })
          )
          .its('data.name')
          .then((name) => cy.getMovieByName(token, name))
          .validateSchema(typedSchema, {
            endpoint: '/movies',
            method: 'GET'
          })
          .its('body')
          .then(
            spok({
              status: spok.number,
              data: { id: spok.number, ...movieProps }
            })
          )

        cy.get('@id')
          .then((id: unknown) =>
            cy.updateMovie(token, id as number, updatedMovie)
          )
          .validateSchema(typedSchema, {
            endpoint: '/movies/{id}',
            method: 'PUT',
            status: 200
          })
          .its('body')
          .should(
            spok({
              status: 200,
              data: {
                ...movieProps,
                id: spok.number
              }
            })
          )

        cy.get('@id')
          .then((id: unknown) => cy.deleteMovie(token, id as number))
          .validateSchema(typedSchema, {
            endpoint: '/movies/{id}',
            method: 'DELETE',
            status: 200
          })
          .its('body')
          .should(
            spok({
              status: 200,
              message: spok.string
            })
          )

        cy.getAllMovies(token)
          .its('body.data')
          .findOne({ name: movie.name })
          .should('not.exist')

        cy.log('**delete non existing movie**')
        cy.get('@id')
          .then((id: unknown) => cy.deleteMovie(token, id as number, true))
          .validateSchema(typedSchema, {
            endpoint: '/movies/{id}',
            method: 'DELETE',
            status: 404
          })
          .its('body')
          .should(
            spok({
              status: 404,
              error: spok.string
            })
          )
      })
  })
})
