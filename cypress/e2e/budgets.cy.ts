describe('Budget: Overview', () => {
  it('successfully loads', () => {
    cy.visit('/')
    cy.contains('Budgets')
  })

  it('is shown when no budget is selected', () => {
    cy.visit('/transactions')
    cy.location('pathname').should('eq', '/')
    cy.get('nav').should('not.exist')
  })

  it('can create a new budget', () => {
    cy.getByTitle('Create Budget').should('have.length', 2).first().click()

    cy.getInputFor('Name').type('Shared Household Budget')
    cy.getInputFor('Currency').type('€')
    cy.getInputFor('Note').type("We're all in this together!")

    cy.contains('Save').click()

    cy.get('h1').contains('Shared Household Budget')
    cy.contains('Switch Budget')

    cy.getCookie('budgetId').should('exist')
  })
})

describe('Budget: Switch', () => {
  it('can switch between budgets', () => {
    cy.visit('/')
    cy.getByTitle('Create Budget').first().click()
    cy.getInputFor('Name').type('First Budget')
    cy.contains('Save').click()

    cy.contains('Switch Budget').click()

    cy.getByTitle('Create Budget').first().click()
    cy.getInputFor('Name').type('Second Budget')
    cy.contains('Save').click()

    cy.contains('Switch Budget').click()
    cy.contains('First Budget').click()
    cy.get('h1').contains('First Budget')

    cy.contains('Switch Budget').click()
    cy.contains('Second Budget').click()
    cy.get('h1').contains('Second Budget')
  })
})
