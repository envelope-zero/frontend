import { createBudget } from '../support/setup'

describe('Envelope: Creation', () => {
  beforeEach(() => {
    // prepare & select a budget
    cy.wrap(createBudget({ name: 'Category Test' })).then(() => {
      cy.visit('/').get('h3').contains('Category Test').click()
    })
  })

  it('can create a category for a budget', () => {
    cy.contains('Envelopes').click()

    cy.getByTitle('Create Envelope').click()

    cy.getInputFor('Name').type('Grocery Envelope')

    // Pressing enter at the end selects „Create Daily Spending“ in the
    // dropdown
    cy.getInputFor('Category').type('Daily Spending{enter}')
    cy.getInputFor('Note').type(
      'Groceries.{enter}{enter}Usually bought at a supermarket.'
    )

    cy.clickAndWait('Save')
    cy.get('h1').contains('Envelopes')

    // After saving, the Accordion for the new category should be
    // expanded.
    // We check this, click it to collapse and verify that it collapsed
    //
    // Get the accordion first to ensure it has been loaded
    cy.get('.grow > span').contains('Daily Spending').as('category')
    cy.contains('Grocery Envelope')
    cy.get('@category').click()
    cy.contains('Grocery Envelope').should('not.exist')
  })
})
