import { createBudget } from '../support/setup'

describe('Dashboard', () => {
  beforeEach(() => {
    // prepare & select a budget
    cy.wrap(createBudget({ name: 'Dashboard Test' })).then(() => {
      cy.visit('/').get('h3').contains('Dashboard Test').click()
      cy.getCookie('budgetId').should('exist')
    })
  })

  it('can switch between the months', () => {
    const currentMonth = new Intl.DateTimeFormat('en', {
      month: 'long',
      year: 'numeric',
    }).format(new Date())

    cy.contains(currentMonth)

    cy.visit('#', { qs: { month: '02/2020' } })
    cy.contains('February 2020')
    cy.contains('Mar')

    cy.contains('Jan').click()
    cy.contains('Dec').click()

    cy.contains('December 2019')
    cy.url().should('include', '?month=12/2019')
  })
})
