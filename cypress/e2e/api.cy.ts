describe('API: Load from Server', () => {
  it('loads the API from the server instead of redirecting to /', () => {
    cy.request({
      url: '/api',
      headers: {
        accept: 'application/json',
      },
    }).then(response => {
      expect(response.status).to.eq(200)

      // The body should only have one key: links
      expect(response.body).to.have.keys(['links'])

      // The links object can have any key, but must contain docs, v1 and version
      expect(response.body.links).to.contain.keys(['docs', 'v1', 'version'])
    })
  })
})
