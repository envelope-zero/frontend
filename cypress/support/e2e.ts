import './commands'

beforeEach(() => {
  cy.resetDb()
  cy.visit('/')
})

Cypress.on('uncaught:exception', (err, runnable) => {
  if (
    err.message.includes(
      'ResizeObserver loop completed with undelivered notifications.'
    )
  ) {
    // ignore the error
    return false
  }
})
