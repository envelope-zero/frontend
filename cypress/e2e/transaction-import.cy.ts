import { Account, Budget, Transaction } from '../../src/types'
import {
  createAccount,
  createBudget,
  listAccounts,
  listTransactions,
} from '../support/setup'

describe('Transaction Import', () => {
  beforeEach(() => {
    cy.wrap(createBudget({ name: 'My Budget' })).then((budget: Budget) => {
      cy.wrap(budget).as('budget')

      cy.wrap(
        Cypress.Promise.all([
          createAccount({ name: 'My Account', external: false }, budget),
          createAccount({ name: 'My Other Account', external: false }, budget),
          createAccount({ name: 'External Account', external: true }, budget),
        ])
      ).then(([ownAccount, otherOwnAccount, externalAccount]: Account[]) => {
        // select budget
        cy.visit('/').get('h3').contains('My Budget').click()
      })
    })
  })

  it('can import parsed transactions', function () {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Import Transactions').click()
    cy.awaitLoading()

    cy.getInputFor('Account').type('account')
    cy.contains('External Account').should('not.exist')
    cy.contains('My Other Account')
    cy.contains('My Account').click()

    cy.getInputFor('File').selectFile(
      'cypress/fixtures/transactions-parsed.csv'
    )

    cy.clickAndWait('Submit')

    cy.contains('1 of 4')
    cy.getByTitle('Previous Transaction').should('be.disabled')

    // first transaction - checked prefilled values
    cy.getInputFor('Note').should('have.value', 'Text').clear().type('MY NOTE')
    cy.getInputFor('Amount').should('have.value', '84.76')
    cy.getInputFor('Source')
      .should('have.value', 'My Account')
      .should('be.disabled')
    cy.getInputFor('Destination').should('have.value', 'Non Existing Account')
    // TODO: and only result in destination drop down is 'Create "Non Existing Account"'
    cy.getInputFor('Destination').clear().type('EDITED ACCOUNT{enter}')
    cy.getInputFor('Date').should('have.value', '2023-06-20')

    // move back and forth - edits should be persisted
    cy.getByTitle('Next Transaction').click()
    cy.getInputFor('Note').should(
      'have.value',
      'Transfer from my other account'
    )
    cy.getInputFor('Destination')
      .should('have.value', 'My Account')
      .should('be.disabled')
    cy.getByTitle('Previous Transaction').click()
    cy.getInputFor('Note').should('have.value', 'MY NOTE')
    cy.getInputFor('Destination').should('have.value', 'EDITED ACCOUNT')

    // import this transaction
    cy.get('button').contains('Import').click()

    // account "EDITED ACCOUNT" has been created
    cy.wrap(listAccounts(this.budget))
      .then((accounts: Account[]) => Cypress._.map(accounts, 'name'))
      .should('include', 'EDITED ACCOUNT')

    // transaction has been created
    cy.wrap(listTransactions(this.budget))
      .then((transactions: Transaction[]) =>
        Cypress._.map(transactions, 'note')
      )
      .should('have.length', 1)
      .and('include', 'MY NOTE')

    // second transaction
    cy.contains('2 of 4')
    cy.getByTitle('Previous Transaction').should('be.disabled')
    cy.getInputFor('Source').should('have.value', 'My Other Account')
    // TODO: dropdown results in source should be "My Other Account" & 'Create "My Other Account"'
    cy.getInputFor('Destination')
      .should('have.value', 'My Account')
      .should('be.disabled')

    // skip this transaction
    cy.getByTitle('Next Transaction').click()

    // there is still only one transaction
    cy.wrap(listTransactions(this.budget))
      .then((transactions: Transaction[]) =>
        Cypress._.map(transactions, 'note')
      )
      .should('have.length', 1)

    // third transaction
    cy.contains('3 of 4')
    cy.getByTitle('Previous Transaction').should('not.be.disabled')

    // delete this transaction
    cy.get('button').contains('Delete').click()

    // there is still only one transaction
    cy.wrap(listTransactions(this.budget))
      .then((transactions: Transaction[]) =>
        Cypress._.map(transactions, 'note')
      )
      .should('have.length', 1)

    // deleted transaction is skipped
    cy.contains('4 of 4')
    cy.getByTitle('Previous Transaction').click()
    cy.contains('2 of 4')
    cy.getByTitle('Next Transaction').click()
    cy.contains('4 of 4')

    // import this transaction
    cy.get('button').contains('Import').click()
    cy.contains('2 of 4')
    cy.getByTitle('Next Transaction').should('be.disabled')

    // now there are two transactions
    cy.wrap(listTransactions(this.budget))
      .then((transactions: Transaction[]) =>
        Cypress._.map(transactions, 'note')
      )
      .should('have.length', 2)
  })
})
