describe('The Budget Overview', () => {
  it('successfully loads', () => {
    cy.visit('/')
    cy.contains('Budgets')
  })

  it('allows creation of new budgets', () => {
    cy.get('[title="Create Budget"]').click()

    cy.contains('Name')

    cy.get('input#name').type('Cypress Budget')
    cy.get('input#currency').type('€')
    cy.get('textarea#note').type(
      'This is a testing budget.{enter}{enter}Automate all the things!'
    )

    cy.contains('Save').click()
  })
})
