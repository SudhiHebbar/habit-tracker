import React, { useMemo } from 'react';
import { IconLibrary } from '../services/iconLibrary';
import { ContrastCalculator } from '../services/contrastCalculator';
import { ColorSystem } from '../services/colorSystem';
import type { IconOption } from '../services/iconLibrary';
import styles from './CustomizationPreview.module.css';

interface CustomizationPreviewProps {
  color: string;
  iconId?: string | null;
  habitName?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showInContext?: boolean;
  contexts?: ('dashboard' | 'list' | 'card' | 'detail')[];
  showAccessibilityInfo?: boolean;
  animated?: boolean;
}

export const CustomizationPreview: React.FC<CustomizationPreviewProps> = ({
  color,
  iconId,
  habitName = 'Sample Habit',
  className = '',
  size = 'medium',
  showInContext = true,
  contexts = ['dashboard', 'list', 'card'],
  showAccessibilityInfo = true,
  animated = true,
}) => {
  // Get icon data
  const icon = useMemo(() => {
    return iconId ? IconLibrary.getIconById(iconId) : null;
  }, [iconId]);

  // Color information
  const colorInfo = useMemo(() => {
    return ColorSystem.getColorByHex(color);
  }, [color]);

  // Accessibility analysis
  const accessibilityInfo = useMemo(() => {
    return {
      onWhite: ContrastCalculator.analyzeContrast(color, '#FFFFFF'),
      onLight: ContrastCalculator.analyzeContrast(color, '#F9FAFB'),
      onDark: ContrastCalculator.analyzeContrast(color, '#374151'),
    };
  }, [color]);

  // Best text color for the selected color
  const textColor = useMemo(() => {
    return ColorSystem.getTextColor(color);
  }, [color]);

  // Render icon with color
  const renderIcon = (iconData: IconOption | null | undefined, className?: string) => {
    if (!iconData) {
      return (
        <div className={`${styles.placeholderIcon} ${className || ''}`}>
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
          </svg>
        </div>
      );
    }

    return (
      <div
        className={`${styles.iconDisplay} ${className || ''}`}
        style={{ color }}
        dangerouslySetInnerHTML={{ __html: iconData.svg }}
      />
    );
  };

  // Dashboard context preview
  const renderDashboardPreview = () => (
    <div className={styles.dashboardPreview}>
      <h4 className={styles.contextTitle}>Dashboard View</h4>
      <div className={styles.habitCard} style={{ borderColor: color }}>
        <div className={styles.habitHeader}>
          {renderIcon(icon || null, styles.habitIcon)}
          <div className={styles.habitInfo}>
            <span className={styles.habitName}>{habitName}</span>
            <span className={styles.habitStreak}>7 day streak</span>
          </div>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              backgroundColor: color,
              width: '70%',
            }}
          />
        </div>
        <div className={styles.completionButton} style={{ backgroundColor: color }}>
          <svg viewBox='0 0 20 20' fill='currentColor' style={{ color: textColor }}>
            <path
              fillRule='evenodd'
              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
        </div>
      </div>
    </div>
  );

  // List context preview
  const renderListPreview = () => (
    <div className={styles.listPreview}>
      <h4 className={styles.contextTitle}>List View</h4>
      <div className={styles.habitListItem}>
        <div className={styles.habitIndicator} style={{ backgroundColor: color }} />
        {renderIcon(icon || null, styles.listIcon)}
        <div className={styles.listHabitInfo}>
          <span className={styles.listHabitName}>{habitName}</span>
          <span className={styles.listHabitDetails}>Daily • 7 day streak</span>
        </div>
        <div className={styles.listCompletion} style={{ color }}>
          <div className={styles.completionDots}>
            <div className={styles.completionDot} style={{ backgroundColor: color }} />
            <div className={styles.completionDot} style={{ backgroundColor: color }} />
            <div className={styles.completionDot} style={{ backgroundColor: color }} />
            <div className={`${styles.completionDot} ${styles.incomplete}`} />
            <div className={`${styles.completionDot} ${styles.incomplete}`} />
          </div>
        </div>
      </div>
    </div>
  );

  // Card context preview
  const renderCardPreview = () => (
    <div className={styles.cardPreview}>
      <h4 className={styles.contextTitle}>Card View</h4>
      <div
        className={styles.compactCard}
        style={{
          backgroundColor: color,
          color: textColor,
        }}
      >
        <div className={styles.cardContent}>
          {renderIcon(icon || null, styles.cardIcon)}
          <div className={styles.cardText}>
            <span className={styles.cardHabitName}>{habitName}</span>
            <span className={styles.cardStreak}>7 days</span>
          </div>
        </div>
        <div className={styles.cardProgress}>
          <div className={styles.cardProgressTrack}>
            <div
              className={styles.cardProgressFill}
              style={{
                backgroundColor: textColor,
                opacity: 0.3,
                width: '70%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Detail context preview
  const renderDetailPreview = () => (
    <div className={styles.detailPreview}>
      <h4 className={styles.contextTitle}>Detail View</h4>
      <div className={styles.detailCard}>
        <div className={styles.detailHeader} style={{ backgroundColor: color }}>
          <div className={styles.detailIconContainer} style={{ color: textColor }}>
            {renderIcon(icon || null, styles.detailIcon)}
          </div>
          <div className={styles.detailInfo} style={{ color: textColor }}>
            <h3 className={styles.detailHabitName}>{habitName}</h3>
            <p className={styles.detailDescription}>Daily habit tracking</p>
          </div>
        </div>
        <div className={styles.detailBody}>
          <div className={styles.detailStats}>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color }}>
                7
              </span>
              <span className={styles.statLabel}>Current Streak</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color }}>
                85%
              </span>
              <span className={styles.statLabel}>This Month</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color }}>
                23
              </span>
              <span className={styles.statLabel}>Total Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render accessibility information
  const renderAccessibilityInfo = () => {
    if (!showAccessibilityInfo) return null;

    return (
      <div className={styles.accessibilityInfo}>
        <h4 className={styles.accessibilityTitle}>Accessibility Analysis</h4>
        <div className={styles.accessibilityGrid}>
          <div className={styles.accessibilityItem}>
            <span className={styles.accessibilityLabel}>On White:</span>
            <div className={styles.accessibilityBadge}>
              <span className={styles.ratio}>
                {accessibilityInfo.onWhite.contrast.ratio.toFixed(1)}:1
              </span>
              <span
                className={`${styles.grade} ${styles[accessibilityInfo.onWhite.contrast.wcagAA ? 'pass' : 'fail']}`}
              >
                {accessibilityInfo.onWhite.contrast.grade}
              </span>
            </div>
          </div>

          <div className={styles.accessibilityItem}>
            <span className={styles.accessibilityLabel}>On Light:</span>
            <div className={styles.accessibilityBadge}>
              <span className={styles.ratio}>
                {accessibilityInfo.onLight.contrast.ratio.toFixed(1)}:1
              </span>
              <span
                className={`${styles.grade} ${styles[accessibilityInfo.onLight.contrast.wcagAA ? 'pass' : 'fail']}`}
              >
                {accessibilityInfo.onLight.contrast.grade}
              </span>
            </div>
          </div>

          <div className={styles.accessibilityItem}>
            <span className={styles.accessibilityLabel}>On Dark:</span>
            <div className={styles.accessibilityBadge}>
              <span className={styles.ratio}>
                {accessibilityInfo.onDark.contrast.ratio.toFixed(1)}:1
              </span>
              <span
                className={`${styles.grade} ${styles[accessibilityInfo.onDark.contrast.wcagAA ? 'pass' : 'fail']}`}
              >
                {accessibilityInfo.onDark.contrast.grade}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Color and icon information
  const renderCustomizationInfo = () => (
    <div className={styles.customizationInfo}>
      <div className={styles.colorInfo}>
        <div className={styles.colorSwatch} style={{ backgroundColor: color }} />
        <div className={styles.colorDetails}>
          <span className={styles.colorHex}>{color}</span>
          {colorInfo && <span className={styles.colorName}>{colorInfo.name}</span>}
        </div>
      </div>

      {icon && (
        <div className={styles.iconInfo}>
          <div className={styles.iconPreview} style={{ color }}>
            <div dangerouslySetInnerHTML={{ __html: icon.svg }} />
          </div>
          <div className={styles.iconDetails}>
            <span className={styles.iconName}>{icon.name}</span>
            <span className={styles.iconCategory}>{icon.category}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`${styles.customizationPreview} ${styles[size]} ${className} ${animated ? styles.animated : ''}`}
    >
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>Preview</h3>
        {renderCustomizationInfo()}
      </div>

      {showInContext && (
        <div className={styles.contextPreviews}>
          {contexts.includes('dashboard') && renderDashboardPreview()}
          {contexts.includes('list') && renderListPreview()}
          {contexts.includes('card') && renderCardPreview()}
          {contexts.includes('detail') && renderDetailPreview()}
        </div>
      )}

      {renderAccessibilityInfo()}

      {/* Quick comparison */}
      <div className={styles.quickComparison}>
        <h4 className={styles.comparisonTitle}>Quick Comparison</h4>
        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonItem}>
            <div className={styles.comparisonSample} style={{ backgroundColor: '#F9FAFB', color }}>
              <div className={styles.sampleIcon}>{renderIcon(icon || null)}</div>
              <span className={styles.sampleText}>Light Background</span>
            </div>
          </div>
          <div className={styles.comparisonItem}>
            <div className={styles.comparisonSample} style={{ backgroundColor: '#374151', color }}>
              <div className={styles.sampleIcon}>{renderIcon(icon || null)}</div>
              <span className={styles.sampleText}>Dark Background</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPreview;
