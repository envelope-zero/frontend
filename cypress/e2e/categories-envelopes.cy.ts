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

    // Grocery Envelope (category Daily Spending)
    cy.getByTitle('Create Envelope').first().click()
    cy.getInputFor('Name').type('Grocery Envelope')
    cy.getInputFor('Category').type('Daily Spending')
    cy.contains('Create "Daily Spending"').click()
    cy.getInputFor('Note').type(
      'Groceries.{enter}{enter}Usually bought at a supermarket.'
    )
    cy.clickAndWait('Save')

    // Restaurant Envelope (category Daily Spending)
    cy.getByTitle('Create Envelope').first().click()
    cy.getInputFor('Name').type('Restaurants')
    cy.getInputFor('Category').type('Dail')
    cy.contains('Daily Spending').click()
    cy.clickAndWait('Save')

    // Rent Envelope (category Running Costs)
    cy.getByTitle('Create Envelope').first().click()
    cy.getInputFor('Name').type('Rent')
    cy.getInputFor('Category').type('Running Costs')
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

    cy.getByTitle('Edit category').first().click()
    cy.contains('Grocery Envelope')
    cy.contains('Restaurants')
    cy.contains('Rent').should('not.exist')
  })

  it('shows an error when trying to save invalid data', () => {
    cy.contains('Envelopes').click()
    cy.getByTitle('Create Envelope').first().click()
    cy.contains('Save').click()
    cy.contains('No Category ID specified')
  })
})
