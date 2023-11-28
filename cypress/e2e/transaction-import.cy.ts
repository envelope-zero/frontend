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
        cy.wrap(externalAccount).as('externalAccount')
        // select budget
        cy.visit('/').get('h3').contains('My Budget').click()
      })
    })
  })

  it('can import parsed transactions', function () {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Import Transactions').click()

    cy.getInputFor('Account').type('account')
    cy.contains('External Account').should('not.exist')
    cy.contains('My Other Account')
    cy.contains('My Account').click()

    cy.getInputFor('File').selectFile('cypress/fixtures/comdirect.csv')

    cy.clickAndWait('Submit')

    cy.contains('1 of 5')
    cy.getByTitle('Previous Transaction').should('be.disabled')

    // first transaction - checked prefilled values
    cy.getInputFor('Note').should('have.value', 'Text').clear().type('MY NOTE')
    cy.getInputFor('Amount').should('have.value', '84.76')
    cy.getInputFor('Source')
      .should('have.value', 'My Account')
      .should('be.disabled')
    cy.getInputFor('Destination').should('have.value', 'Non Existing Account')
    // only result in destination drop down is 'Create "Non Existing Account"'
    cy.getInputFor('Destination').type('{downArrow}')
    cy.get('ul').find('li').should('have.length', 1)
    cy.get('li').contains('Create "Non Existing Account"')
    cy.getInputFor('Destination').clear().type('EDITED ACCOUNT{enter}')
    cy.getInputFor('Date').should('have.value', '2023-06-20')
    cy.contains('Available From').should('not.exist')

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
    cy.contains('Successfully imported')

    // account has been created
    cy.wrap(null)
      .then(() =>
        listAccounts(this.budget).then((accounts: Account[]) =>
          Cypress._.map(accounts, 'name')
        )
      )
      .should('include', 'EDITED ACCOUNT')

    // transaction has been created
    cy.wrap(null)
      .then(() =>
        listTransactions(this.budget).then((transactions: Transaction[]) =>
          Cypress._.map(transactions, 'note')
        )
      )
      .should('have.length', 1)
      .and('include', 'MY NOTE')

    // second transaction
    cy.contains('2 of 5')
    cy.getByTitle('Previous Transaction').should('be.disabled')
    cy.getInputFor('Source').should('have.value', 'My Other Account')
    // dropdown results in source should be "My Other Account" & 'Create "My Other Account"'
    cy.getInputFor('Source').type('{downArrow}')
    cy.get('ul').find('li').should('have.length', 2)
    cy.get('li').contains(/^My Other Account$/) // match "My Other Account" exactly
    cy.get('li').contains('Create "My Other Account"')
    // newly created account is available for selection
    cy.getInputFor('Source').clear().type('EDITE')
    cy.contains('EDITED ACCOUNT')
    cy.contains('Available From').should('not.exist')

    cy.getInputFor('Destination')
      .should('have.value', 'My Account')
      .should('be.disabled')

    // skip this transaction
    cy.getByTitle('Next Transaction').click()

    // there is still only one transaction
    cy.wrap(null)
      .then(() => listTransactions(this.budget))
      .should('have.length', 1)

    // third transaction
    cy.contains('3 of 5')
    cy.getByTitle('Previous Transaction').should('not.be.disabled')
    cy.contains('Available From').should('not.exist')

    // delete this transaction
    cy.get('button').contains('Delete').click()
    cy.contains('Successfully deleted')

    // there is still only one transaction
    cy.wrap(null)
      .then(() => listTransactions(this.budget))
      .should('have.length', 1)

    // deleted transaction is skipped
    cy.contains('4 of 5')
    cy.getByTitle('Previous Transaction').click()
    cy.contains('2 of 5')
    cy.getByTitle('Next Transaction').click()
    cy.contains('4 of 5')

    // import this transaction by pressing enter
    cy.getInputFor('Note').type('{enter}')
    cy.contains('Successfully imported')

    // Now at the last transaction, import this too
    cy.getInputFor('Available From').should('have.value', '2023-06')
    cy.get('button').contains('Import').click()

    // Now back at the second transactions since we skipped it
    cy.contains('2 of 5')
    cy.getByTitle('Next Transaction').should('be.disabled')

    // now there are three transactions
    cy.wrap(null)
      .then(() => listTransactions(this.budget))
      .should('have.length', 3)

    // two transactions connected to existing account "External Account"
    cy.wrap(null)
      .then(() => listTransactions(this.externalAccount))
      .should('have.length', 2)

    // import the last remaining transaction
    cy.get('button').contains('Import').click()
    cy.contains('Import complete')

    // upload the same file again – duplicate detection
    cy.getByTitle('Import Transactions').click()
    cy.awaitLoading()

    cy.getInputFor('Account').type('My account{enter}')
    cy.getInputFor('File').selectFile('cypress/fixtures/comdirect.csv')

    cy.clickAndWait('Submit')
    cy.contains('This is a duplicate of an existing transaction')
  })

  it('errors on already parsed file', function () {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Import Transactions').click()

    cy.getInputFor('Account').type('account')
    cy.contains('External Account').should('not.exist')
    cy.contains('My Other Account')
    cy.contains('My Account').click()

    cy.getInputFor('File').selectFile('cypress/fixtures/comdirect-ynap.csv')

    cy.contains('Submit').click()
    cy.contains(
      'This file has already been parsed. Please upload the CSV file from your bank.'
    )
  })

  it('errors on an unparseable file', function () {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Import Transactions').click()

    cy.getInputFor('Account').type('account')
    cy.contains('External Account').should('not.exist')
    cy.contains('My Other Account')
    cy.contains('My Account').click()

    cy.getInputFor('File').selectFile(
      'cypress/fixtures/transactions-no-parser.csv'
    )

    cy.contains('Submit').click()
    cy.contains('This file can not be parsed.')
  })
})
