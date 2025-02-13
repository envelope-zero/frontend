import { createAccount, createBudget } from '../support/setup'

describe('Match Rule: invalid rule', () => {
  beforeEach(() => {
    // prepare & select a budget
    cy.wrap(createBudget({ name: 'Invalid Match Rule Test' })).then(budget => {
      cy.wrap(budget).as('budget')
      cy.visit('/').get('li').contains('Open').click()
      cy.contains('Settings').click()
      cy.getByTitle('Edit match rules').first().click()
      cy.awaitLoading()
    })
  })

  it('displays an error for an invalid rule', () => {
    cy.getByTitle('Add match rule').first().click()
    cy.getInputFor('Match').first().type('Some string')
    cy.getByTitle('Save').first().click()

    cy.contains(
      'The rule with match "Some string" and account "" is invalid. Both match and account need to be set.'
    )
  })
})

describe('Match Rule: Creation and Deletion', () => {
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

    cy.getByTitle('Save').first().click()
    cy.contains('Changes saved successfully')
      .parent()
      .siblings()
      .get('[title=Close]')
      .click()

    // Delete the first matchRule and then check that only one exists still
    cy.get('[title=Delete]').first().click({ force: true })
    cy.get('[name=match]').should('have.length', 1)

    // FIXME: If we don't have this, the "Changes saved" banner does not appear again
    // I think that has to do with the transition, but not sure.
    // Needs to be fixed before merging this or in a follow-up.
    cy.wait(3000)

    cy.getByTitle('Save').first().click()
    cy.contains('Changes saved successfully')
      .parent()
      .siblings()
      .get('[title=Close]')
      .click()

    // Reload the page to verify that the deletion has been carried out against the backend
    cy.reload()
    cy.get('#loading').should('exist')
    cy.awaitLoading()

    // Verify that only one match rule exists. This means the deletion was successful in the backend
    cy.get('[name=match]').should('have.length', 1)

    // Verify that correct match rule still exists
    cy.getInputFor('Match').should('have.value', 'Restaurant*')
  })
})
