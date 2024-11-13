import { retryableBefore } from '../support/retryable-before'

describe('CRUD movie', () => {
  const sessionName = 'token-session'

  retryableBefore(() => {
    cy.api({
      method: 'GET',
      url: '/'
    })
      .its('body.message')
      .should('eq', 'Server is running!')

    cy.maybeGetToken(sessionName)
  })

  it('should', () => {
    // Cypress.getDataSession
    // Cypress.getDataSession(sessionName).should('be.a', 'string')
    cy.maybeGetToken(sessionName).should('be.a', 'string')
  })
})