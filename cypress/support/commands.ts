/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to visit the home page
       * @example cy.visitHome()
       */
      visitHome(): Chainable<void>

      /**
       * Custom command to search for GitHub users
       * @example cy.searchUsers('test')
       */
      searchUsers(query: string): Chainable<void>

      /**
       * Custom command to wait for search results
       * @example cy.waitForResults()
       */
      waitForResults(): Chainable<void>

      /**
       * Custom command to intercept GitHub API
       * @example cy.interceptGitHubAPI()
       */
      interceptGitHubAPI(fixture?: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('visitHome', () => {
  cy.visit('/')
})

Cypress.Commands.add('searchUsers', (query: string) => {
  cy.get('input[placeholder*="Search"]').clear().type(query)
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('waitForResults', () => {
  cy.get('[data-testid="user-list"]', { timeout: 10000 }).should('be.visible')
})

Cypress.Commands.add('interceptGitHubAPI', (fixture?: string) => {
  if (fixture) {
    cy.intercept('GET', '/api/search*', { fixture }).as('searchAPI')
  } else {
    cy.intercept('GET', '/api/search*').as('searchAPI')
  }
})

export {}
