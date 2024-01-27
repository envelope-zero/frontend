import { createBudget } from '../support/setup'

describe('Envelope: Creation', () => {
  beforeEach(() => {
    // prepare & select a budget
    cy.wrap(createBudget({ name: 'Category Test' })).then(() => {
      cy.visit('/').get('li').contains('Open').click()
    })
  })

  it('can create a category for a budget', () => {
    cy.contains('Envelopes').click()

    // Grocery Envelope (category Daily Spending)
    cy.getByTitle('Create Envelope').first().click()
    cy.getInputFor('Name').type('Grocery Envelope')
    cy.getAutocompleteFor('Category').type('Daily Spending')
    cy.contains('Create "Daily Spending"').click()
    cy.getInputFor('Note').type(
      'Groceries.{enter}{enter}Usually bought at a supermarket.'
    )
    cy.clickAndWait('Save')

    // Restaurant Envelope (category Daily Spending)
    cy.getByTitle('Create Envelope').first().click()
    cy.getInputFor('Name').type('Restaurants')
    cy.getAutocompleteFor('Category').type('Dail')
    cy.contains('Daily Spending').click()
    cy.clickAndWait('Save')

    // Rent Envelope (category Running Costs)
    cy.getByTitle('Create Envelope').first().click()
    cy.getInputFor('Name').type('Rent')
    cy.getAutocompleteFor('Category').type('Running Costs')
    cy.contains('Create "Running Costs"').click()
    cy.clickAndWait('Save')

    // After saving, the Accordion for the new category should be
    // expanded.
    // We check this, click it to collapse and verify that it collapsed
    //
    // Get the accordion first to ensure it has been loaded
    cy.get('.grow > span').contains('Daily Spending').as('dailySpending')
    cy.get('.grow > span').contains('Running Costs').as('runningCosts')

    cy.contains('Grocery Envelope')
    cy.get('@dailySpending').click()
    cy.contains('Grocery Envelope').should('not.exist')

    // envelopes from other categories are still visible
    cy.contains('Rent')

    cy.getByTitle('Edit Category').first().click()
    cy.contains('Grocery Envelope')
    cy.contains('Restaurants')
    cy.contains('Rent').should('not.exist')

    // edit the envelope again to create a new category
    cy.clickAndWait('Cancel')
    cy.contains('Restaurants').click()
    cy.getAutocompleteFor('Category').clear().type('New Category')
    cy.contains('Create "New Category"').click()
    cy.clickAndWait('Save')
    cy.contains('New Category')
  })

  it('shows an error when trying to save invalid data', () => {
    cy.contains('Envelopes').click()
    cy.getByTitle('Create Envelope').first().click()
    cy.contains('Save').click()
    cy.contains('no Category ID specified')
  })
})
