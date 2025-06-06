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
        cy.visit('/').get('li').contains('Open').click()
      })
    })
  })

  it('can import parsed transactions', function () {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Import Transactions').click()
    cy.awaitLoading()

    cy.getAutocompleteFor('Account').type('account')
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
    cy.getAutocompleteFor('Source')
      .should('have.value', 'My Account')
      .should('be.disabled')
    cy.getAutocompleteFor('Destination').should(
      'have.value',
      'Non Existing Account'
    )
    // only result in destination drop down is 'Create "Non Existing Account"'
    cy.getAutocompleteFor('Destination').type('{downArrow}')

    cy.get('label')
      .contains('Destination')
      .siblings('div')
      .children('div, [role="listbox"] > div > div')
      .should('have.length', 1)
      .and('contain', 'Create "Non Existing Account"')
    cy.getAutocompleteFor('Destination').clear().type('EDITED ACCOUNT{enter}')
    cy.getInputFor('Date').should('have.value', '2023-06-20')
    cy.contains('Available From').should('not.exist')

    // move back and forth - edits should be persisted
    cy.getByTitle('Next Transaction').click()
    cy.getInputFor('Note').should(
      'have.value',
      'Transfer from my other account'
    )
    cy.getAutocompleteFor('Destination')
      .should('have.value', 'My Account')
      .should('be.disabled')
    cy.getByTitle('Previous Transaction').click()
    cy.getInputFor('Note').should('have.value', 'MY NOTE')
    cy.getAutocompleteFor('Destination').should('have.value', 'EDITED ACCOUNT')

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
    cy.getAutocompleteFor('Source').should('have.value', 'My Other Account')
    // dropdown results in source should be "My Other Account" & 'Create "My Other Account"'
    cy.getAutocompleteFor('Source').type('{downArrow}')

    cy.get('label')
      .contains('Source')
      .siblings('div')
      .children('div, [role="listbox"]')
      .within(() => {
        cy.get('div, [role="none"]').contains(/^My Other Account$/)
        cy.get('div, [role="option"]').contains('Create "My Other Account"')
      })

    // newly created account is available for selection
    cy.getAutocompleteFor('Source').type('{esc}').clear().type('EDITE')

    // "My Other Account" is still selected, so "Available From" should not be displayed
    cy.contains('Available From').should('not.exist')

    cy.getAutocompleteFor('Destination')
      .should('have.value', 'My Account')
      .should('be.disabled')

    // skip this transaction
    cy.getByTitle('Next Transaction').click({ force: true })

    // there is still only one transaction
    cy.wrap(null)
      .then(() => listTransactions(this.budget))
      .should('have.length', 1)

    // third transaction
    cy.contains('3 of 5')
    cy.getByTitle('Previous Transaction').should('not.be.disabled')
    cy.contains('Available From').should('not.exist')

    // dismiss this transaction
    cy.get('button').contains('Dismiss').click()
    cy.contains('Successfully dismissed')

    // there is still only one transaction
    cy.wrap(null)
      .then(() => listTransactions(this.budget))
      .should('have.length', 1)

    // dismissed transaction is skipped
    cy.contains('4 of 5')
    cy.getByTitle('Previous Transaction').click()
    cy.contains('2 of 5')
    cy.getByTitle('Next Transaction').click()
    cy.contains('4 of 5')

    // import this transaction by pressing enter
    cy.getInputFor('Note').type('{enter}')
    cy.contains('Successfully imported')

    // go to dashboard, then resume import
    cy.contains('Home').click()
    cy.contains('You have an unfinished transaction import in progress.')
    cy.contains('Resume now').click()

    // Now at the last transaction, import this too
    cy.contains('5 of 5')
    cy.getInputFor('Available From').should('have.value', '2023-07-01')
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

    cy.getAutocompleteFor('Account').type('My account{enter}')
    cy.getInputFor('File').selectFile('cypress/fixtures/comdirect.csv')

    cy.clickAndWait('Submit')
    cy.contains('This is a duplicate of an existing transaction')
  })

  it('errors on already parsed file', function () {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Import Transactions').click()
    cy.awaitLoading()

    cy.getAutocompleteFor('Account').type('account')
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
    cy.awaitLoading()

    cy.getAutocompleteFor('Account').type('account')
    cy.contains('External Account').should('not.exist')
    cy.contains('My Other Account')
    cy.contains('My Account').click()

    cy.getInputFor('File').selectFile(
      'cypress/fixtures/transactions-no-parser.csv'
    )

    cy.contains('Submit').click()
    cy.contains('This file can not be parsed.')
  })

  // This is a regression test for "Untitled Account" being displayed as the source/destination account name
  // See https://github.com/envelope-zero/frontend/issues/1763
  it('shows an empty account name if it is unset', function () {
    cy.get('nav').contains('Transactions').click()
    cy.getByTitle('Import Transactions').click()
    cy.awaitLoading()

    cy.getAutocompleteFor('Account').type('account')
    cy.contains('My Account').click()

    cy.getInputFor('File').selectFile(
      'cypress/fixtures/import-untitled-account.csv'
    )

    cy.contains('Submit').click()

    // Verify that the Source account is not "Untitled Account", but empty
    cy.getAutocompleteFor('Source')
      .should('have.value', '')
      .type('External Acc{enter}')
    cy.get('button').contains('Import').click()

    // Verify that the Source account is not "Untitled Account", but empty
    cy.getAutocompleteFor('Destination')
      .should('have.value', '')
      .type('External Acc{enter}')
    cy.get('button').contains('Import').click()

    // Import should be finished
    cy.contains('Import complete')
  })
})
