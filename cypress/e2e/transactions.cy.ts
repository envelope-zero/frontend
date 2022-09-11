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

  it('can create a new incoming transaction', () => {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Create Transaction').click()

    cy.getInputFor('Amount').type('13.37')

    cy.getInputFor('Source').type('Best fri')
    cy.contains('Best Friend').click()

    cy.getInputFor('Destination').type('Bank ac')
    cy.contains('Bank account').click()

    cy.getInputFor('Envelope').type('Onl')
    cy.contains('Only one').click()

    cy.clickAndWait('Save')
    cy.contains('Best Friend → Bank account')
    cy.contains('+13.37')
  })

  it('can create a new transfer between internal accounts', () => {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Create Transaction').click()

    cy.getInputFor('Amount').type('100')

    cy.getInputFor('Source').type('Bank ac')
    cy.contains('Bank account').click()

    cy.getInputFor('Destination').type('Ca')
    cy.contains('Cash').click()

    cy.clickAndWait('Save')
    cy.contains('Bank account → Cash')
    cy.contains('±100.00')

    cy.contains('Accounts').click()
    cy.contains('Bank account').click()
    cy.get('h2').contains('Transactions')
    cy.contains('Bank account → Cash')
    cy.contains('-100.00')

    cy.contains('Accounts').click()
    cy.contains('Cash').click()
    cy.get('h2').contains('Transactions')
    cy.contains('Bank account → Cash')
    cy.contains('+100.00')
  })

  it('can create a new account', () => {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Create Transaction').click()

    cy.getInputFor('Amount').type('13')

    cy.getInputFor('Source').type('Bank ac')
    cy.contains('Bank account').click()

    cy.getInputFor('Destination').type('Someone else')
    cy.contains('Create "Someone else"').click()

    cy.getInputFor('Envelope').type('Onl')
    cy.contains('Only one').click()

    cy.getInputFor('Destination').clear().type('New Best Friend')
    cy.contains('Create "New Best Friend"').click()

    cy.clickAndWait('Save')
    cy.contains('Bank account → New Best Friend')
    cy.contains('-13.00')

    cy.contains('Accounts').click()
    cy.contains('Bank account').click()
    cy.get('h2').contains('Transactions')
    cy.contains('Bank account → New Best Friend')
    cy.contains('-13.00')

    cy.contains('Accounts').click()
    cy.contains('External Accounts').click()
    cy.awaitLoading()
    cy.contains('Someone else').should('not.exist')
    cy.contains('New Best Friend').click()
    cy.get('h2').contains('Transactions')
    cy.contains('Bank account → New Best Friend')
    cy.contains('-13.00')
  })
})
