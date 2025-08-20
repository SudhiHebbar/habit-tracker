/// <reference types="cypress" />

// Custom command to create a test tracker
Cypress.Commands.add('createTestTracker', (name = 'Test Tracker', description = 'Created for testing') => {
  cy.contains('Dashboard').click()
  cy.contains('Create New Tracker').click()
  cy.get('input[name="name"]').type(name)
  cy.get('textarea[name="description"]').type(description)
  cy.contains('Create Tracker').click()
  cy.contains(name).should('be.visible')
})

// Custom command to create a test habit
Cypress.Commands.add('createTestHabit', (trackerName = 'Test Tracker', habitName = 'Test Habit') => {
  cy.contains('Habits').click()
  
  // Select tracker if dropdown exists
  cy.get('body').then(($body) => {
    if ($body.find('select[data-testid="tracker-select"]').length > 0) {
      cy.get('select[data-testid="tracker-select"]').select(trackerName)
    }
  })
  
  // Create habit
  cy.contains('Add Habit').click()
  cy.get('input[name="name"]').type(habitName)
  cy.get('textarea[name="description"]').type(`${habitName} description`)
  cy.contains('Create Habit').click()
  cy.contains(habitName).should('be.visible')
})

// Custom command to simulate user login (when authentication is implemented)
Cypress.Commands.add('loginAsTestUser', () => {
  // This is a placeholder for when authentication is implemented
  // For now, we'll just visit the home page
  cy.visit('/')
  cy.contains('Habit Tracker').should('be.visible')
})

// Custom command to cleanup test data
Cypress.Commands.add('cleanupTestData', () => {
  // This could interact with test database cleanup endpoints
  // For now, it's a placeholder
  cy.task('clearTestData')
})

// Custom command for waiting for API calls
Cypress.Commands.add('waitForApiCall', (alias: string, timeout = 10000) => {
  cy.wait(alias, { timeout })
})

// Custom command for form validation testing
Cypress.Commands.add('testFormValidation', (fieldSelector: string, invalidValue: string, expectedError: string) => {
  cy.get(fieldSelector).clear().type(invalidValue)
  cy.get('form').submit()
  cy.contains(expectedError).should('be.visible')
})

// Custom command for checking loading states
Cypress.Commands.add('checkLoadingState', (loadingText: string) => {
  cy.contains(loadingText).should('be.visible')
  cy.get('input, button, select').should('be.disabled')
})

// Custom command for accessibility testing
Cypress.Commands.add('checkA11y', () => {
  // Basic accessibility checks
  cy.get('button').should('have.attr', 'type')
  cy.get('input').should('have.attr', 'type')
  cy.get('form').should('exist')
})

// Custom command for responsive design testing
Cypress.Commands.add('testResponsiveDesign', () => {
  const viewports = [
    { width: 320, height: 568 }, // Mobile
    { width: 768, height: 1024 }, // Tablet
    { width: 1280, height: 720 }  // Desktop
  ]
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height)
    cy.get('body').should('be.visible')
    // Add more responsive checks as needed
  })
})

// Extend Cypress interface for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      waitForApiCall(alias: string, timeout?: number): Chainable<void>
      testFormValidation(fieldSelector: string, invalidValue: string, expectedError: string): Chainable<void>
      checkLoadingState(loadingText: string): Chainable<void>
      checkA11y(): Chainable<void>
      testResponsiveDesign(): Chainable<void>
    }
  }
}