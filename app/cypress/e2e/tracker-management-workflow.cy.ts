/// <reference types="cypress" />

describe('Tracker Management Workflow', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');
    
    // Ensure we're on the home page
    cy.contains('Habit Tracker').should('be.visible');
  });

  it('should complete the full tracker creation workflow', () => {
    // Step 1: Navigate to Dashboard
    cy.contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    
    // Step 2: Click Create New Tracker button
    cy.contains('Create New Tracker').click();
    
    // Step 3: Verify modal is open
    cy.contains('Create New Tracker').should('be.visible');
    cy.get('input[name="name"]').should('be.visible');
    cy.get('textarea[name="description"]').should('be.visible');
    
    // Step 4: Fill out tracker creation form
    cy.get('input[name="name"]').type('E2E Fitness Tracker');
    cy.get('textarea[name="description"]').type('Track all fitness-related habits and activities');
    
    // Step 5: Submit the form
    cy.contains('Create Tracker').click();
    
    // Step 6: Verify the tracker was created
    cy.contains('E2E Fitness Tracker').should('be.visible');
    cy.contains('Track all fitness-related habits and activities').should('be.visible');
    cy.get('[data-testid="tracker-card"]').should('contain', 'E2E Fitness Tracker');
  });

  it('should validate required fields in tracker creation', () => {
    // Navigate to dashboard and open create modal
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    
    // Try to submit without required fields
    cy.contains('Create Tracker').click();
    
    // Should show validation error
    cy.contains('Tracker name is required').should('be.visible');
    
    // Add only the name
    cy.get('input[name="name"]').type('Valid Tracker Name');
    
    // Error should disappear
    cy.contains('Tracker name is required').should('not.exist');
    
    // Should be able to submit now
    cy.contains('Create Tracker').click();
    cy.contains('Valid Tracker Name').should('be.visible');
  });

  it('should validate field length constraints', () => {
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    
    // Test name too long (over 100 characters)
    const longName = 'A'.repeat(101);
    cy.get('input[name="name"]').type(longName);
    cy.contains('Create Tracker').click();
    cy.contains('name must be between 1 and 100 characters').should('be.visible');
    
    // Fix the name
    cy.get('input[name="name"]').clear().type('Valid Name');
    
    // Test description too long (over 500 characters)
    const longDescription = 'A'.repeat(501);
    cy.get('textarea[name="description"]').type(longDescription);
    cy.contains('Create Tracker').click();
    cy.contains('description must be less than 500 characters').should('be.visible');
  });

  it('should prevent duplicate tracker names', () => {
    cy.contains('Dashboard').click();
    
    // Create first tracker
    cy.contains('Create New Tracker').click();
    cy.get('input[name="name"]').type('Duplicate Name Test');
    cy.contains('Create Tracker').click();
    cy.contains('Duplicate Name Test').should('be.visible');
    
    // Try to create another with same name
    cy.contains('Create New Tracker').click();
    cy.get('input[name="name"]').type('Duplicate Name Test');
    cy.contains('Create Tracker').click();
    
    // Should show error
    cy.contains('already exists').should('be.visible');
  });

  it('should allow editing an existing tracker', () => {
    // Create a tracker first
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    cy.get('input[name="name"]').type('Tracker to Edit');
    cy.get('textarea[name="description"]').type('Original description');
    cy.contains('Create Tracker').click();
    cy.contains('Tracker to Edit').should('be.visible');

    // Find and click edit button
    cy.get('[data-testid="tracker-card"]')
      .contains('Tracker to Edit')
      .parents('[data-testid="tracker-card"]')
      .within(() => {
        cy.contains('Edit').click();
      });

    // Edit modal should open
    cy.contains('Edit Tracker').should('be.visible');
    
    // Form should be pre-populated
    cy.get('input[name="name"]').should('have.value', 'Tracker to Edit');
    cy.get('textarea[name="description"]').should('have.value', 'Original description');
    
    // Modify the tracker
    cy.get('input[name="name"]').clear().type('Updated Tracker Name');
    cy.get('textarea[name="description"]').clear().type('Updated description');
    
    // Submit the update
    cy.contains('Update Tracker').click();
    
    // Verify the update
    cy.contains('Updated Tracker Name').should('be.visible');
    cy.contains('Updated description').should('be.visible');
    cy.contains('Tracker to Edit').should('not.exist');
  });

  it('should allow deleting a tracker', () => {
    // Create a tracker first
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    cy.get('input[name="name"]').type('Tracker to Delete');
    cy.contains('Create Tracker').click();
    cy.contains('Tracker to Delete').should('be.visible');

    // Find and click delete button
    cy.get('[data-testid="tracker-card"]')
      .contains('Tracker to Delete')
      .parents('[data-testid="tracker-card"]')
      .within(() => {
        cy.contains('Delete').click();
      });

    // Confirm deletion
    cy.on('window:confirm', () => true);

    // Verify the tracker was deleted
    cy.contains('Tracker to Delete').should('not.exist');
  });

  it('should show tracker in selector after creation', () => {
    // Create a tracker
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    cy.get('input[name="name"]').type('Selector Test Tracker');
    cy.contains('Create Tracker').click();

    // Navigate to Habits page
    cy.contains('Habits').click();
    cy.url().should('include', '/habits');

    // Check if tracker appears in selector
    cy.get('[data-testid="tracker-selector"]').click();
    cy.contains('Selector Test Tracker').should('be.visible');
  });

  it('should handle modal close operations', () => {
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    
    // Test close button
    cy.get('[aria-label="Close modal"]').click();
    cy.contains('Create New Tracker').should('not.exist');
    
    // Reopen and test cancel button
    cy.contains('Create New Tracker').click();
    cy.contains('Cancel').click();
    cy.contains('Create New Tracker').should('not.exist');
    
    // Reopen and test backdrop click
    cy.contains('Create New Tracker').click();
    cy.get('[data-testid="modal-backdrop"]').click({ force: true });
    cy.contains('Create New Tracker').should('not.exist');
  });

  it('should handle escape key to close modal', () => {
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    
    // Press escape key
    cy.get('body').type('{esc}');
    cy.contains('Create New Tracker').should('not.exist');
  });

  it('should show loading states during operations', () => {
    // Intercept API calls to add delay
    cy.intercept('POST', '/api/trackers*', { delay: 1000 }).as('createTracker');
    
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    cy.get('input[name="name"]').type('Loading Test Tracker');
    cy.contains('Create Tracker').click();
    
    // Should show loading state
    cy.contains('Creating...').should('be.visible');
    cy.get('input[name="name"]').should('be.disabled');
    
    // Wait for completion
    cy.wait('@createTracker');
    cy.contains('Loading Test Tracker').should('be.visible');
  });

  it('should show error states when operations fail', () => {
    // Intercept API calls to return error
    cy.intercept('POST', '/api/trackers*', {
      statusCode: 500,
      body: { message: 'Server error occurred' }
    }).as('createTrackerError');
    
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    cy.get('input[name="name"]').type('Error Test Tracker');
    cy.contains('Create Tracker').click();
    
    // Wait for error
    cy.wait('@createTrackerError');
    
    // Should show error message
    cy.contains('Server error occurred').should('be.visible');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('should focus on name input when modal opens', () => {
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    
    // Name input should be focused
    cy.get('input[name="name"]').should('be.focused');
  });

  it('should show character counts for input fields', () => {
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    
    // Type in name field and check character count
    cy.get('input[name="name"]').type('Test Name');
    cy.contains('9/100').should('be.visible');
    
    // Type in description and check character count
    cy.get('textarea[name="description"]').type('Test Description');
    cy.contains('16/500').should('be.visible');
  });

  it('should maintain form state when switching fields', () => {
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    
    // Fill form partially
    cy.get('input[name="name"]').type('Persistent Name');
    cy.get('textarea[name="description"]').type('Persistent Description');
    
    // Click between fields
    cy.get('input[name="name"]').click();
    cy.get('textarea[name="description"]').click();
    
    // Values should persist
    cy.get('input[name="name"]').should('have.value', 'Persistent Name');
    cy.get('textarea[name="description"]').should('have.value', 'Persistent Description');
  });

  it('should display empty state when no trackers exist', () => {
    cy.contains('Dashboard').click();
    
    // If no trackers exist, should show empty state
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="tracker-card"]').length === 0) {
        cy.contains('No trackers yet').should('be.visible');
        cy.contains('Create your first tracker').should('be.visible');
      }
    });
  });

  it('should handle keyboard navigation in modal', () => {
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    
    // Tab through form elements
    cy.get('input[name="name"]').should('be.focused');
    cy.get('input[name="name"]').tab();
    cy.get('textarea[name="description"]').should('be.focused');
    cy.get('textarea[name="description"]').tab();
    cy.contains('Cancel').should('be.focused');
    cy.contains('Cancel').tab();
    cy.contains('Create Tracker').should('be.focused');
  });

  it('should reset form when modal is reopened', () => {
    cy.contains('Dashboard').click();
    cy.contains('Create New Tracker').click();
    
    // Fill form
    cy.get('input[name="name"]').type('Temporary Name');
    cy.get('textarea[name="description"]').type('Temporary Description');
    
    // Close modal
    cy.contains('Cancel').click();
    
    // Reopen modal
    cy.contains('Create New Tracker').click();
    
    // Form should be reset
    cy.get('input[name="name"]').should('have.value', '');
    cy.get('textarea[name="description"]').should('have.value', '');
  });

  afterEach(() => {
    // Clean up any created data if needed
    // This is optional and depends on your test database setup
  });
});