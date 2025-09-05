import React from 'react';
import { ColorSwatch } from './ColorSwatch';
import { IconDisplay } from './IconDisplay';
import { ColorSystem } from '../../services/colorSystem';
import { IconLibrary } from '../../services/iconLibrary';
import { ContrastCalculator } from '../../services/contrastCalculator';
import styles from './PreviewCard.module.css';

interface PreviewCardProps {
  title: string;
  description?: string;
  color: string;
  iconId: string | null;
  context?: 'dashboard' | 'list' | 'card' | 'detail' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  showMockData?: boolean;
  showAccessibilityInfo?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

interface MockHabitData {
  currentStreak: number;
  completedToday: boolean;
  totalCompletions: number;
  weekProgress: boolean[];
  lastCompleted?: string;
}

const DEFAULT_MOCK_DATA: MockHabitData = {
  currentStreak: 12,
  completedToday: true,
  totalCompletions: 85,
  weekProgress: [true, true, false, true, true, true, false],
  lastCompleted: 'Today',
};

export const PreviewCard: React.FC<PreviewCardProps> = ({
  title,
  description,
  color,
  iconId,
  context = 'card',
  size = 'medium',
  showMockData = true,
  showAccessibilityInfo = false,
  interactive = false,
  onClick,
  className = '',
  style,
  testId,
}) => {
  const mockData = DEFAULT_MOCK_DATA;
  const colorInfo = ColorSystem.getColorByHex(color);
  const icon = iconId ? IconLibrary.getIconById(iconId) : null;
  const textColor = ColorSystem.getTextColor(color);
  const contrastInfo = ContrastCalculator.analyzeContrast(color, '#FFFFFF');

  const renderDashboardPreview = () => (
    <div className={styles.dashboardPreview}>
      <div className={styles.habitTile} style={{ backgroundColor: color }}>
        <div className={styles.tileHeader}>
          <IconDisplay iconId={iconId} size='medium' color={textColor} showTooltip={false} />
          <div className={styles.streakBadge} style={{ color: textColor }}>
            {mockData.currentStreak}
          </div>
        </div>
        <h4 className={styles.tileTitle} style={{ color: textColor }}>
          {title}
        </h4>
        <div className={styles.tileProgress}>
          {mockData.weekProgress.map((completed, index) => (
            <div
              key={index}
              className={`${styles.progressDot} ${completed ? styles.completed : ''}`}
              style={{
                backgroundColor: completed ? textColor : 'transparent',
                borderColor: textColor,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderListPreview = () => (
    <div className={styles.listPreview}>
      <div className={styles.listItem}>
        <div className={styles.itemLeft}>
          <ColorSwatch
            color={color}
            size='small'
            showTooltip={false}
            className={styles.itemColor}
          />
          <IconDisplay
            iconId={iconId}
            size='small'
            showTooltip={false}
            className={styles.itemIcon}
          />
          <div className={styles.itemInfo}>
            <h4 className={styles.itemTitle}>{title}</h4>
            {description && <p className={styles.itemDescription}>{description}</p>}
          </div>
        </div>
        <div className={styles.itemRight}>
          <div className={styles.itemStreak}>
            <span className={styles.streakNumber}>{mockData.currentStreak}</span>
            <span className={styles.streakLabel}>day streak</span>
          </div>
          <div
            className={`${styles.statusIndicator} ${mockData.completedToday ? styles.completed : ''}`}
            style={{
              backgroundColor: mockData.completedToday ? color : 'transparent',
              borderColor: color,
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderCardPreview = () => (
    <div className={styles.cardPreview}>
      <div className={styles.previewCard} style={{ borderTopColor: color }}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            <IconDisplay iconId={iconId} size='medium' color={color} showTooltip={false} />
          </div>
          <div className={styles.cardActions}>
            <ColorSwatch color={color} size='small' showTooltip={false} />
          </div>
        </div>

        <div className={styles.cardContent}>
          <h4 className={styles.cardTitle}>{title}</h4>
          {description && <p className={styles.cardDescription}>{description}</p>}

          {showMockData && (
            <div className={styles.cardStats}>
              <div className={styles.stat}>
                <span className={styles.statValue} style={{ color }}>
                  {mockData.currentStreak}
                </span>
                <span className={styles.statLabel}>Current Streak</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{mockData.totalCompletions}</span>
                <span className={styles.statLabel}>Total</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.weekProgress}>
            {mockData.weekProgress.map((completed, index) => (
              <div
                key={index}
                className={`${styles.progressDay} ${completed ? styles.completed : ''}`}
                style={{
                  backgroundColor: completed ? color : 'var(--color-gray-200, #e5e7eb)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailPreview = () => (
    <div className={styles.detailPreview}>
      <div className={styles.detailHeader} style={{ backgroundColor: color }}>
        <IconDisplay
          iconId={iconId}
          size='large'
          color={textColor}
          showTooltip={false}
          className={styles.detailIcon}
        />
        <div className={styles.detailInfo} style={{ color: textColor }}>
          <h3 className={styles.detailTitle}>{title}</h3>
          {description && <p className={styles.detailDescription}>{description}</p>}
        </div>
      </div>

      <div className={styles.detailBody}>
        <div className={styles.detailStats}>
          <div className={styles.primaryStat}>
            <span className={styles.primaryValue} style={{ color }}>
              {mockData.currentStreak}
            </span>
            <span className={styles.primaryLabel}>Day Streak</span>
          </div>

          <div className={styles.secondaryStats}>
            <div className={styles.secondaryStat}>
              <span className={styles.secondaryValue}>{mockData.totalCompletions}</span>
              <span className={styles.secondaryLabel}>Total Completions</span>
            </div>
            <div className={styles.secondaryStat}>
              <span className={styles.secondaryValue}>{mockData.lastCompleted}</span>
              <span className={styles.secondaryLabel}>Last Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinimalPreview = () => (
    <div className={styles.minimalPreview}>
      <div className={styles.minimalContent}>
        <ColorSwatch color={color} size='small' showTooltip={false} />
        <IconDisplay iconId={iconId} size='small' showTooltip={false} />
        <span className={styles.minimalTitle}>{title}</span>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (context) {
      case 'dashboard':
        return renderDashboardPreview();
      case 'list':
        return renderListPreview();
      case 'detail':
        return renderDetailPreview();
      case 'minimal':
        return renderMinimalPreview();
      case 'card':
      default:
        return renderCardPreview();
    }
  };

  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      type={interactive ? 'button' : undefined}
      className={`
        ${styles.previewCard}
        ${styles[context]}
        ${styles[size]}
        ${interactive ? styles.interactive : ''}
        ${className}
      `}
      style={style}
      onClick={interactive ? onClick : undefined}
      data-testid={testId}
      tabIndex={interactive ? 0 : undefined}
      aria-label={
        interactive
          ? `Preview: ${title} with ${colorInfo?.name || color} color and ${icon?.name || 'no'} icon`
          : undefined
      }
    >
      <div className={styles.previewContent}>{renderPreview()}</div>

      {/* Accessibility Information */}
      {showAccessibilityInfo && (
        <div className={styles.accessibilityInfo}>
          <div className={styles.accessibilityHeader}>
            <span className={styles.accessibilityTitle}>Accessibility</span>
          </div>

          <div className={styles.accessibilityDetails}>
            <div className={styles.contrastDetail}>
              <span className={styles.contrastLabel}>Contrast Ratio:</span>
              <span className={styles.contrastValue}>
                {contrastInfo.contrast.ratio.toFixed(1)}:1
              </span>
              <span
                className={`${styles.wcagBadge} ${contrastInfo.contrast.wcagAA ? styles.pass : styles.fail}`}
              >
                {contrastInfo.contrast.grade}
              </span>
            </div>

            <div className={styles.colorDetails}>
              <span className={styles.colorName}>{colorInfo?.name || 'Custom Color'}</span>
              <span className={styles.colorHex}>{color.toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hover overlay for interactive cards */}
      {interactive && (
        <div className={styles.hoverOverlay}>
          <span className={styles.hoverText}>Click to apply</span>
        </div>
      )}
    </Component>
  );
};

export default PreviewCard;
