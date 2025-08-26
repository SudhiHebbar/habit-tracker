// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
Cypress.on('window:before:load', win => {
  // Stub console methods to reduce noise in tests
  cy.stub(win.console, 'log').as('consoleLog');
  cy.stub(win.console, 'error').as('consoleError');
  cy.stub(win.console, 'warn').as('consoleWarn');
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // Add specific error handling logic if needed
  if (err.message.includes('Network Error') || err.message.includes('fetch')) {
    return false;
  }

  // Let other errors fail the test
  return true;
});

// Add global before/after hooks
beforeEach(() => {
  // Clear local storage and session storage
  cy.clearLocalStorage();
  cy.clearCookies();

  // Set viewport size
  cy.viewport(1280, 720);
});

// Custom commands for common test scenarios
declare global {
  namespace Cypress {
    interface Chainable {
      createTestTracker(name?: string, description?: string): Chainable<void>;
      createTestHabit(trackerName?: string, habitName?: string): Chainable<void>;
      loginAsTestUser(): Chainable<void>;
      cleanupTestData(): Chainable<void>;
    }
  }
}
