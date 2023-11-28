Cypress.Commands.add('getByTitle', title => cy.get(`[title="${title}"]`))

Cypress.Commands.add('getInputFor', label =>
  cy.contains('label', label).siblings().find('input, textarea, select')
)

// Clicks the element and then tests that it does not exist any more.
// As cypress retries for several seconds to fulfill this condition,
// this effectively works as a „click and wait until the element is gone"
//
// We can easily use this to click the save button and wait for the next
// page to be loaded before we proceed
Cypress.Commands.add('clickAndWait', element => {
  cy.contains(element).click()
  cy.contains(element).should('not.exist')
  cy.awaitLoading()
})

Cypress.Commands.add('awaitLoading', () => {
  // Wait for the loading icon to exist
  // This avoids test errors when the loading
  // icon is taking longer to appear than the
  // test to execute the next action
  cy.get('#loading').should('exist')

  // Wait until loading is done
  cy.get('#loading').should('not.exist')
})

Cypress.Commands.add('resetDb', () => {
  // Delete all resources
  cy.request('DELETE', '/api/v1')
})
