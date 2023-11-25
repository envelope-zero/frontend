import { defineConfig } from 'cypress'
import { cloudPlugin } from 'cypress-cloud/plugin'
export default defineConfig({
  e2e: {
    video: true,
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    async setupNodeEvents(on, config) {
      const result = await cloudPlugin(on, config)
      return result
    },
  },
})
