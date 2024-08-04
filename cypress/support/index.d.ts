/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Get one or more DOM elements by their title attribute
     * @example
     * cy.getByTitle("Create Budget")
     */
    getByTitle(title: string): Chainable<any>
    getInputFor(
      label: string,
      options?: Partial<
        Cypress.Loggable &
          Cypress.Timeoutable &
          Cypress.Withinable &
          Cypress.Shadow
      >
    ): Chainable<any>
    getAutocompleteFor(label: string): Chainable<any>
    clickAndWait(element: string): Chainable<any>
    awaitLoading(): Chainable<any>
    resetDb(): void
  }
}
