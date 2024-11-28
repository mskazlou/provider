import './commands'
import './get-token'
import 'cypress-map'
import '@bahmutov/cy-api'

import type { Movie } from '@prisma/client'
import Chainable = Cypress.Chainable
import type {
  CreateMovieResponse,
  DeleteMovieResponse,
  GetMovieResponse,
  UpdateMovieResponse
} from '../../src/@types'

const commonHeaders = (token: string) => ({
  Authorization: token
})

interface Response<T> {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  allRequestResponses: any[]
  body: T
  duration: number
  headers: { [key: string]: string | string[] }
  isOkStatusCode: boolean
  redirects?: string[]
  redirectedToUrl?: string
  requestHeaders: { [key: string]: string }
  status: number
  statusText: string
}

Cypress.Commands.add(
  'getAllMovies',
  (
    token: string,
    allowedToFail = false
  ): Chainable<Response<GetMovieResponse> & Messages> => {
    cy.log('**getAllMovies**')
    return cy.api({
      method: 'GET',
      url: '/movies',
      headers: commonHeaders(token),
      retryOnStatusCodeFailure: !allowedToFail,
      failOnStatusCode: !allowedToFail
    })
  }
)

Cypress.Commands.add(
  'addMovie',
  (
    token: string,
    body: Omit<Movie, 'id'>,
    allowedToFail = false
  ): Chainable<Response<CreateMovieResponse> & Messages> => {
    cy.log('**addMovie**')

    return cy.api({
      method: 'POST',
      url: '/movies',
      body,
      headers: commonHeaders(token),
      retryOnStatusCodeFailure: !allowedToFail,
      failOnStatusCode: !allowedToFail
    })
  }
)

Cypress.Commands.add(
  'getMovieById',
  (
    token: string,
    id: number,
    allowedToFail = false
  ): Chainable<Response<GetMovieResponse> & Messages> => {
    cy.log(`**getMovieById: ${{ id }}**`)

    return cy.api({
      method: 'GET',
      url: `/movies/${id}`,
      headers: commonHeaders(token),
      retryOnStatusCodeFailure: !allowedToFail,
      failOnStatusCode: !allowedToFail
    })
  }
)

Cypress.Commands.add(
  'getMovieByName',
  (
    token: string,
    name: string,
    allowedToFail = false
  ): Chainable<Response<GetMovieResponse> & Messages> => {
    cy.log(`**getMovieByName: ${{ name }}**`)
    return cy.api({
      method: 'GET',
      url: '/movies',
      qs: { name },
      headers: commonHeaders(token),
      retryOnStatusCodeFailure: !allowedToFail,
      failOnStatusCode: !allowedToFail
    })
  }
)

Cypress.Commands.add(
  'updateMovie',
  (
    token: string,
    id: number,
    body: Partial<Movie>,
    allowedToFail = false
  ): Chainable<Response<UpdateMovieResponse> & Messages> => {
    cy.log(`**updateMovie by ${{ id }}**`)

    return cy.api({
      method: 'PUT',
      url: `/movies/${id}`,
      body,
      headers: commonHeaders(token),
      retryOnStatusCodeFailure: !allowedToFail,
      failOnStatusCode: !allowedToFail
    })
  }
)

Cypress.Commands.add(
  'deleteMovie',
  (
    token: string,
    id: number,
    allowedToFail = false
  ): Chainable<Response<DeleteMovieResponse> & Messages> => {
    cy.log(`**deleteMovie by ${{ id }}**`)

    return cy.api({
      method: 'DELETE',
      url: `/movies/${id}`,
      headers: commonHeaders(token),
      retryOnStatusCodeFailure: !allowedToFail,
      failOnStatusCode: !allowedToFail
    })
  }
)
