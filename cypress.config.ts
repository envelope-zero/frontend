import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: 'uc2vus', // Cypress Cloud config
  video: true,
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
  },
  viewportWidth: 1920, // use lg-* layout
  viewportHeight: 1280,
})
