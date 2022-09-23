import './commands'

beforeEach(() => {
  cy.resetDb()
  cy.visit('/')
})
