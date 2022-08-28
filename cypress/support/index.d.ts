/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Get one or more DOM elements by their title attribute
     * @example
     * cy.getByTitle("Create Budget")
     */
    getByTitle(title: string): Chainable<any>
    getInputFor(label: string): Chainable<any>
    clickAndWait(element: string): Chainable<any>
    resetDb(): void
  }
}
