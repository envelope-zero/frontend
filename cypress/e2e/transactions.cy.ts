import { createBudget, createAccount, createEnvelope } from '../support/setup'
import { Budget } from '../../src/types'

describe('Transaction: Creation', () => {
  beforeEach(() => {
    // prepare a budget with two internal & one external accounts
    cy.wrap(createBudget({ name: 'Transactions Test' })).then(
      (budget: Budget) =>
        cy
          .wrap(
            Cypress.Promise.all([
              createAccount({ name: 'Bank account', external: false }, budget),
              createAccount({ name: 'Cash', external: false }, budget),
              createAccount({ name: 'Best Friend', external: true }, budget),
              createEnvelope({ name: 'Only one' }, budget),
            ])
          )
          .then(() =>
            // select budget
            cy.visit('/').get('h3').contains('Transactions Test').click()
          )
    )
  })

  it('can create a new outgoing transaction', () => {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Create Transaction').click()

    cy.getInputFor('Note').type('Birthday Present')
    cy.getInputFor('Amount').type('42')

    cy.getInputFor('Source').type('Bank ac')
    cy.contains('Bank account').click()

    cy.getInputFor('Destination').type('Best fri')
    cy.contains('Best Friend').click()

    cy.getInputFor('Envelope').type('Onl')
    cy.contains('Only one').click()

    cy.clickAndWait('Save')
    cy.contains('Birthday Present (Bank account → Best Friend)')
    cy.contains('-42.00')

    cy.contains('Accounts').click()
    cy.contains('Bank account').click()
    cy.get('h2').contains('Transactions')
    cy.contains('Birthday Present (Bank account → Best Friend)')
    cy.contains('-42.00')

    cy.contains('Accounts').click()
    cy.contains('External Accounts').click()
    cy.contains('Best Friend').click()
    cy.get('h2').contains('Transactions')
    cy.contains('Birthday Present (Bank account → Best Friend)')
    cy.contains('-42.00')
  })

  it('can create a new incoming transaction', () => {})

  it('can create a new transfer between internal accounts', () => {})

  it('can create a new account', () => {})
})
