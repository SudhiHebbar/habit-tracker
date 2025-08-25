import React from 'react';
import { Label } from '../../../shared/components/Typography/Label';
import { Text } from '../../../shared/components/Typography/Text';
import styles from '../../../../styles/features/dashboard/FilterSortControls.module.css';

interface FilterSortControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'name' | 'frequency' | 'completion';
  onSortChange: (sort: 'name' | 'frequency' | 'completion') => void;
  filterFrequency: string;
  onFilterChange: (frequency: string) => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterSortControls: React.FC<FilterSortControlsProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterFrequency,
  onFilterChange,
  totalCount,
  filteredCount,
}) => {
  const hasActiveFilters = searchQuery || filterFrequency;

  const clearFilters = () => {
    onSearchChange('');
    onFilterChange('');
  };

  return (
    <div className={styles.filterControls}>
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <svg
            viewBox='0 0 20 20'
            fill='currentColor'
            className={styles.searchIcon}
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
              clipRule='evenodd'
            />
          </svg>
          <input
            type='text'
            placeholder='Search habits...'
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className={styles.searchInput}
            aria-label='Search habits'
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={styles.clearButton}
              aria-label='Clear search'
            >
              <svg viewBox='0 0 20 20' fill='currentColor' className={styles.clearIcon}>
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={styles.filterOptions}>
        <div className={styles.filterGroup}>
          <Label htmlFor='frequency-filter' size='sm'>
            Frequency
          </Label>
          <select
            id='frequency-filter'
            value={filterFrequency}
            onChange={e => onFilterChange(e.target.value)}
            className={styles.select}
          >
            <option value=''>All</option>
            <option value='Daily'>Daily</option>
            <option value='Weekly'>Weekly</option>
            <option value='Custom'>Custom</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <Label htmlFor='sort-by' size='sm'>
            Sort by
          </Label>
          <select
            id='sort-by'
            value={sortBy}
            onChange={e => onSortChange(e.target.value as 'name' | 'frequency' | 'completion')}
            className={styles.select}
          >
            <option value='name'>Name</option>
            <option value='frequency'>Frequency</option>
            <option value='completion'>Completion</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={styles.clearFiltersButton}
            aria-label='Clear all filters'
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredCount < totalCount && (
        <div className={styles.filterStatus}>
          <Text size='sm' color='tertiary'>
            Showing {filteredCount} of {totalCount} habits
          </Text>
        </div>
      )}
    </div>
  );
};

export default FilterSortControls;
