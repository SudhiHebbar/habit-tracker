import React, { useState } from 'react';
import type { FrequencyType, CustomFrequency } from '../types/habit.types';
import styles from './FrequencySelector.module.css';

interface FrequencySelectorProps {
  selectedFrequency: FrequencyType;
  customFrequency?: CustomFrequency;
  onFrequencyChange: (frequency: FrequencyType, customFrequency?: CustomFrequency) => void;
  className?: string;
  disabled?: boolean;
}

const PRESET_FREQUENCIES = [
  {
    type: 'Daily' as FrequencyType,
    label: 'Daily',
    description: 'Every day',
    icon: '📅',
  },
  {
    type: 'Weekly' as FrequencyType,
    label: 'Weekly',
    description: 'Once per week',
    icon: '📆',
  },
  {
    type: 'Custom' as FrequencyType,
    label: 'Custom',
    description: 'Set your own schedule',
    icon: '⚙️',
  },
];

const DAYS_OF_WEEK = [
  { short: 'Sun', full: 'Sunday' },
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
];

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  selectedFrequency,
  customFrequency,
  onFrequencyChange,
  className = '',
  disabled = false,
}) => {
  const [localCustomFrequency, setLocalCustomFrequency] = useState<CustomFrequency>(
    customFrequency || {
      timesPerWeek: 3,
      specificDays: [],
      timesPerMonth: null,
    }
  );

  const handleFrequencyTypeChange = (frequency: FrequencyType) => {
    if (disabled) return;

    if (frequency === 'Custom') {
      onFrequencyChange(frequency, localCustomFrequency);
    } else {
      onFrequencyChange(frequency);
    }
  };

  const handleCustomFrequencyChange = (updates: Partial<CustomFrequency>) => {
    if (disabled) return;

    const newCustomFrequency = { ...localCustomFrequency, ...updates };
    setLocalCustomFrequency(newCustomFrequency);

    if (selectedFrequency === 'Custom') {
      onFrequencyChange('Custom', newCustomFrequency);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    if (disabled) return;

    const currentDays = localCustomFrequency.specificDays || [];
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter(day => day !== dayIndex)
      : [...currentDays, dayIndex].sort();

    handleCustomFrequencyChange({ specificDays: newDays });
  };

  const renderFrequencyOption = (option: (typeof PRESET_FREQUENCIES)[0]) => (
    <label
      key={option.type}
      className={`${styles.frequencyOption} ${
        selectedFrequency === option.type ? styles.selected : ''
      } ${disabled ? styles.disabled : ''}`}
    >
      <input
        type='radio'
        name='frequency'
        value={option.type}
        checked={selectedFrequency === option.type}
        onChange={() => handleFrequencyTypeChange(option.type)}
        disabled={disabled}
        className={styles.radioInput}
      />
      <div className={styles.optionContent}>
        <div className={styles.optionHeader}>
          <span className={styles.optionIcon}>{option.icon}</span>
          <span className={styles.optionLabel}>{option.label}</span>
        </div>
        <span className={styles.optionDescription}>{option.description}</span>
      </div>
    </label>
  );

  return (
    <div className={`${styles.frequencySelector} ${className}`}>
      {/* Frequency Type Selection */}
      <div className={styles.frequencyOptions}>{PRESET_FREQUENCIES.map(renderFrequencyOption)}</div>

      {/* Custom Frequency Configuration */}
      {selectedFrequency === 'Custom' && (
        <div className={styles.customFrequencyConfig}>
          <h4 className={styles.customTitle}>Custom Frequency Settings</h4>

          {/* Times Per Week */}
          <div className={styles.customOption}>
            <label className={styles.customLabel}>
              <input
                type='radio'
                name='customType'
                checked={!localCustomFrequency.timesPerMonth}
                onChange={() => handleCustomFrequencyChange({ timesPerMonth: null })}
                disabled={disabled}
              />
              Times per week
            </label>
            {!localCustomFrequency.timesPerMonth && (
              <div className={styles.customControl}>
                <input
                  type='range'
                  min='1'
                  max='7'
                  value={localCustomFrequency.timesPerWeek}
                  onChange={e =>
                    handleCustomFrequencyChange({ timesPerWeek: parseInt(e.target.value) })
                  }
                  disabled={disabled}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeValue}>
                  {localCustomFrequency.timesPerWeek} time
                  {localCustomFrequency.timesPerWeek !== 1 ? 's' : ''} per week
                </span>
              </div>
            )}
          </div>

          {/* Times Per Month */}
          <div className={styles.customOption}>
            <label className={styles.customLabel}>
              <input
                type='radio'
                name='customType'
                checked={!!localCustomFrequency.timesPerMonth}
                onChange={() => handleCustomFrequencyChange({ timesPerMonth: 8 })}
                disabled={disabled}
              />
              Times per month
            </label>
            {localCustomFrequency.timesPerMonth && (
              <div className={styles.customControl}>
                <input
                  type='range'
                  min='1'
                  max='30'
                  value={localCustomFrequency.timesPerMonth}
                  onChange={e =>
                    handleCustomFrequencyChange({ timesPerMonth: parseInt(e.target.value) })
                  }
                  disabled={disabled}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeValue}>
                  {localCustomFrequency.timesPerMonth} time
                  {localCustomFrequency.timesPerMonth !== 1 ? 's' : ''} per month
                </span>
              </div>
            )}
          </div>

          {/* Specific Days (only for weekly frequency) */}
          {!localCustomFrequency.timesPerMonth && (
            <div className={styles.specificDays}>
              <h5 className={styles.daysTitle}>Specific Days (optional)</h5>
              <p className={styles.daysDescription}>
                Leave empty for any {localCustomFrequency.timesPerWeek} day
                {localCustomFrequency.timesPerWeek !== 1 ? 's' : ''} of the week
              </p>
              <div className={styles.daysGrid}>
                {DAYS_OF_WEEK.map((day, index) => (
                  <button
                    key={day.short}
                    type='button'
                    className={`${styles.dayButton} ${
                      localCustomFrequency.specificDays?.includes(index) ? styles.selectedDay : ''
                    }`}
                    onClick={() => handleDayToggle(index)}
                    disabled={disabled}
                    title={day.full}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
              {localCustomFrequency.specificDays &&
                localCustomFrequency.specificDays.length > 0 && (
                  <p className={styles.selectedDaysText}>
                    Selected:{' '}
                    {localCustomFrequency.specificDays
                      .map(index => DAYS_OF_WEEK[index].full)
                      .join(', ')}
                  </p>
                )}
            </div>
          )}
        </div>
      )}

      {/* Frequency Summary */}
      <div className={styles.frequencySummary}>
        <h5 className={styles.summaryTitle}>Frequency Summary</h5>
        <p className={styles.summaryText}>
          {selectedFrequency === 'Daily' && 'Complete this habit every day'}
          {selectedFrequency === 'Weekly' && 'Complete this habit once per week'}
          {selectedFrequency === 'Custom' &&
            (() => {
              if (localCustomFrequency.timesPerMonth) {
                return `Complete this habit ${localCustomFrequency.timesPerMonth} time${localCustomFrequency.timesPerMonth !== 1 ? 's' : ''} per month`;
              } else {
                const specificDays = localCustomFrequency.specificDays || [];
                if (specificDays.length > 0) {
                  const dayNames = specificDays.map(index => DAYS_OF_WEEK[index].full);
                  return `Complete this habit on ${dayNames.join(', ')}`;
                } else {
                  return `Complete this habit ${localCustomFrequency.timesPerWeek} time${localCustomFrequency.timesPerWeek !== 1 ? 's' : ''} per week`;
                }
              }
            })()}
        </p>
      </div>
    </div>
  );
};

export default FrequencySelector;
