import { createBudget } from '../support/setup'

describe('Settings', () => {
  beforeEach(() => {
    // prepare & select a budget
    cy.wrap(createBudget({ name: 'Settings Test' })).then(budget => {
      cy.wrap(budget).as('budget')
      cy.visit('/').get('li').contains('Open').click()
      cy.get('a').contains('Settings').click()
      cy.awaitLoading()
    })
  })

  it('displays the discard prompt when navigating to match rules', () => {
    cy.getInputFor('Note').type(
      "This project is anti fascist. Don't like it? Then piss off, we don't like you either."
    )
    cy.getByTitle('Edit match rules').click()

    cy.contains('Discard unsaved changes?')
  })
})
