// Import necessary Cypress and Synpress modules
import { configureSynpressForMetaMask } from '@synthetixio/synpress/cypress'
import { defineConfig } from 'cypress'

// Define Cypress configuration
export default defineConfig({
	chromeWebSecurity: true,
	defaultCommandTimeout: 60000, // 60 seconds for commands
	pageLoadTimeout: 120000, // 120 seconds for page loads
	e2e: {
		baseUrl: 'http://localhost:5173',
		specPattern: 'src/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
		supportFile: 'src/cypress/support/e2e.{js,jsx,ts,tsx}',
		testIsolation: false,
		defaultCommandTimeout: 60000, // 60 seconds for e2e commands
		pageLoadTimeout: 120000, // 120 seconds for e2e page loads
		async setupNodeEvents(on, config) {
			// Configure Synpress with extended timeout options
			const synpressConfig = {
				...config,
				// Try to pass timeout configuration
				timeout: 120000, // 2 minutes
				metamaskTimeout: 120000,
				walletImportTimeout: 120000,
				// MetaMask extension configuration
				metamaskExtensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
				metamaskExtensionUrl: 'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/popup.html'
			}
			return configureSynpressForMetaMask(on, synpressConfig)
		},
	},
})
