Cypress.Commands.add('getByTitle', title => cy.get(`[title="${title}"]`))

Cypress.Commands.add('getInputFor', label =>
  cy.get('label').contains(label).siblings().find('input, textarea, select')
)

Cypress.Commands.add('resetDb', () => {
  // TODO
})
