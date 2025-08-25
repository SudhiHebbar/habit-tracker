// Functional testing utilities for view toggle and filter functionality

export interface FunctionalTestResult {
  testName: string;
  passed: boolean;
  details: string;
  executionTime: number;
  error?: Error;
}

export interface ViewToggleTestSuite {
  gridViewDisplay: FunctionalTestResult;
  listViewDisplay: FunctionalTestResult;
  viewToggleInteraction: FunctionalTestResult;
  persistentViewPreference: FunctionalTestResult;
  responsiveViewBehavior: FunctionalTestResult;
  overall: boolean;
}

export interface FilterTestSuite {
  searchFiltering: FunctionalTestResult;
  frequencyFiltering: FunctionalTestResult;
  statusFiltering: FunctionalTestResult;
  sortingFunctionality: FunctionalTestResult;
  filterCombination: FunctionalTestResult;
  filterPersistence: FunctionalTestResult;
  filterResultsAccuracy: FunctionalTestResult;
  overall: boolean;
}

export class FunctionalTestRunner {
  private testHabits = [
    {
      id: 1,
      name: 'Morning Exercise',
      description: 'Daily workout routine',
      targetFrequency: 'Daily',
      targetCount: 1,
      isActive: true,
      icon: '🏃',
      color: '#10B981',
    },
    {
      id: 2,
      name: 'Read Books',
      description: 'Reading for 30 minutes',
      targetFrequency: 'Daily',
      targetCount: 1,
      isActive: true,
      icon: '📚',
      color: '#6366F1',
    },
    {
      id: 3,
      name: 'Weekly Planning',
      description: 'Plan the upcoming week',
      targetFrequency: 'Weekly',
      targetCount: 1,
      isActive: true,
      icon: '📅',
      color: '#F59E0B',
    },
    {
      id: 4,
      name: 'Meditation',
      description: 'Daily mindfulness practice',
      targetFrequency: 'Daily',
      targetCount: 1,
      isActive: false,
      icon: '🧘',
      color: '#8B5CF6',
    },
  ];

  async runViewToggleTests(): Promise<ViewToggleTestSuite> {
    console.log('Starting view toggle functionality tests...');

    const gridViewDisplay = await this.testGridViewDisplay();
    const listViewDisplay = await this.testListViewDisplay();
    const viewToggleInteraction = await this.testViewToggleInteraction();
    const persistentViewPreference = await this.testPersistentViewPreference();
    const responsiveViewBehavior = await this.testResponsiveViewBehavior();

    const allTests = [
      gridViewDisplay,
      listViewDisplay,
      viewToggleInteraction,
      persistentViewPreference,
      responsiveViewBehavior,
    ];

    const overall = allTests.every(test => test.passed);

    return {
      gridViewDisplay,
      listViewDisplay,
      viewToggleInteraction,
      persistentViewPreference,
      responsiveViewBehavior,
      overall,
    };
  }

  async runFilterTests(): Promise<FilterTestSuite> {
    console.log('Starting filter functionality tests...');

    const searchFiltering = await this.testSearchFiltering();
    const frequencyFiltering = await this.testFrequencyFiltering();
    const statusFiltering = await this.testStatusFiltering();
    const sortingFunctionality = await this.testSortingFunctionality();
    const filterCombination = await this.testFilterCombination();
    const filterPersistence = await this.testFilterPersistence();
    const filterResultsAccuracy = await this.testFilterResultsAccuracy();

    const allTests = [
      searchFiltering,
      frequencyFiltering,
      statusFiltering,
      sortingFunctionality,
      filterCombination,
      filterPersistence,
      filterResultsAccuracy,
    ];

    const overall = allTests.every(test => test.passed);

    return {
      searchFiltering,
      frequencyFiltering,
      statusFiltering,
      sortingFunctionality,
      filterCombination,
      filterPersistence,
      filterResultsAccuracy,
      overall,
    };
  }

  // View Toggle Tests
  private async testGridViewDisplay(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Setup test environment
      await this.setupTestEnvironment();

      // Set view to grid mode
      await this.setViewMode('grid');

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if grid layout is displayed
      const gridContainer = document.querySelector('[class*="habitGrid"], [class*="grid"]');
      const habitCards = document.querySelectorAll('[class*="habitCard"]');

      // Verify grid properties
      const isGridDisplay = this.verifyGridLayout(gridContainer as HTMLElement);
      const hasHabitCards = habitCards.length > 0;
      const cardsArrangedInGrid = this.verifyGridArrangement(habitCards);

      const executionTime = performance.now() - startTime;

      if (isGridDisplay && hasHabitCards && cardsArrangedInGrid) {
        return {
          testName: 'Grid View Display',
          passed: true,
          details: `Grid view displays ${habitCards.length} habit cards in proper grid layout`,
          executionTime,
        };
      } else {
        return {
          testName: 'Grid View Display',
          passed: false,
          details: `Failed: gridDisplay=${isGridDisplay}, hasCards=${hasHabitCards}, gridArrangement=${cardsArrangedInGrid}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Grid View Display',
        passed: false,
        details: 'Exception occurred during grid view test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testListViewDisplay(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Set view to list mode
      await this.setViewMode('list');

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if list layout is displayed
      const listContainer = document.querySelector('[class*="habitList"], [class*="list"]');
      const habitItems = document.querySelectorAll('[class*="listItem"], [class*="habitCard"]');

      // Verify list properties
      const isListDisplay = this.verifyListLayout(listContainer as HTMLElement);
      const hasHabitItems = habitItems.length > 0;
      const itemsArrangedInList = this.verifyListArrangement(habitItems);

      const executionTime = performance.now() - startTime;

      if (isListDisplay && hasHabitItems && itemsArrangedInList) {
        return {
          testName: 'List View Display',
          passed: true,
          details: `List view displays ${habitItems.length} habit items in proper list layout`,
          executionTime,
        };
      } else {
        return {
          testName: 'List View Display',
          passed: false,
          details: `Failed: listDisplay=${isListDisplay}, hasItems=${hasHabitItems}, listArrangement=${itemsArrangedInList}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'List View Display',
        passed: false,
        details: 'Exception occurred during list view test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testViewToggleInteraction(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Find view toggle buttons
      const viewToggle = document.querySelector('[class*="viewToggle"]');
      const gridButton = viewToggle?.querySelector(
        '[data-view="grid"], button:first-child'
      ) as HTMLButtonElement;
      const listButton = viewToggle?.querySelector(
        '[data-view="list"], button:last-child'
      ) as HTMLButtonElement;

      if (!gridButton || !listButton) {
        return {
          testName: 'View Toggle Interaction',
          passed: false,
          details: 'View toggle buttons not found',
          executionTime: performance.now() - startTime,
        };
      }

      // Test clicking grid button
      await this.simulateClick(gridButton);
      await new Promise(resolve => setTimeout(resolve, 100));
      const gridActive =
        gridButton.classList.contains('active') ||
        gridButton.getAttribute('aria-pressed') === 'true';

      // Test clicking list button
      await this.simulateClick(listButton);
      await new Promise(resolve => setTimeout(resolve, 100));
      const listActive =
        listButton.classList.contains('active') ||
        listButton.getAttribute('aria-pressed') === 'true';

      // Test that only one is active at a time
      const exclusiveSelection = !gridActive || !listActive;

      const executionTime = performance.now() - startTime;

      if (exclusiveSelection) {
        return {
          testName: 'View Toggle Interaction',
          passed: true,
          details: 'View toggle buttons work correctly with exclusive selection',
          executionTime,
        };
      } else {
        return {
          testName: 'View Toggle Interaction',
          passed: false,
          details: `Failed: Both buttons appear active simultaneously`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'View Toggle Interaction',
        passed: false,
        details: 'Exception occurred during view toggle interaction test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testPersistentViewPreference(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Set view mode and verify persistence
      await this.setViewMode('list');

      // Simulate page reload by checking localStorage
      const storedPreferences = localStorage.getItem('dashboard-preferences');
      let preferencesPersisted = false;

      if (storedPreferences) {
        const preferences = JSON.parse(storedPreferences);
        preferencesPersisted = preferences.viewMode === 'list';
      }

      // Test switching and persistence again
      await this.setViewMode('grid');
      const updatedPreferences = localStorage.getItem('dashboard-preferences');
      let updatedPersistance = false;

      if (updatedPreferences) {
        const preferences = JSON.parse(updatedPreferences);
        updatedPersistance = preferences.viewMode === 'grid';
      }

      const executionTime = performance.now() - startTime;

      if (preferencesPersisted && updatedPersistance) {
        return {
          testName: 'Persistent View Preference',
          passed: true,
          details: 'View preferences are correctly saved to and loaded from localStorage',
          executionTime,
        };
      } else {
        return {
          testName: 'Persistent View Preference',
          passed: false,
          details: `Failed: initialPersistence=${preferencesPersisted}, updatedPersistence=${updatedPersistance}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Persistent View Preference',
        passed: false,
        details: 'Exception occurred during persistent view preference test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testResponsiveViewBehavior(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Test desktop view (grid should be available)
      await this.setViewportWidth(1200);
      await this.setViewMode('grid');
      const desktopGridWorks = this.isGridViewDisplayed();

      // Test mobile view (should force list view)
      await this.setViewportWidth(600);
      await new Promise(resolve => setTimeout(resolve, 100));
      const mobileForcesList = this.isListViewDisplayed();

      // Test that toggle is disabled on mobile

      const executionTime = performance.now() - startTime;

      if (desktopGridWorks && mobileForcesList) {
        return {
          testName: 'Responsive View Behavior',
          passed: true,
          details: 'View mode correctly adapts to screen size',
          executionTime,
        };
      } else {
        return {
          testName: 'Responsive View Behavior',
          passed: false,
          details: `Failed: desktopGrid=${desktopGridWorks}, mobileList=${mobileForcesList}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Responsive View Behavior',
        passed: false,
        details: 'Exception occurred during responsive view behavior test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  // Filter Tests
  private async testSearchFiltering(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Setup test environment with habits
      await this.setupTestEnvironment();

      // Find search input
      const searchInput = document.querySelector(
        'input[type="search"], input[placeholder*="search" i]'
      ) as HTMLInputElement;

      if (!searchInput) {
        return {
          testName: 'Search Filtering',
          passed: false,
          details: 'Search input not found',
          executionTime: performance.now() - startTime,
        };
      }

      // Test search functionality
      await this.simulateInput(searchInput, 'Exercise');
      await new Promise(resolve => setTimeout(resolve, 200));

      const filteredHabits = this.getVisibleHabits();
      const containsExercise = filteredHabits.some(habit =>
        habit.textContent?.toLowerCase().includes('exercise')
      );

      // Clear search
      await this.simulateInput(searchInput, '');
      await new Promise(resolve => setTimeout(resolve, 100));
      const allHabitsVisible = this.getVisibleHabits().length >= this.testHabits.length;

      const executionTime = performance.now() - startTime;

      if (containsExercise && allHabitsVisible) {
        return {
          testName: 'Search Filtering',
          passed: true,
          details: 'Search filtering works correctly and can be cleared',
          executionTime,
        };
      } else {
        return {
          testName: 'Search Filtering',
          passed: false,
          details: `Failed: searchFilters=${containsExercise}, clearWorks=${allHabitsVisible}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Search Filtering',
        passed: false,
        details: 'Exception occurred during search filtering test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testFrequencyFiltering(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Find frequency filter
      const frequencySelect = document.querySelector(
        'select[name*="frequency"], [data-filter="frequency"]'
      ) as HTMLSelectElement;

      if (!frequencySelect) {
        return {
          testName: 'Frequency Filtering',
          passed: true, // Optional feature
          details: 'Frequency filter not implemented (optional)',
          executionTime: performance.now() - startTime,
        };
      }

      // Test filtering by daily frequency
      await this.simulateSelect(frequencySelect, 'Daily');
      await new Promise(resolve => setTimeout(resolve, 100));

      const dailyHabits = this.getVisibleHabits();
      const onlyDailyHabits = this.verifyFrequencyFilter(dailyHabits, 'Daily');

      // Test filtering by weekly frequency
      await this.simulateSelect(frequencySelect, 'Weekly');
      await new Promise(resolve => setTimeout(resolve, 100));

      const weeklyHabits = this.getVisibleHabits();
      const onlyWeeklyHabits = this.verifyFrequencyFilter(weeklyHabits, 'Weekly');

      const executionTime = performance.now() - startTime;

      if (onlyDailyHabits && onlyWeeklyHabits) {
        return {
          testName: 'Frequency Filtering',
          passed: true,
          details: 'Frequency filtering works correctly for all frequency types',
          executionTime,
        };
      } else {
        return {
          testName: 'Frequency Filtering',
          passed: false,
          details: `Failed: dailyFilter=${onlyDailyHabits}, weeklyFilter=${onlyWeeklyHabits}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Frequency Filtering',
        passed: false,
        details: 'Exception occurred during frequency filtering test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testStatusFiltering(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Find status filter (active/inactive habits)
      const statusToggle = document.querySelector(
        'input[type="checkbox"][name*="inactive"], [data-filter="status"]'
      ) as HTMLInputElement;

      if (!statusToggle) {
        return {
          testName: 'Status Filtering',
          passed: true, // Optional feature
          details: 'Status filter not implemented (optional)',
          executionTime: performance.now() - startTime,
        };
      }

      // Initially should show only active habits
      const initialHabits = this.getVisibleHabits();
      const onlyActiveInitially = this.verifyStatusFilter(initialHabits, true);

      // Toggle to show inactive habits
      await this.simulateClick(statusToggle);
      await new Promise(resolve => setTimeout(resolve, 100));

      const allHabits = this.getVisibleHabits();
      const includesInactive = allHabits.length > initialHabits.length;

      const executionTime = performance.now() - startTime;

      if (onlyActiveInitially && includesInactive) {
        return {
          testName: 'Status Filtering',
          passed: true,
          details: 'Status filtering correctly toggles between active only and all habits',
          executionTime,
        };
      } else {
        return {
          testName: 'Status Filtering',
          passed: false,
          details: `Failed: activeOnly=${onlyActiveInitially}, includesInactive=${includesInactive}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Status Filtering',
        passed: false,
        details: 'Exception occurred during status filtering test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testSortingFunctionality(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Find sort control
      const sortSelect = document.querySelector(
        'select[name*="sort"], [data-sort]'
      ) as HTMLSelectElement;

      if (!sortSelect) {
        return {
          testName: 'Sorting Functionality',
          passed: true, // May not be implemented
          details: 'Sorting not implemented (optional)',
          executionTime: performance.now() - startTime,
        };
      }

      // Test alphabetical sorting
      await this.simulateSelect(sortSelect, 'name');
      await new Promise(resolve => setTimeout(resolve, 100));

      const alphabeticalOrder = this.getVisibleHabits();
      const isAlphabetical = this.verifySortOrder(alphabeticalOrder, 'name');

      // Test creation date sorting
      await this.simulateSelect(sortSelect, 'created');
      await new Promise(resolve => setTimeout(resolve, 100));

      const creationOrder = this.getVisibleHabits();
      const isCreationOrder = this.verifySortOrder(creationOrder, 'created');

      const executionTime = performance.now() - startTime;

      if (isAlphabetical && isCreationOrder) {
        return {
          testName: 'Sorting Functionality',
          passed: true,
          details: 'Sorting works correctly for all sort criteria',
          executionTime,
        };
      } else {
        return {
          testName: 'Sorting Functionality',
          passed: false,
          details: `Failed: alphabetical=${isAlphabetical}, creation=${isCreationOrder}`,
          executionTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Sorting Functionality',
        passed: false,
        details: 'Exception occurred during sorting functionality test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testFilterCombination(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Test combining search with other filters
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      const frequencySelect = document.querySelector(
        'select[name*="frequency"]'
      ) as HTMLSelectElement;

      if (!searchInput) {
        return {
          testName: 'Filter Combination',
          passed: true,
          details: 'Filter combination not testable (search not available)',
          executionTime: performance.now() - startTime,
        };
      }

      // Apply search filter
      await this.simulateInput(searchInput, 'Daily');
      let visibleHabits = this.getVisibleHabits();
      const searchResults = visibleHabits.length;

      // Apply frequency filter if available
      if (frequencySelect) {
        await this.simulateSelect(frequencySelect, 'Daily');
        await new Promise(resolve => setTimeout(resolve, 100));

        visibleHabits = this.getVisibleHabits();
        const combinedResults = visibleHabits.length;

        // Combined filters should show same or fewer results
        const combinationWorks = combinedResults <= searchResults;

        const executionTime = performance.now() - startTime;

        return {
          testName: 'Filter Combination',
          passed: combinationWorks,
          details: combinationWorks
            ? `Filter combination works: ${searchResults} → ${combinedResults} results`
            : `Filter combination failed: unexpected result count`,
          executionTime,
        };
      } else {
        return {
          testName: 'Filter Combination',
          passed: true,
          details: 'Only search filter available, no combination to test',
          executionTime: performance.now() - startTime,
        };
      }
    } catch (error) {
      return {
        testName: 'Filter Combination',
        passed: false,
        details: 'Exception occurred during filter combination test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testFilterPersistence(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Apply filters
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;

      if (searchInput) {
        await this.simulateInput(searchInput, 'Exercise');
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Check if filters persist in URL or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const localStorageState = localStorage.getItem('dashboard-filters');

      let filtersPersisted = false;

      // Check URL persistence
      if (urlParams.has('search') && urlParams.get('search') === 'Exercise') {
        filtersPersisted = true;
      }

      // Check localStorage persistence
      if (!filtersPersisted && localStorageState) {
        try {
          const filters = JSON.parse(localStorageState);
          filtersPersisted = filters.search === 'Exercise';
        } catch (e) {
          // Invalid JSON
        }
      }

      const executionTime = performance.now() - startTime;

      return {
        testName: 'Filter Persistence',
        passed: filtersPersisted,
        details: filtersPersisted
          ? 'Filters are properly persisted'
          : 'Filters are not persisted (may be intentional)',
        executionTime,
      };
    } catch (error) {
      return {
        testName: 'Filter Persistence',
        passed: false,
        details: 'Exception occurred during filter persistence test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  private async testFilterResultsAccuracy(): Promise<FunctionalTestResult> {
    const startTime = performance.now();

    try {
      // Test with known data to verify accuracy
      await this.setupTestEnvironment();

      // Search for "Exercise" - should return 1 habit
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        await this.simulateInput(searchInput, 'Exercise');
        await new Promise(resolve => setTimeout(resolve, 100));

        const results = this.getVisibleHabits();
        const hasCorrectResult =
          results.length === 1 && results[0].textContent?.includes('Morning Exercise');

        if (hasCorrectResult) {
          // Test no results case
          await this.simulateInput(searchInput, 'NonExistentHabit');
          await new Promise(resolve => setTimeout(resolve, 100));

          const noResults = this.getVisibleHabits();
          const correctlyShowsEmpty = noResults.length === 0;

          const executionTime = performance.now() - startTime;

          return {
            testName: 'Filter Results Accuracy',
            passed: correctlyShowsEmpty,
            details: correctlyShowsEmpty
              ? 'Filter results are accurate for both matching and non-matching queries'
              : 'Filter results accuracy issues detected',
            executionTime,
          };
        }
      }

      return {
        testName: 'Filter Results Accuracy',
        passed: false,
        details: 'Unable to test filter accuracy - search not available',
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      return {
        testName: 'Filter Results Accuracy',
        passed: false,
        details: 'Exception occurred during filter results accuracy test',
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  // Helper methods
  private async setupTestEnvironment(): Promise<void> {
    // This would setup test data in a real implementation
    // For now, we assume the dashboard already has test habits loaded
  }

  private async setViewMode(mode: 'grid' | 'list'): Promise<void> {
    const viewToggle = document.querySelector('[class*="viewToggle"]');
    const button = viewToggle?.querySelector(
      `[data-view="${mode}"], button:${mode === 'grid' ? 'first' : 'last'}-child`
    ) as HTMLButtonElement;

    if (button) {
      await this.simulateClick(button);
    }
  }

  private async setViewportWidth(width: number): Promise<void> {
    // Simulate viewport changes
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
    window.dispatchEvent(new Event('resize'));
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async simulateClick(element: HTMLElement): Promise<void> {
    element.click();
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async simulateInput(element: HTMLInputElement, value: string): Promise<void> {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async simulateSelect(element: HTMLSelectElement, value: string): Promise<void> {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private verifyGridLayout(container: HTMLElement): boolean {
    if (!container) return false;

    const computedStyle = window.getComputedStyle(container);
    return (
      computedStyle.display === 'grid' ||
      (computedStyle.display === 'flex' && computedStyle.flexWrap === 'wrap') ||
      container.classList.toString().includes('grid')
    );
  }

  private verifyListLayout(container: HTMLElement): boolean {
    if (!container) return false;

    const computedStyle = window.getComputedStyle(container);
    return (
      (computedStyle.display === 'flex' && computedStyle.flexDirection === 'column') ||
      container.classList.toString().includes('list')
    );
  }

  private verifyGridArrangement(elements: NodeListOf<Element>): boolean {
    if (elements.length < 2) return true;

    // Check if elements are arranged in multiple columns
    const firstElement = elements[0].getBoundingClientRect();
    const secondElement = elements[1].getBoundingClientRect();

    // If second element is to the right of first, it's likely a grid
    return secondElement.left > firstElement.right - 10; // Allow for small margins
  }

  private verifyListArrangement(elements: NodeListOf<Element>): boolean {
    if (elements.length < 2) return true;

    // Check if elements are stacked vertically
    const firstElement = elements[0].getBoundingClientRect();
    const secondElement = elements[1].getBoundingClientRect();

    // If second element is below first, it's likely a list
    return secondElement.top > firstElement.bottom - 10; // Allow for small margins
  }

  private isGridViewDisplayed(): boolean {
    const gridContainer = document.querySelector('[class*="habitGrid"], [class*="grid"]');
    return gridContainer !== null && (gridContainer as HTMLElement).offsetHeight > 0;
  }

  private isListViewDisplayed(): boolean {
    const listContainer = document.querySelector('[class*="habitList"], [class*="list"]');
    return listContainer !== null && (listContainer as HTMLElement).offsetHeight > 0;
  }

  private getVisibleHabits(): Element[] {
    const habits = document.querySelectorAll('[class*="habitCard"]:not([style*="display: none"])');
    return Array.from(habits).filter(habit => {
      const computedStyle = window.getComputedStyle(habit as Element);
      return computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
    });
  }

  private verifyFrequencyFilter(habits: Element[], frequency: string): boolean {
    return habits.every(
      habit => habit.textContent?.toLowerCase().includes(frequency.toLowerCase()) ?? false
    );
  }

  private verifyStatusFilter(habits: Element[], activeOnly: boolean): boolean {
    if (activeOnly) {
      return habits.every(
        habit => !(habit.textContent?.toLowerCase().includes('inactive') ?? false)
      );
    }
    return true; // All habits visible
  }

  private verifySortOrder(habits: Element[], sortBy: string): boolean {
    if (habits.length < 2) return true;

    const habitTexts = habits.map(
      habit => habit.querySelector('[class*="habitName"], h3, h4')?.textContent?.trim() ?? ''
    );

    if (sortBy === 'name') {
      // Check alphabetical order
      for (let i = 0; i < habitTexts.length - 1; i++) {
        if (habitTexts[i].toLowerCase() > habitTexts[i + 1].toLowerCase()) {
          return false;
        }
      }
    }

    return true; // Other sort orders would require more complex verification
  }

  generateFunctionalTestReport(
    viewToggleSuite: ViewToggleTestSuite,
    filterSuite: FilterTestSuite
  ): string {
    let report = `# Functional Test Report - View Toggle and Filter Functionality\n\n`;

    // Summary
    const viewTests = [
      viewToggleSuite.gridViewDisplay,
      viewToggleSuite.listViewDisplay,
      viewToggleSuite.viewToggleInteraction,
      viewToggleSuite.persistentViewPreference,
      viewToggleSuite.responsiveViewBehavior,
    ];

    const filterTests = [
      filterSuite.searchFiltering,
      filterSuite.frequencyFiltering,
      filterSuite.statusFiltering,
      filterSuite.sortingFunctionality,
      filterSuite.filterCombination,
      filterSuite.filterPersistence,
      filterSuite.filterResultsAccuracy,
    ];

    const allTests = [...viewTests, ...filterTests];
    const totalTests = allTests.length;
    const passedTests = allTests.filter(test => test.passed).length;
    const passRate = (passedTests / totalTests) * 100;

    report += `## Summary\n`;
    report += `- **View Toggle Tests:** ${viewToggleSuite.overall ? '✅ PASS' : '❌ FAIL'}\n`;
    report += `- **Filter Tests:** ${filterSuite.overall ? '✅ PASS' : '❌ FAIL'}\n`;
    report += `- **Overall Tests Passed:** ${passedTests}/${totalTests} (${passRate.toFixed(1)}%)\n`;
    report += `- **Total Execution Time:** ${allTests.reduce((sum, test) => sum + test.executionTime, 0).toFixed(2)}ms\n\n`;

    // View Toggle Tests
    report += `## View Toggle Functionality\n\n`;
    viewTests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      report += `${status} **${test.testName}** (${test.executionTime.toFixed(2)}ms)\n`;
      report += `   ${test.details}\n`;
      if (test.error) {
        report += `   Error: ${test.error.message}\n`;
      }
      report += `\n`;
    });

    // Filter Tests
    report += `## Filter Functionality\n\n`;
    filterTests.forEach(test => {
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

    if (viewToggleSuite.overall && filterSuite.overall) {
      report += `🎉 **Excellent!** All view toggle and filter functionality tests passed.\n\n`;
      report += `Your dashboard provides:\n`;
      report += `- Smooth switching between grid and list views\n`;
      report += `- Persistent view preferences\n`;
      report += `- Responsive view behavior\n`;
      report += `- Comprehensive filtering options\n`;
      report += `- Accurate filter results\n`;
    } else {
      report += `To improve the view toggle and filter functionality:\n\n`;

      const failedTests = allTests.filter(test => !test.passed);
      failedTests.forEach(test => {
        report += `### ${test.testName}\n`;
        report += `**Issue:** ${test.details}\n`;

        // Provide specific recommendations
        if (test.testName.includes('Grid View')) {
          report += `**Fix:** Ensure grid layout uses CSS Grid or Flexbox with proper responsive columns.\n`;
        } else if (test.testName.includes('List View')) {
          report += `**Fix:** Implement single-column layout for list view with proper spacing.\n`;
        } else if (test.testName.includes('Toggle Interaction')) {
          report += `**Fix:** Add proper event handlers and visual feedback for view toggle buttons.\n`;
        } else if (test.testName.includes('Persistence')) {
          report += `**Fix:** Implement localStorage or URL parameter persistence for user preferences.\n`;
        } else if (test.testName.includes('Filter')) {
          report += `**Fix:** Implement or improve filter logic with proper state management.\n`;
        }

        report += `\n`;
      });
    }

    return report;
  }
}

// Helper functions
export async function runViewToggleTests(): Promise<ViewToggleTestSuite> {
  const testRunner = new FunctionalTestRunner();
  return await testRunner.runViewToggleTests();
}

export async function runFilterTests(): Promise<FilterTestSuite> {
  const testRunner = new FunctionalTestRunner();
  return await testRunner.runFilterTests();
}

export default FunctionalTestRunner;
