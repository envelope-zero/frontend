import { createBudget, createAccount, createEnvelope } from '../support/setup'
import { Budget } from '../../src/types'
import { dateFromIsoString } from '../../src/lib/dates'

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

    // "Latest Transactions" per Account

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

    // "Latest Transactions" per Envelope

    cy.contains('Envelopes').click()
    cy.contains('Only one').click()
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

  it('can duplicate an existing transaction', () => {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Create Transaction').click()

    cy.getInputFor('Note').type('Burgers')
    cy.getInputFor('Amount').type('5')
    cy.getInputFor('Date').type('2012-12-21')
    cy.getInputFor('Source').type('Cas{enter}') // {enter} selects the first result in the dropdown
    cy.getInputFor('Destination').type('Best fri{enter}') // {enter} selects the first result in the dropdown
    cy.getInputFor('Envelope').type('Onl')
    cy.contains('Only one').click() // TODO: should be able to do this with '{enter}', see #322

    cy.clickAndWait('Save')
    cy.contains('Burgers').click()
    cy.contains('Repeat Transaction').click()

    cy.getInputFor('Note').should('have.value', 'Burgers')
    cy.getInputFor('Amount').should('have.value', '5')
    cy.getInputFor('Date').should(
      'have.value',
      dateFromIsoString(new Date().toISOString())
    )
    cy.getInputFor('Source').should('have.value', 'Cash')
    cy.getInputFor('Destination').should('have.value', 'Best Friend')
    cy.getInputFor('Envelope').should('have.value', 'Only one')

    cy.getInputFor('Amount').clear().type('5.5')

    cy.clickAndWait('Save')

    cy.get('p:contains(Burgers)').should('have.length', 2)
    cy.contains('-5.00')
    cy.contains('-5.50')
  })
})
