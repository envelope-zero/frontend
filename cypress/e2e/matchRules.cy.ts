import { createAccount, createBudget } from '../support/setup'

describe('Account: Creation', () => {
  beforeEach(() => {
    // prepare & select a budget
    cy.wrap(createBudget({ name: 'Match Rule Test' })).then(budget => {
      cy.wrap(budget).as('budget')
      cy.visit('/').get('li').contains('Open').click()
    })
  })

  it('can edit match rules', function () {
    cy.wrap(
      Cypress.Promise.all([
        createAccount(
          { name: 'The Grocery Store', external: true },
          this.budget
        ),
        createAccount(
          { name: 'My Favorite Restaurant', external: true },
          this.budget
        ),
      ])
    )

    cy.contains('Settings').click()
    cy.getByTitle('Edit match rules').first().click()
    cy.awaitLoading()

    cy.getByTitle('Add match rule').first().click()
    cy.getInputFor('Match').first().type('Restaurant*')
    cy.getAutocompleteFor('Account').first().type('My Favorite')
    cy.contains('My Favorite Rest').click()

    cy.getByTitle('Add match rule').first().click()
    cy.getInputFor('Match').first().type('Groceries*')
    cy.getAutocompleteFor('Account').first().type('Grocery')
    cy.contains('The Grocery').click()

    cy.getByTitle('Save').click()
    cy.contains('Changes saved successfully')

    // FIXME: Does not click/delete yet
    cy.contains('Delete').first().click({ force: true })
    cy.contains('Groceries*').should('not.exist')

    cy.getByTitle('Save').click()
    cy.contains('Changes saved successfully')

    cy.reload()
    // We need to wait for a second so that the awaitLoading can actually
    // see the loading spinner and wait for it to disappear
    cy.wait(1000)
    cy.awaitLoading()

    // Verify that only one match rule exists
    cy.getInputFor('Match').should('have.length', 1)

    // Verify that correct match rule still exists
    cy.getInputFor('Match').first().should('have.value', 'Restaurant*')
  })
})
