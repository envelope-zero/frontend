import { Budget } from '../../src/types'
import { createBudget, createEnvelope } from '../support/setup'

describe('Dashboard', () => {
  beforeEach(() => {
    // prepare & select a budget
    cy.wrap(createBudget({ name: 'Dashboard Test' })).then((budget: Budget) => {
      cy.wrap(
        Cypress.Promise.all([
          createEnvelope({ name: 'First Envelope' }, budget),
          createEnvelope({ name: 'Second Envelope' }, budget),
        ])
      ).then(() => {
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
    cy.awaitLoading()
    cy.contains('February 2020')
    cy.contains('Mar')

    cy.contains('Jan').click()
    cy.contains('Dec').click()

    cy.contains('December 2019')
    cy.url().should('include', '?month=2019-12')
  })

  it('can edit allocations', () => {
    cy.visit('#')
    cy.awaitLoading()

    // set allocation
    cy.get('[aria-label*="Edit Allocation for First Envelope"]').click()
    cy.getInputFor('Allocation for First Envelope').type('12.00')
    cy.get('[aria-label="Save"]').click()
    cy.contains('+12.00')
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
  })
})
