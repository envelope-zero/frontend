import { createBudget } from '../support/setup'

describe('Account: Creation', () => {
  beforeEach(() => {
    // prepare & select a budget
    cy.wrap(createBudget({ name: 'Account Test' })).then(() => {
      cy.visit('/').get('h3').contains('Account Test').click()
    })
  })

  it('can create an internal account for a budget', () => {
    cy.contains('Accounts').click()
    cy.getByTitle('Create Account').first().click()

    cy.getInputFor('Name').type('Cash Test Account')
    cy.getInputFor('On Budget').click({ force: true })
    cy.getInputFor('Initial Balance').type('250.75')
    cy.getInputFor('Date of Initial Balance').type('2023-03-17')
    cy.getInputFor('Note').type('Are we testing the wallet now?')

    cy.clickAndWait('Save')
    cy.get('h3').contains('Cash Test Account')

    cy.contains('External Accounts').click()
    cy.contains('Cash Test Account').should('not.exist')
  })

  it('can create an external account for a budget', () => {
    cy.contains('Accounts').click()
    cy.contains('External Accounts').click()
    cy.getByTitle('Create Account').click()

    cy.getInputFor('Name').type('Cash Test Account')
    cy.contains('On Budget').should('not.exist')
    cy.getInputFor('Note').type('Are we testing the wallet now?')

    cy.clickAndWait('Save')
    cy.contains('Cash Test Account')

    cy.contains('Own Accounts').click()
    cy.contains('Cash Test Account').should('not.exist')
  })
})
