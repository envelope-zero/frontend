import { createBudget } from '../support/setup'

describe('Budget: Overview', () => {
  it('successfully loads', () => {
    cy.visit('/')
    cy.contains('Budgets')
  })

  it('is shown when no budget is selected', () => {
    cy.visit('/transactions')
    cy.location('pathname').should('eq', '/')
    cy.get('nav').should('not.exist')
  })

  it('can create a new budget', () => {
    cy.getByTitle('Create Budget').should('have.length', 2).first().click()

    cy.getInputFor('Name').type('Shared Household Budget')
    cy.getInputFor('Currency').type('€')
    cy.getInputFor('Note').type("We're all in this together!")

    cy.clickAndWait('Save')

    cy.get('h1').contains('Shared Household Budget')
    cy.contains('Switch Budget')

    cy.getCookie('budgetId').should('exist')
  })
})

describe('Budget: Switch', () => {
  it('can switch between budgets', () => {
    cy.visit('/budgets/new')
    cy.getInputFor('Name').type('First Budget')
    cy.contains('Save').click()

    cy.visit('/budgets/new')
    cy.getInputFor('Name').type('Second Budget')
    cy.contains('Save').click()

    cy.contains('Switch Budget').click()
    cy.get('h3').contains('First Budget').click()
    cy.get('h1').contains('First Budget')

    cy.contains('Switch Budget').click()
    cy.get('h3').contains('Second Budget').click()
    cy.get('h1').contains('Second Budget')
  })

  it('is shown if the selected budget was deleted in the background', () => {
    cy.wrap(createBudget({ name: 'Might delete later' }))
    cy.visit('/')
    cy.contains('Might delete later').click()
    cy.resetDb()
    cy.visit('/')
    cy.awaitLoading() // loading the selected budget -> fail
    cy.awaitLoading() // loading all existing budgets (for budget switch)
    cy.contains('No budgets have been created yet. Create a new one below!')
  })
})
