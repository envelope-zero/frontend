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
          ])
        )
      ).then(([firstEnvelope, secondEnvelope]: Envelope[]) => {
        cy.wrap(firstEnvelope).as('firstEnvelope')
        cy.wrap(secondEnvelope).as('secondEnvelope')
        cy.visit('/').get('h3').contains('Dashboard Test').click()
        cy.getCookie('budgetId').should('exist')
        cy.awaitLoading()
      })
    })
  })

  it('can switch between the months', () => {
    const currentMonth = new Intl.DateTimeFormat('en', {
      month: 'long',
      year: 'numeric',
    }).format(new Date())

    cy.contains(currentMonth)

    cy.visit('#', { qs: { month: '2020-02' } })
    cy.contains('February 2020')
    cy.contains('Mar')

    cy.contains('Jan').click()
    cy.contains('Dec').click()

    cy.contains('December 2019')
    cy.url().should('include', '?month=2019-12')

    cy.getByTitle('Select Month').click()
    cy.get('input#month').type('2022-03-01')
    cy.getByTitle('March 2022').click()
    cy.awaitLoading()
    cy.contains('March 2022')
    cy.contains('Feb')
    cy.contains('Apr')
  })

  it('can edit allocations', () => {
    cy.visit('#')
    cy.awaitLoading()

    // set allocation
    cy.get('[aria-label*="Edit Allocation for First Envelope"]').click()
    cy.getInputFor('Allocation for First Envelope').type('12.00')
    cy.get('[aria-label="Save"]').click()
    cy.contains('12.00')
    cy.contains('-12.00 Available to budget')

    // close input without saving
    cy.get('[aria-label*="Edit Allocation for Second Envelope"]').click()
    cy.getInputFor('Allocation for Second Envelope').type('7.00')
    cy.get('[aria-label*="Edit Allocation for First Envelope"]').click()
    cy.get('label')
      .contains('Allocation for Second Envelope')
      .should('not.exist')
    cy.contains('7.00').should('not.exist')

    // reset input
    cy.getInputFor('Allocation for First Envelope').type('42.00')
    cy.get('[aria-label="Cancel"]').click()
    cy.get('input').should('not.exist')
    cy.contains('42.00').should('not.exist')
    cy.contains('12.00')

    // set allocation for second envelope
    cy.get('[aria-label*="Edit Allocation for Second Envelope"]').click()
    cy.getInputFor('Allocation for Second Envelope').clear().type('-22.00')
    cy.get('[aria-label="Save"]').click()

    // set allocation for third envelope
    cy.get('[aria-label*="Edit Allocation for Third Envelope"]').click()
    cy.getInputFor('Allocation for Third Envelope').type('30.00')
    cy.get('[aria-label="Save"]').click()
    cy.contains('30.00')
    cy.contains('-20.00 Available to budget')

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
              amount: 1,
            },
            this.budget
          ),
          createTransaction(
            {
              sourceAccountId: internalAccount.id,
              destinationAccountId: externalAccount.id,
              envelopeId: this.secondEnvelope.id,
              note: 'Second Transaction',
              amount: 2,
            },
            this.budget
          ),
        ])
      )
    )

    // We need to reload to load everything from the backend, not just the transactions
    cy.reload()
    cy.clickAndWait('First Envelope')
    cy.contains('First Transaction')
    cy.contains('Second Transaction').should('not.exist')

    cy.visit('/')
    cy.clickAndWait('Second Envelope')
    cy.contains('Second Transaction')
    cy.contains('First Transaction').should('not.exist')
  })
})
