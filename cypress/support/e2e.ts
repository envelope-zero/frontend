import './commands'
import 'cypress-cloud/support'

beforeEach(() => {
  cy.resetDb()
  cy.visit('/')
})
