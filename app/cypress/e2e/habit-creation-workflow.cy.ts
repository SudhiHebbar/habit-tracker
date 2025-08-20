/// <reference types="cypress" />

describe('Habit Creation Workflow', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');
    
    // Ensure we're on the home page
    cy.contains('Habit Tracker').should('be.visible');
  });

  it('should complete the full habit creation workflow', () => {
    // Step 1: Navigate to Dashboard and create a tracker
    cy.contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    
    // Create a new tracker if none exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="tracker-card"]').length === 0) {
        cy.contains('Create New Tracker').click();
        cy.get('input[name="name"]').type('E2E Test Tracker');
        cy.get('textarea[name="description"]').type('Created during E2E testing');
        cy.contains('Create Tracker').click();
        cy.contains('E2E Test Tracker').should('be.visible');
      }
    });

    // Step 2: Navigate to Habits page
    cy.contains('Habits').click();
    cy.url().should('include', '/habits');
    
    // Step 3: Select tracker if dropdown is visible
    cy.get('body').then(($body) => {
      if ($body.find('select[data-testid="tracker-select"]').length > 0) {
        cy.get('select[data-testid="tracker-select"]').select('E2E Test Tracker');
      }
    });

    // Step 4: Open habit creation modal
    cy.contains('Add Habit').click();
    cy.contains('Create New Habit').should('be.visible');

    // Step 5: Fill out habit creation form
    cy.get('input[name="name"]').type('E2E Test Habit');
    cy.get('textarea[name="description"]').type('A habit created during end-to-end testing');
    
    // Select frequency
    cy.get('select[name="targetFrequency"]').select('Daily');
    
    // Set target count
    cy.get('input[name="targetCount"]').clear().type('1');
    
    // Select a color (click on blue color button)
    cy.get('[data-testid="color-blue"]').click();
    
    // Step 6: Submit the form
    cy.contains('Create Habit').click();
    
    // Step 7: Verify the habit was created
    cy.contains('E2E Test Habit').should('be.visible');
    cy.contains('A habit created during end-to-end testing').should('be.visible');
  });

  it('should validate required fields in habit creation', () => {
    // Navigate to habits page
    cy.contains('Habits').click();
    
    // Open habit creation modal
    cy.contains('Add Habit').click();
    
    // Try to submit without required fields
    cy.contains('Create Habit').should('be.disabled');
    
    // Add only the name
    cy.get('input[name="name"]').type('Test Habit');
    
    // Submit button should now be enabled
    cy.contains('Create Habit').should('not.be.disabled');
    
    // Clear the name to test validation
    cy.get('input[name="name"]').clear();
    cy.contains('Create Habit').click();
    
    // Should show validation error
    cy.contains('Habit name is required').should('be.visible');
  });

  it('should allow editing an existing habit', () => {
    // Navigate to habits page
    cy.contains('Habits').click();
    
    // Ensure we have at least one habit (create one if needed)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="habit-card-"]').length === 0) {
        // Create a habit first
        cy.contains('Add Habit').click();
        cy.get('input[name="name"]').type('Habit to Edit');
        cy.contains('Create Habit').click();
        cy.contains('Habit to Edit').should('be.visible');
      }
    });

    // Find and click edit button on first habit
    cy.get('[data-testid^="habit-card-"]').first().within(() => {
      cy.contains('Edit').click();
    });

    // Edit modal should open
    cy.contains('Edit Habit').should('be.visible');
    
    // Modify the habit name
    cy.get('input[name="name"]').clear().type('Updated Habit Name');
    
    // Navigate through wizard steps
    cy.contains('Next').click(); // Go to appearance step
    cy.contains('Next').click(); // Go to frequency step
    cy.contains('Next').click(); // Go to settings step
    
    // Update the habit
    cy.contains('Update Habit').click();
    
    // Verify the update
    cy.contains('Updated Habit Name').should('be.visible');
  });

  it('should allow deleting a habit', () => {
    // Navigate to habits page
    cy.contains('Habits').click();
    
    // Create a habit to delete
    cy.contains('Add Habit').click();
    cy.get('input[name="name"]').type('Habit to Delete');
    cy.contains('Create Habit').click();
    cy.contains('Habit to Delete').should('be.visible');

    // Find and click delete button
    cy.contains('Habit to Delete').parents('[data-testid^="habit-card-"]').within(() => {
      cy.contains('Delete').click();
    });

    // Confirm deletion in browser alert
    cy.on('window:confirm', () => true);

    // Verify the habit was deleted
    cy.contains('Habit to Delete').should('not.exist');
  });

  it('should filter and search habits correctly', () => {
    // Navigate to habits page
    cy.contains('Habits').click();

    // Create multiple habits with different frequencies
    const habitsToCreate = [
      { name: 'Daily Exercise', frequency: 'Daily' },
      { name: 'Weekly Planning', frequency: 'Weekly' },
      { name: 'Monthly Review', frequency: 'Custom' }
    ];

    habitsToCreate.forEach(habit => {
      cy.contains('Add Habit').click();
      cy.get('input[name="name"]').type(habit.name);
      cy.get('select[name="targetFrequency"]').select(habit.frequency);
      cy.contains('Create Habit').click();
      cy.contains(habit.name).should('be.visible');
    });

    // Test search functionality
    cy.get('input[placeholder="Search habits..."]').type('Exercise');
    cy.contains('Daily Exercise').should('be.visible');
    cy.contains('Weekly Planning').should('not.be.visible');
    cy.contains('Monthly Review').should('not.be.visible');

    // Clear search
    cy.get('input[placeholder="Search habits..."]').clear();

    // Test frequency filter
    cy.get('select').contains('All Frequencies').parent().select('Weekly');
    cy.contains('Weekly Planning').should('be.visible');
    cy.contains('Daily Exercise').should('not.be.visible');

    // Clear filters
    cy.contains('Clear').click();
    cy.contains('Daily Exercise').should('be.visible');
    cy.contains('Weekly Planning').should('be.visible');
    cy.contains('Monthly Review').should('be.visible');
  });

  it('should handle color selection in habit creation', () => {
    cy.contains('Habits').click();
    cy.contains('Add Habit').click();
    
    // Fill required fields
    cy.get('input[name="name"]').type('Color Test Habit');
    
    // Test different color selections
    const colors = ['red', 'blue', 'green'];
    
    colors.forEach(color => {
      cy.get(`[data-testid="color-${color}"]`).click();
      cy.get('[data-testid="selected-color"]').should('contain', '#'); // Should have hex color
    });
    
    // Submit with selected color
    cy.contains('Create Habit').click();
    cy.contains('Color Test Habit').should('be.visible');
  });

  it('should maintain data when navigating between pages', () => {
    // Create a habit
    cy.contains('Habits').click();
    cy.contains('Add Habit').click();
    cy.get('input[name="name"]').type('Navigation Test Habit');
    cy.contains('Create Habit').click();
    
    // Navigate away and back
    cy.contains('Dashboard').click();
    cy.contains('Habits').click();
    
    // Habit should still be there
    cy.contains('Navigation Test Habit').should('be.visible');
  });

  it('should handle empty states correctly', () => {
    // Navigate to a fresh habits page (assuming no habits exist)
    cy.contains('Habits').click();
    
    // Should show empty state if no habits exist
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="habit-card-"]').length === 0) {
        cy.contains('No habits yet').should('be.visible');
        cy.contains('Create your first habit').should('be.visible');
        cy.contains('Create Your First Habit').should('be.visible');
      }
    });
  });

  it('should work with keyboard navigation', () => {
    cy.contains('Habits').click();
    cy.contains('Add Habit').click();
    
    // Use keyboard to navigate form
    cy.get('input[name="name"]').focus().type('Keyboard Navigation Test');
    cy.get('input[name="name"]').tab();
    cy.focused().type('Testing keyboard navigation');
    
    // Tab to frequency select
    cy.focused().tab().select('Weekly');
    
    // Submit using Enter key
    cy.get('input[name="name"]').focus().type('{enter}');
    
    // Verify submission worked
    cy.contains('Keyboard Navigation Test').should('be.visible');
  });

  it('should handle form validation errors gracefully', () => {
    cy.contains('Habits').click();
    cy.contains('Add Habit').click();
    
    // Test name too long
    const longName = 'A'.repeat(101);
    cy.get('input[name="name"]').type(longName);
    cy.contains('Create Habit').click();
    cy.contains('must not exceed 100 characters').should('be.visible');
    
    // Fix the error
    cy.get('input[name="name"]').clear().type('Valid Name');
    cy.contains('must not exceed 100 characters').should('not.exist');
    
    // Test description too long
    const longDescription = 'A'.repeat(501);
    cy.get('textarea[name="description"]').type(longDescription);
    cy.contains('Create Habit').click();
    cy.contains('must not exceed 500 characters').should('be.visible');
  });

  it('should display loading states appropriately', () => {
    cy.contains('Habits').click();
    
    // Intercept API calls to add delay
    cy.intercept('POST', '/api/habits*', { delay: 1000 }).as('createHabit');
    
    cy.contains('Add Habit').click();
    cy.get('input[name="name"]').type('Loading Test Habit');
    cy.contains('Create Habit').click();
    
    // Should show loading state
    cy.contains('Creating...').should('be.visible');
    cy.get('input[name="name"]').should('be.disabled');
    
    // Wait for completion
    cy.wait('@createHabit');
    cy.contains('Loading Test Habit').should('be.visible');
  });

  afterEach(() => {
    // Clean up any created data if needed
    // This is optional and depends on your test database setup
  });
});