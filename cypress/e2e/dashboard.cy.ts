import { Budget, Envelope } from '../../src/types'
import {
  createBudget,
  createAccount,
  createEnvelope,
  createTransaction,
  createCategory,
} from '../support/setup'

describe('Dashboard', () => {
  beforeEach(() => {
    // prepare & select a budget
    cy.wrap(createBudget({ name: 'Dashboard Test' })).then((budget: Budget) => {
      cy.wrap(budget).as('budget')
      cy.wrap(
        Cypress.Promise.all([
          createCategory({ name: 'First Category' }, budget),
          createCategory({ name: 'Second Category' }, budget),
        ]).then(([firstCategory, secondCategory]) =>
          Cypress.Promise.all([
            createEnvelope(
              { name: 'First Envelope', categoryId: firstCategory.id },
              budget
            ),
            createEnvelope(
              { name: 'Second Envelope', categoryId: firstCategory.id },
              budget
            ),
            createEnvelope(
              { name: 'Third Envelope', categoryId: secondCategory.id },
              budget
            ),
            createEnvelope(
              {
                name: 'Archived Envelope',
                categoryId: firstCategory.id,
                archived: true,
              },
              budget
            ),
          ])
        )
      ).then(([firstEnvelope, secondEnvelope]: Envelope[]) => {
        cy.wrap(firstEnvelope).as('firstEnvelope')
        cy.wrap(secondEnvelope).as('secondEnvelope')
        cy.visit('/').get('li').contains('Open').click()
        cy.awaitLoading()
        cy.getCookie('budgetId').should('exist')
      })
    })
  })

  // Get the current month in YYYY-MM-01 format
  const currentMonth = `${new Date(Date.now())
    .toISOString()
    .substring(0, 7)}-01`

  it('can switch between the months', () => {
    cy.getByTitle('Select Month').first().click()
    cy.get('#month').should('have.value', currentMonth)

    cy.visit('#', { qs: { month: '2020-02' } })
    cy.contains('February 2020')
    cy.contains('Mar')

    cy.contains('Jan').click()
    cy.contains('Dec').click()

    cy.contains('December 2019')
    cy.url().should('include', '?month=2019-12')

    cy.getByTitle('Select Month').first().click()

    cy.get('input#month').type('2022-03-01')
    cy.getByTitle('March 2022').first().click()
    cy.awaitLoading()
    cy.contains('March 2022')
    cy.contains('Feb')
    cy.contains('Apr')
  })

  it('can edit allocations', () => {
    cy.visit('#')
    cy.awaitLoading()

    // set allocation
    cy.get('[aria-label*="Edit Allocation for First Envelope"]')
      .filter(':visible')
      .click()
    cy.getInputFor('Set to amount').type('12.00')
    cy.get('button[type="submit"]').click()
    cy.awaitLoading()

    // First Envelope is an anchor in a table data cell, get the data cell and its parents
    // then get the span
    cy.contains('First Envelope')
      .parent()
      .siblings()
      .find('span')
      .contains('12.00')
    cy.contains('Unallocated funds-12.00')

    // close input without saving
    cy.get('[aria-label*="Edit Allocation for Second Envelope"]')
      .filter(':visible')
      .click()
    cy.getInputFor('Set to amount').type('7.00')
    cy.get('body').click(0, 0) // click outside of the modal to close it without saving or explicitly canceling
    cy.get('input[type=number]').should('not.exist')
    cy.contains('7.00').should('not.exist')

    // reset input
    cy.get('[aria-label*="Edit Allocation for First Envelope"]')
      .filter(':visible')
      .click()
    cy.getInputFor('Add / Subtract amount').type('-42')
    cy.getInputFor('Set to amount').should('have.value', '-30')
    cy.get('button[type="reset"]').click()
    cy.get('input[type=number]').should('not.exist')
    cy.contains('-30.00').should('not.exist')
    cy.contains('First Envelope')
      .parent()
      .siblings()
      .find('span')
      .contains('12.00')

    // display error
    cy.get('[aria-label*="Edit Allocation for First Envelope"]')
      .filter(':visible')
      .click()
    cy.getInputFor('Set to amount').clear()
    cy.get('button[type="submit"]').click()
    cy.contains('Error')
    cy.get('button[type="reset"]').click()

    // select content of allocation input field when focusing it
    cy.get('[aria-label*="Edit Allocation for First Envelope"]')
      .filter(':visible')
      .click()
    cy.getInputFor('Set to amount').clear().type('1337')
    cy.get('button[type="submit"]').click()
    cy.awaitLoading()
    cy.get('[aria-label*="Edit Allocation for First Envelope"]')
      .filter(':visible')
      .click()
    cy.getInputFor('Set to amount').type('12')
    cy.getInputFor('Set to amount').should('have.value', '12')
    cy.get('button[type="submit"]').click()

    // set allocation for second envelope
    cy.get('[aria-label*="Edit Allocation for Second Envelope"]')
      .filter(':visible')
      .click()
    cy.getInputFor('Set to amount').clear().type('-22.00')
    cy.get('button[type="submit"]').click()
    cy.awaitLoading()
    cy.get('input[type=number]').should('not.exist')
    cy.contains('Second Envelope')
      .parent()
      .siblings()
      .find('span')
      .contains('-22.00')

    // set allocation for third envelope
    cy.get('[aria-label*="Edit Allocation for Third Envelope"]')
      .filter(':visible')
      .click()
    cy.getInputFor('Set to amount').type('30.00')
    cy.get('button[type="submit"]').click()
    cy.awaitLoading()
    cy.contains('30.00')
    cy.contains('Unallocated funds-20.00')

    // collapse category
    cy.contains('First Category').click()
    cy.contains('2 Envelopes')
    cy.contains('-10.00')
  })

  // This needs to be a declared function to have a binding for 'this'
  it('links to the envelope filtered transactions', function () {
    cy.wrap(
      Cypress.Promise.all([
        createAccount({ name: 'Internal' }, this.budget),
        createAccount({ name: 'External', external: true }, this.budget),
      ]).then(([internalAccount, externalAccount]) =>
        Cypress.Promise.all([
          createTransaction(
            {
              sourceAccountId: internalAccount.id,
              destinationAccountId: externalAccount.id,
              envelopeId: this.firstEnvelope.id,
              note: 'First Transaction',
              amount: '1',
            },
            this.budget
          ),
          createTransaction(
            {
              sourceAccountId: internalAccount.id,
              destinationAccountId: externalAccount.id,
              envelopeId: this.secondEnvelope.id,
              note: 'Second Transaction',
              amount: '2',
            },
            this.budget
          ),
        ])
      )
    )

    // We need to reload to load everything from the backend, not just the transactions
    cy.reload()
    cy.contains('First Envelope').click()
    cy.awaitLoading()
    cy.contains('Latest Transactions').click()
    cy.awaitLoading()
    cy.contains('First Transaction')
    cy.contains('Second Transaction').should('not.exist')

    cy.visit('/')
    cy.contains('Second Envelope').click()
    cy.awaitLoading()
    cy.contains('Latest Transactions').click()
    cy.awaitLoading()
    cy.contains('Second Transaction')
    cy.contains('First Transaction').should('not.exist')
  })

  it('can quickly allocate funds to all envelopes', () => {
    cy.getByTitle('Select Month').first().click()
    cy.get('#month').should('have.value', currentMonth)
    cy.visit('#', { qs: { month: '2023-04' } })
    cy.awaitLoading()

    // set allocation
    cy.get('[aria-label*="Edit Allocation for First Envelope"]')
      .filter(':visible')
      .click()
    cy.getInputFor('Set to amount').type('12.00')
    cy.get('button[type="submit"]').click()
    cy.awaitLoading()

    cy.visit('#', { qs: { month: '2023-05' } })
    cy.awaitLoading()
    cy.contains('Unallocated funds-12.00')
    cy.contains('Quick Allocation').click()
    cy.contains("Last month's allocation").click()
    cy.contains('Unallocated funds-24.00')
  })

  // This needs to be a declared function to have a binding for 'this'
  it('links to the filtered transaction list', function () {
    cy.wrap(
      Cypress.Promise.all([
        createAccount({ name: 'Internal' }, this.budget),
        createAccount({ name: 'External', external: true }, this.budget),
      ]).then(([internalAccount, externalAccount]) =>
        Cypress.Promise.all([
          createTransaction(
            {
              sourceAccountId: internalAccount.id,
              destinationAccountId: externalAccount.id,
              envelopeId: this.firstEnvelope.id,
              note: 'August Transaction',
              amount: '3',
              date: new Date('2023-08-15').toISOString(),
            },
            this.budget
          ),
          createTransaction(
            {
              sourceAccountId: internalAccount.id,
              destinationAccountId: externalAccount.id,
              envelopeId: this.firstEnvelope.id,
              note: 'September Transaction',
              amount: '1',
              date: new Date('2023-09-15').toISOString(),
            },
            this.budget
          ),
          createTransaction(
            {
              sourceAccountId: internalAccount.id,
              destinationAccountId: externalAccount.id,
              envelopeId: this.firstEnvelope.id,
              note: 'October Transaction',
              amount: '2',
              date: new Date('2023-10-15').toISOString(),
            },
            this.budget
          ),
        ])
      )
    )

    // We need to reload to load everything from the backend, not just the transactions
    cy.reload()
    cy.get('h1').contains('Dashboard Test')
    cy.awaitLoading()

    // We created transactions for August, September and October 2023, visit September to verify
    cy.visit('#', { qs: { month: '2023-09' } })
    cy.contains('First Envelope').closest('tr').contains('4.00').click()
    cy.awaitLoading()

    cy.contains('August Transaction').should('not.exist')
    cy.contains('September Transaction').should('exist')
    cy.contains('October Transaction').should('not.exist')

    cy.contains('From 9/1/2023')
    cy.contains('Until 9/30/2023')
  })
})
