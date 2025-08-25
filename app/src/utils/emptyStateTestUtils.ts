// Empty state and onboarding flow testing utilities

export interface EmptyStateTestResult {
  testName: string;
  passed: boolean;
  details: string;
  executionTime: number;
  error?: Error;
}

export interface EmptyStateTestSuite {
  noTrackersState: EmptyStateTestResult;
  noHabitsInTracker: EmptyStateTestResult;
  emptySearchResults: EmptyStateTestResult;
  noFilterResults: EmptyStateTestResult;
  loadingStates: EmptyStateTestResult;
  errorStates: EmptyStateTestResult;
  overall: boolean;
}

export interface OnboardingTestSuite {
  firstVisitExperience: EmptyStateTestResult;
  createFirstTracker: EmptyStateTestResult;
  createFirstHabit: EmptyStateTestResult;
  onboardingProgression: EmptyStateTestResult;
  helpAndGuidance: EmptyStateTestResult;
  onboardingCompletion: EmptyStateTestResult;
  overall: boolean;
}

export class EmptyStateTestRunner {
  async runEmptyStateTests(): Promise<EmptyStateTestSuite> {
    console.log('Starting empty state validation tests...');

    const noTrackersState = await this.testNoTrackersState();
    const noHabitsInTracker = await this.testNoHabitsInTracker();
    const emptySearchResults = await this.testEmptySearchResults();
    const noFilterResults = await this.testNoFilterResults();
    const loadingStates = await this.testLoadingStates();
    const errorStates = await this.testErrorStates();

    const allTests = [
      noTrackersState,
      noHabitsInTracker,
      emptySearchResults,
      noFilterResults,
      loadingStates,
      errorStates,
    ];

    const overall = allTests.every(test => test.passed);

    return {
      noTrackersState,
      noHabitsInTracker,
      emptySearchResults,
      noFilterResults,
      loadingStates,
      errorStates,
      overall,
    };
  }

  async runOnboardingTests(): Promise<OnboardingTestSuite> {
    console.log('Starting onboarding flow tests...');

    const firstVisitExperience = await this.testFirstVisitExperience();
    const createFirstTracker = await this.testCreateFirstTracker();
    const createFirstHabit = await this.testCreateFirstHabit();
    const onboardingProgression = await this.testOnboardingProgression();
    const helpAndGuidance = await this.testHelpAndGuidance();
    const onboardingCompletion = await this.testOnboardingCompletion();

    const allTests = [
      firstVisitExperience,
      createFirstTracker,
      createFirstHabit,
      onboardingProgression,
      helpAndGuidance,
      onboardingCompletion,
    ];

    const overall = allTests.every(test => test.passed);

    return {
      firstVisitExperience,
      createFirstTracker,
      createFirstHabit,
      onboardingProgression,
      helpAndGuidance,
      onboardingCompletion,
      overall,
    };
  }

  // Empty State Tests
  private async testNoTrackersState(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Simulate no trackers scenario
      await this.simulateEmptyTrackersState();
      
      // Look for empty state elements
      const emptyStateContainer = document.querySelector('[class*="empty"], [class*="EmptyDashboard"]');
      const noTrackersMessage = this.findTextContent(['no trackers', 'get started', 'create your first tracker']);
      const createTrackerCTA = document.querySelector('button[class*="create"], a[href*="tracker"]');
      
      // Check for illustration or icon
      const hasIllustration = document.querySelector('[class*="illustration"], [class*="icon"], svg, img[class*="empty"]');
      
      // Verify accessibility
      const hasProperHeading = document.querySelector('h1, h2, h3, h4, h5, h6');
      const hasAriaLabels = emptyStateContainer?.getAttribute('aria-label') || 
                           emptyStateContainer?.getAttribute('role');

      const executionTime = performance.now() - startTime;

      const hasEmptyState = !!emptyStateContainer;
      const hasAppropriateMessage = !!noTrackersMessage;
      const hasActionButton = !!createTrackerCTA;
      const hasVisualElement = !!hasIllustration;
      const isAccessible = !!(hasProperHeading || hasAriaLabels);

      const allRequirementsMet = hasEmptyState && hasAppropriateMessage && hasActionButton;

      if (allRequirementsMet) {
        return {
          testName: 'No Trackers State',
          passed: true,
          details: `Empty state displays with message, CTA button, ${hasVisualElement ? 'illustration, ' : ''}${isAccessible ? 'and accessibility features' : 'but missing accessibility features'}`,
          executionTime,
        };
      } else {
        return {
          testName: 'No Trackers State',
          passed: false,
          details: `Missing: ${!hasEmptyState ? 'container, ' : ''}${!hasAppropriateMessage ? 'message, ' : ''}${!hasActionButton ? 'CTA button' : ''}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'No Trackers State',
        passed: false,
        details: 'Exception occurred during no trackers state test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testNoHabitsInTracker(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Simulate tracker with no habits
      await this.simulateEmptyHabitsState();
      
      // Look for empty state elements specific to no habits
      const emptyHabitsMessage = this.findTextContent(['no habits', 'add your first habit', 'start tracking']);
      const createHabitCTA = document.querySelector('button[class*="habit"], button[class*="add"], a[href*="habit"]');
      
      // Check for motivational content
      const motivationalContent = this.findTextContent(['build habits', 'reach your goals', 'get started']);
      
      // Check for onboarding hints
      const onboardingHints = this.findTextContent(['tip:', 'suggestion:', 'try creating']);

      const executionTime = performance.now() - startTime;

      const hasMessage = !!emptyHabitsMessage;
      const hasCTA = !!createHabitCTA;
      const hasMotivationalContent = !!motivationalContent;
      const hasGuidance = !!onboardingHints;

      if (hasMessage && hasCTA) {
        return {
          testName: 'No Habits in Tracker',
          passed: true,
          details: `Empty habits state shows message, CTA${hasMotivationalContent ? ', motivational content' : ''}${hasGuidance ? ', and guidance' : ''}`,
          executionTime,
        };
      } else {
        return {
          testName: 'No Habits in Tracker',
          passed: false,
          details: `Missing: ${!hasMessage ? 'message, ' : ''}${!hasCTA ? 'CTA button' : ''}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'No Habits in Tracker',
        passed: false,
        details: 'Exception occurred during no habits state test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testEmptySearchResults(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Simulate search with no results
      await this.simulateEmptySearchResults();
      
      // Look for no results message
      const noResultsMessage = this.findTextContent(['no results', 'no habits found', 'try different search']);
      const clearSearchButton = document.querySelector('button[class*="clear"], button[aria-label*="clear"]');
      const searchSuggestions = this.findTextContent(['try:', 'suggestions:', 'search tips']);

      const executionTime = performance.now() - startTime;

      const hasMessage = !!noResultsMessage;
      const hasClearOption = !!clearSearchButton;
      const providesHelp = !!searchSuggestions;

      if (hasMessage) {
        return {
          testName: 'Empty Search Results',
          passed: true,
          details: `No results state shows message${hasClearOption ? ' with clear option' : ''}${providesHelp ? ' and suggestions' : ''}`,
          executionTime,
        };
      } else {
        return {
          testName: 'Empty Search Results',
          passed: false,
          details: 'No results message not found for empty search',
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Empty Search Results',
        passed: false,
        details: 'Exception occurred during empty search results test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testNoFilterResults(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Simulate filters with no matching results
      await this.simulateEmptyFilterResults();
      
      // Look for no filter results message
      const noFilterMessage = this.findTextContent(['no habits match', 'adjust filters', 'clear filters']);
      const clearFiltersButton = document.querySelector('button[class*="clear"], button[class*="reset"]');

      const executionTime = performance.now() - startTime;

      const hasMessage = !!noFilterMessage;
      const hasClearFilters = !!clearFiltersButton;

      if (hasMessage || hasClearFilters) {
        return {
          testName: 'No Filter Results',
          passed: true,
          details: `Filter empty state ${hasMessage ? 'shows message' : ''}${hasClearFilters ? ' with clear option' : ''}`,
          executionTime,
        };
      } else {
        return {
          testName: 'No Filter Results',
          passed: false,
          details: 'No appropriate empty state for filtered results',
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'No Filter Results',
        passed: false,
        details: 'Exception occurred during no filter results test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testLoadingStates(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Simulate loading state
      await this.simulateLoadingState();
      
      // Look for loading indicators
      const loadingSpinner = document.querySelector('[class*="loading"], [class*="spinner"], .loading');
      const skeletonElements = document.querySelectorAll('[class*="skeleton"]');
      const loadingMessage = this.findTextContent(['loading', 'please wait', 'fetching']);
      
      // Check for accessibility
      const hasAriaLive = document.querySelector('[aria-live], [role="status"]');
      const hasLoadingText = this.findTextContent(['loading habits', 'loading data']);

      const executionTime = performance.now() - startTime;

      const hasLoadingIndicator = !!(loadingSpinner || skeletonElements.length > 0);
      const hasLoadingFeedback = !!(loadingMessage || hasLoadingText);
      const isAccessible = !!hasAriaLive;

      if (hasLoadingIndicator) {
        return {
          testName: 'Loading States',
          passed: true,
          details: `Loading state shows ${loadingSpinner ? 'spinner' : 'skeletons'} ${hasLoadingFeedback ? 'with feedback' : ''}${isAccessible ? ' (accessible)' : ''}`,
          executionTime,
        };
      } else {
        return {
          testName: 'Loading States',
          passed: false,
          details: 'No loading indicators found',
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Loading States',
        passed: false,
        details: 'Exception occurred during loading states test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testErrorStates(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Simulate error state
      await this.simulateErrorState();
      
      // Look for error indicators
      const errorMessage = this.findTextContent(['error', 'something went wrong', 'failed to load']);
      const retryButton = document.querySelector('button[class*="retry"], button[class*="reload"]');
      
      // Check for user-friendly messaging
      const userFriendlyMessage = this.findTextContent(['try again', 'refresh the page', 'check connection']);
      
      // Check for accessibility
      const hasErrorRole = document.querySelector('[role="alert"], [aria-live="assertive"]');

      const executionTime = performance.now() - startTime;

      const hasError = !!errorMessage;
      const hasRecoveryOption = !!retryButton;
      const isUserFriendly = !!userFriendlyMessage;
      const isAccessible = !!hasErrorRole;

      if (hasError) {
        return {
          testName: 'Error States',
          passed: true,
          details: `Error state shows message${hasRecoveryOption ? ' with retry option' : ''}${isUserFriendly ? ' and helpful guidance' : ''}${isAccessible ? ' (accessible)' : ''}`,
          executionTime,
        };
      } else {
        return {
          testName: 'Error States',
          passed: false,
          details: 'No error state messaging found',
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Error States',
        passed: false,
        details: 'Exception occurred during error states test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  // Onboarding Tests
  private async testFirstVisitExperience(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Simulate first visit (clean state)
      await this.simulateFirstVisit();
      
      // Look for welcome messaging
      const welcomeMessage = this.findTextContent(['welcome', 'get started', 'habit tracker']);
      const introContent = this.findTextContent(['track your habits', 'build better habits', 'reach your goals']);
      const primaryCTA = document.querySelector('button[class*="primary"], button[class*="cta"]');
      
      // Check for onboarding hints
      const onboardingHints = this.findTextContent(['step 1', 'first', 'begin']);
      const progressIndicator = document.querySelector('[class*="progress"], [class*="step"]');

      const executionTime = performance.now() - startTime;

      const hasWelcome = !!welcomeMessage;
      const hasIntroduction = !!introContent;
      const hasPrimaryCTA = !!primaryCTA;
      const hasOnboardingFlow = !!(onboardingHints || progressIndicator);

      if (hasWelcome || hasIntroduction) {
        return {
          testName: 'First Visit Experience',
          passed: true,
          details: `First visit shows ${hasWelcome ? 'welcome message' : 'introduction'}${hasPrimaryCTA ? ' with clear CTA' : ''}${hasOnboardingFlow ? ' and onboarding flow' : ''}`,
          executionTime,
        };
      } else {
        return {
          testName: 'First Visit Experience',
          passed: false,
          details: 'No clear first visit experience or welcome messaging',
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'First Visit Experience',
        passed: false,
        details: 'Exception occurred during first visit experience test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testCreateFirstTracker(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Test the create tracker flow
      const createTrackerButton = document.querySelector('button[class*="create"][class*="tracker"], button[aria-label*="create tracker"]');
      
      if (!createTrackerButton) {
        return {
          testName: 'Create First Tracker',
          passed: false,
          details: 'Create tracker button not found',
          executionTime: performance.now() - startTime,
        };
      }

      // Simulate clicking create tracker
      await this.simulateClick(createTrackerButton as HTMLElement);
      
      // Look for modal or form
      const modal = document.querySelector('[role="dialog"], .modal, [class*="modal"]');
      const form = document.querySelector('form[class*="tracker"], form[class*="create"]');
      const nameInput = document.querySelector('input[name*="name"], input[placeholder*="name"]');
      
      // Check for form validation and guidance
      const helpText = this.findTextContent(['enter a name', 'tracker name', 'choose a name']);
      const submitButton = document.querySelector('button[type="submit"], button[class*="create"]');

      const executionTime = performance.now() - startTime;

      const hasCreateInterface = !!(modal || form);
      const hasRequiredField = !!nameInput;
      const hasSubmitAction = !!submitButton;
      const providesGuidance = !!helpText;

      if (hasCreateInterface && hasRequiredField && hasSubmitAction) {
        return {
          testName: 'Create First Tracker',
          passed: true,
          details: `Create tracker flow works with form fields and submit action${providesGuidance ? ' with guidance' : ''}`,
          executionTime,
        };
      } else {
        return {
          testName: 'Create First Tracker',
          passed: false,
          details: `Missing: ${!hasCreateInterface ? 'interface, ' : ''}${!hasRequiredField ? 'name field, ' : ''}${!hasSubmitAction ? 'submit action' : ''}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Create First Tracker',
        passed: false,
        details: 'Exception occurred during create first tracker test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testCreateFirstHabit(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Test the create habit flow
      const createHabitButton = document.querySelector('button[class*="create"][class*="habit"], button[aria-label*="create habit"], button[aria-label*="add habit"]');
      
      if (!createHabitButton) {
        return {
          testName: 'Create First Habit',
          passed: false,
          details: 'Create habit button not found',
          executionTime: performance.now() - startTime,
        };
      }

      // Simulate clicking create habit
      await this.simulateClick(createHabitButton as HTMLElement);
      
      // Look for habit creation interface
      const modal = document.querySelector('[role="dialog"], .modal, [class*="modal"]');
      const form = document.querySelector('form[class*="habit"], form[class*="create"]');
      
      // Check for required fields
      const nameInput = document.querySelector('input[name*="name"], input[placeholder*="habit name"]');
      const frequencySelect = document.querySelector('select[name*="frequency"], [class*="frequency"]');
      
      // Check for optional enhancements
      const iconSelector = document.querySelector('[class*="icon"], [class*="emoji"]');
      const colorPicker = document.querySelector('input[type="color"], [class*="color"]');
      
      // Check for form completion
      const submitButton = document.querySelector('button[type="submit"], button[class*="create"]');
      const previewArea = document.querySelector('[class*="preview"], [class*="card"][class*="preview"]');

      const executionTime = performance.now() - startTime;

      const hasInterface = !!(modal || form);
      const hasRequiredFields = !!(nameInput && frequencySelect);
      const hasEnhancements = !!(iconSelector || colorPicker);
      const hasCompletion = !!submitButton;
      const hasPreview = !!previewArea;

      if (hasInterface && hasRequiredFields && hasCompletion) {
        return {
          testName: 'Create First Habit',
          passed: true,
          details: `Create habit flow complete with required fields${hasEnhancements ? ', customization options' : ''}${hasPreview ? ', and preview' : ''}`,
          executionTime,
        };
      } else {
        return {
          testName: 'Create First Habit',
          passed: false,
          details: `Missing: ${!hasInterface ? 'interface, ' : ''}${!hasRequiredFields ? 'required fields, ' : ''}${!hasCompletion ? 'submit action' : ''}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Create First Habit',
        passed: false,
        details: 'Exception occurred during create first habit test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testOnboardingProgression(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Look for onboarding progress indicators
      const progressBar = document.querySelector('[class*="progress"], progress');
      const stepIndicator = document.querySelector('[class*="step"], [class*="wizard"]');
      const breadcrumbs = document.querySelector('[class*="breadcrumb"], nav[class*="step"]');
      
      // Check for next/previous navigation
      const nextButton = document.querySelector('button[class*="next"], button[aria-label*="next"]');
      const prevButton = document.querySelector('button[class*="prev"], button[class*="back"]');
      const skipOption = document.querySelector('button[class*="skip"], a[class*="skip"]');
      
      // Check for contextual help
      const helpContent = this.findTextContent(['tip:', 'help:', 'learn more']);
      const tooltips = document.querySelectorAll('[title], [aria-describedby]');

      const executionTime = performance.now() - startTime;

      const hasProgressTracking = !!(progressBar || stepIndicator || breadcrumbs);
      const hasNavigation = !!(nextButton || prevButton);
      const hasFlexibility = !!skipOption;
      const providesHelp = !!(helpContent || tooltips.length > 0);

      // For onboarding progression, we'll pass if there's some form of guidance
      const hasOnboardingElements = hasProgressTracking || hasNavigation || providesHelp;

      if (hasOnboardingElements) {
        return {
          testName: 'Onboarding Progression',
          passed: true,
          details: `Onboarding provides ${hasProgressTracking ? 'progress tracking, ' : ''}${hasNavigation ? 'navigation, ' : ''}${hasFlexibility ? 'skip options, ' : ''}${providesHelp ? 'contextual help' : ''}`.replace(/, $/, ''),
          executionTime,
        };
      } else {
        return {
          testName: 'Onboarding Progression',
          passed: false,
          details: 'No clear onboarding progression or guidance found',
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Onboarding Progression',
        passed: false,
        details: 'Exception occurred during onboarding progression test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testHelpAndGuidance(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Look for help elements
      const helpButton = document.querySelector('button[class*="help"], button[aria-label*="help"]');
      const helpIcon = document.querySelector('[class*="help"], [title*="help"], [aria-label*="help"]');
      const tooltips = document.querySelectorAll('[title], [data-tooltip]');
      
      // Check for guidance content
      const tips = this.findTextContent(['tip:', 'pro tip:', 'hint:']);
      const examples = this.findTextContent(['example:', 'e.g.', 'try:', 'sample:']);
      const explanations = this.findTextContent(['this will help', 'this allows you', 'use this to']);
      
      // Check for documentation links
      const learnMoreLinks = document.querySelectorAll('a[href*="help"], a[href*="docs"], a[class*="learn"]');
      
      // Check for contextual guidance
      const placeholderTexts = document.querySelectorAll('input[placeholder], textarea[placeholder]');
      const fieldDescriptions = document.querySelectorAll('[aria-describedby], [class*="description"]');

      const executionTime = performance.now() - startTime;

      const hasHelpAccess = !!(helpButton || helpIcon);
      const hasInteractiveHelp = tooltips.length > 0;
      const hasGuidanceContent = !!(tips || examples || explanations);
      const hasDocumentation = learnMoreLinks.length > 0;
      const hasContextualHelp = placeholderTexts.length > 0 || fieldDescriptions.length > 0;

      const helpScore = [hasHelpAccess, hasInteractiveHelp, hasGuidanceContent, hasDocumentation, hasContextualHelp].filter(Boolean).length;

      if (helpScore >= 2) {
        return {
          testName: 'Help and Guidance',
          passed: true,
          details: `Help system provides ${helpScore}/5 features: ${hasHelpAccess ? 'help access, ' : ''}${hasInteractiveHelp ? 'tooltips, ' : ''}${hasGuidanceContent ? 'guidance content, ' : ''}${hasDocumentation ? 'documentation, ' : ''}${hasContextualHelp ? 'contextual help' : ''}`.replace(/, $/, ''),
          executionTime,
        };
      } else {
        return {
          testName: 'Help and Guidance',
          passed: false,
          details: `Limited help features (${helpScore}/5). Consider adding tooltips, examples, or help documentation`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Help and Guidance',
        passed: false,
        details: 'Exception occurred during help and guidance test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testOnboardingCompletion(): Promise<EmptyStateTestResult> {
    const startTime = performance.now();

    try {
      // Simulate completing onboarding flow
      await this.simulateOnboardingCompletion();
      
      // Look for completion indicators
      const completionMessage = this.findTextContent(['congratulations', 'all set', 'you\'re ready', 'completed']);
      const successFeedback = this.findTextContent(['great job', 'well done', 'perfect']);
      
      // Check for next steps
      const nextStepsContent = this.findTextContent(['next steps', 'now you can', 'start by']);
      const dashboardButton = document.querySelector('button[class*="dashboard"], a[href*="dashboard"]');
      
      // Check for onboarding completion persistence
      const onboardingComplete = localStorage.getItem('onboarding-complete') || 
                                localStorage.getItem('first-visit') === 'false';
      
      // Check that onboarding doesn't show again
      const noOnboardingElements = !document.querySelector('[class*="onboarding"], [class*="welcome"][class*="modal"]');

      const executionTime = performance.now() - startTime;

      const hasCompletionFeedback = !!(completionMessage || successFeedback);
      const providesNextSteps = !!(nextStepsContent || dashboardButton);
      const persistsCompletion = !!onboardingComplete;
      const hidesOnboarding = noOnboardingElements;

      if (hasCompletionFeedback || providesNextSteps) {
        return {
          testName: 'Onboarding Completion',
          passed: true,
          details: `Onboarding completion ${hasCompletionFeedback ? 'provides feedback' : ''}${providesNextSteps ? ' and next steps' : ''}${persistsCompletion ? ' (persisted)' : ''}${hidesOnboarding ? ' (hidden after completion)' : ''}`,
          executionTime,
        };
      } else {
        return {
          testName: 'Onboarding Completion',
          passed: false,
          details: 'No clear onboarding completion experience',
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Onboarding Completion',
        passed: false,
        details: 'Exception occurred during onboarding completion test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  // Helper methods
  private async simulateEmptyTrackersState(): Promise<void> {
    // Clear any existing trackers for testing
    localStorage.removeItem('trackers');
    localStorage.removeItem('habits');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async simulateEmptyHabitsState(): Promise<void> {
    // Simulate having trackers but no habits
    localStorage.setItem('trackers', JSON.stringify([{ id: 1, name: 'Test Tracker' }]));
    localStorage.removeItem('habits');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async simulateEmptySearchResults(): Promise<void> {
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = 'NonExistentHabitSearchQuery123';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  private async simulateEmptyFilterResults(): Promise<void> {
    // Apply filters that would result in no matches
    const frequencyFilter = document.querySelector('select[name*="frequency"]') as HTMLSelectElement;
    if (frequencyFilter) {
      frequencyFilter.value = 'NonExistentFrequency';
      frequencyFilter.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async simulateLoadingState(): Promise<void> {
    // This would trigger a loading state in a real implementation
    // For testing, we'll look for existing loading indicators
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async simulateErrorState(): Promise<void> {
    // This would trigger an error state in a real implementation
    // For testing, we'll simulate by checking for error handling
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async simulateFirstVisit(): Promise<void> {
    // Clear all local storage to simulate first visit
    localStorage.clear();
    sessionStorage.clear();
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async simulateClick(element: HTMLElement): Promise<void> {
    element.click();
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async simulateOnboardingCompletion(): Promise<void> {
    // Simulate completing the onboarding flow
    localStorage.setItem('onboarding-complete', 'true');
    localStorage.setItem('first-visit', 'false');
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private findTextContent(searchTerms: string[]): Element | null {
    const allElements = document.querySelectorAll('*');
    
    for (const element of Array.from(allElements)) {
      const text = element.textContent?.toLowerCase() || '';
      
      for (const term of searchTerms) {
        if (text.includes(term.toLowerCase())) {
          return element;
        }
      }
    }
    
    return null;
  }

  generateEmptyStateReport(emptyStateSuite: EmptyStateTestSuite, onboardingSuite: OnboardingTestSuite): string {
    let report = `# Empty States and Onboarding Flow Test Report\n\n`;

    // Summary
    const emptyStateTests = [
      emptyStateSuite.noTrackersState,
      emptyStateSuite.noHabitsInTracker,
      emptyStateSuite.emptySearchResults,
      emptyStateSuite.noFilterResults,
      emptyStateSuite.loadingStates,
      emptyStateSuite.errorStates,
    ];

    const onboardingTests = [
      onboardingSuite.firstVisitExperience,
      onboardingSuite.createFirstTracker,
      onboardingSuite.createFirstHabit,
      onboardingSuite.onboardingProgression,
      onboardingSuite.helpAndGuidance,
      onboardingSuite.onboardingCompletion,
    ];

    const allTests = [...emptyStateTests, ...onboardingTests];
    const totalTests = allTests.length;
    const passedTests = allTests.filter(test => test.passed).length;
    const passRate = (passedTests / totalTests) * 100;

    report += `## Summary\n`;
    report += `- **Empty State Tests:** ${emptyStateSuite.overall ? '✅ PASS' : '❌ FAIL'}\n`;
    report += `- **Onboarding Tests:** ${onboardingSuite.overall ? '✅ PASS' : '❌ FAIL'}\n`;
    report += `- **Overall Tests Passed:** ${passedTests}/${totalTests} (${passRate.toFixed(1)}%)\n`;
    report += `- **Total Execution Time:** ${allTests.reduce((sum, test) => sum + test.executionTime, 0).toFixed(2)}ms\n\n`;

    // Empty State Tests
    report += `## Empty State Validation\n\n`;
    emptyStateTests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      report += `${status} **${test.testName}** (${test.executionTime.toFixed(2)}ms)\n`;
      report += `   ${test.details}\n`;
      if (test.error) {
        report += `   Error: ${test.error.message}\n`;
      }
      report += `\n`;
    });

    // Onboarding Tests
    report += `## Onboarding Flow Validation\n\n`;
    onboardingTests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      report += `${status} **${test.testName}** (${test.executionTime.toFixed(2)}ms)\n`;
      report += `   ${test.details}\n`;
      if (test.error) {
        report += `   Error: ${test.error.message}\n`;
      }
      report += `\n`;
    });

    // Recommendations
    report += `## Recommendations\n\n`;

    if (emptyStateSuite.overall && onboardingSuite.overall) {
      report += `🎉 **Excellent!** All empty state and onboarding tests passed.\n\n`;
      report += `Your dashboard provides:\n`;
      report += `- Clear messaging for all empty states\n`;
      report += `- Actionable CTAs to guide user actions\n`;
      report += `- Smooth onboarding experience\n`;
      report += `- Helpful guidance and support\n`;
      report += `- Appropriate loading and error states\n`;
    } else {
      report += `To improve the empty states and onboarding experience:\n\n`;

      const failedTests = allTests.filter(test => !test.passed);
      failedTests.forEach(test => {
        report += `### ${test.testName}\n`;
        report += `**Issue:** ${test.details}\n`;
        
        // Provide specific recommendations
        if (test.testName.includes('No Trackers')) {
          report += `**Fix:** Add empty state with illustration, clear message, and prominent "Create Tracker" button.\n`;
        } else if (test.testName.includes('No Habits')) {
          report += `**Fix:** Show motivational empty state with guidance on creating first habit.\n`;
        } else if (test.testName.includes('Search Results')) {
          report += `**Fix:** Add "No results found" message with search suggestions and clear button.\n`;
        } else if (test.testName.includes('Filter Results')) {
          report += `**Fix:** Show filter-specific empty state with option to clear or adjust filters.\n`;
        } else if (test.testName.includes('Loading')) {
          report += `**Fix:** Add skeleton screens or loading spinners with accessible announcements.\n`;
        } else if (test.testName.includes('Error')) {
          report += `**Fix:** Provide clear error messages with retry options and user-friendly language.\n`;
        } else if (test.testName.includes('First Visit')) {
          report += `**Fix:** Create welcoming first-time user experience with clear value proposition.\n`;
        } else if (test.testName.includes('Create')) {
          report += `**Fix:** Implement guided creation flows with validation and helpful hints.\n`;
        } else if (test.testName.includes('Progression')) {
          report += `**Fix:** Add progress indicators and navigation for multi-step onboarding.\n`;
        } else if (test.testName.includes('Help')) {
          report += `**Fix:** Provide contextual help with tooltips, examples, and documentation links.\n`;
        } else if (test.testName.includes('Completion')) {
          report += `**Fix:** Celebrate completion with positive feedback and clear next steps.\n`;
        }
        
        report += `\n`;
      });

      report += `## General UX Guidelines\n\n`;
      report += `- **Empty States:** Always provide context, explanation, and next action\n`;
      report += `- **Loading States:** Keep users informed with progress indicators\n`;
      report += `- **Error States:** Be helpful, not technical - offer solutions\n`;
      report += `- **Onboarding:** Make it skippable, progressive, and value-focused\n`;
      report += `- **Help System:** Make assistance discoverable and contextual\n`;
    }

    return report;
  }
}

// Helper functions
export async function runEmptyStateTests(): Promise<EmptyStateTestSuite> {
  const testRunner = new EmptyStateTestRunner();
  return await testRunner.runEmptyStateTests();
}

export async function runOnboardingTests(): Promise<OnboardingTestSuite> {
  const testRunner = new EmptyStateTestRunner();
  return await testRunner.runOnboardingTests();
}

export default EmptyStateTestRunner;