import React, { useMemo, useState } from 'react';
import { ContrastCalculator, COMMON_BACKGROUNDS } from '../services/contrastCalculator';
import styles from './ColorContrastIndicator.module.css';

interface ColorContrastIndicatorProps {
  foregroundColor: string;
  backgroundColor?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showRatio?: boolean;
  showGrade?: boolean;
  showRecommendations?: boolean;
  testMultipleBackgrounds?: boolean;
  isLargeText?: boolean;
  interactive?: boolean;
}

export const ColorContrastIndicator: React.FC<ColorContrastIndicatorProps> = ({
  foregroundColor,
  backgroundColor = COMMON_BACKGROUNDS.WHITE,
  className = '',
  size = 'medium',
  showRatio = true,
  showGrade = true,
  showRecommendations = false,
  testMultipleBackgrounds = false,
  isLargeText = false,
  interactive = false,
}) => {
  const [selectedBackground, setSelectedBackground] = useState(backgroundColor);
  const [showDetails, setShowDetails] = useState(false);

  // Main contrast analysis
  const contrastAnalysis = useMemo(() => 
    ContrastCalculator.analyzeContrast(foregroundColor, selectedBackground),
    [foregroundColor, selectedBackground]
  );

  // Multiple background analysis if enabled
  const multipleBackgroundAnalysis = useMemo(() => 
    testMultipleBackgrounds 
      ? ContrastCalculator.testAgainstCommonBackgrounds(foregroundColor)
      : {},
    [foregroundColor, testMultipleBackgrounds]
  );

  // Accessibility status
  const accessibilityStatus = useMemo(() => 
    ContrastCalculator.getAccessibilityStatus(contrastAnalysis.contrast),
    [contrastAnalysis.contrast]
  );

  // Best text color for the current foreground
  const bestTextColor = useMemo(() => 
    ContrastCalculator.getBestTextColor(foregroundColor),
    [foregroundColor]
  );

  // Handle background color change
  const handleBackgroundChange = (newBackground: string) => {
    setSelectedBackground(newBackground);
  };

  // Toggle details view
  const toggleDetails = () => {
    if (interactive) {
      setShowDetails(!showDetails);
    }
  };

  // Render contrast badge
  const renderContrastBadge = () => {
    const { ratio, grade, wcagAA, wcagAAA } = contrastAnalysis.contrast;
    const { status, icon } = accessibilityStatus;

    return (
      <div className={`${styles.contrastBadge} ${styles[status]} ${styles[size]}`}>
        <span className={styles.icon}>{icon}</span>
        
        {showRatio && (
          <span className={styles.ratio}>
            {ratio.toFixed(1)}:1
          </span>
        )}
        
        {showGrade && (
          <span className={styles.grade}>
            {grade}
          </span>
        )}

        {/* Compliance indicators */}
        <div className={styles.complianceIcons}>
          {wcagAAA && (
            <span className={styles.complianceIcon} title="WCAG AAA Compliant">
              AAA
            </span>
          )}
          {wcagAA && !wcagAAA && (
            <span className={styles.complianceIcon} title="WCAG AA Compliant">
              AA
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render color preview
  const renderColorPreview = () => (
    <div className={styles.colorPreview}>
      <div
        className={styles.previewSwatch}
        style={{
          backgroundColor: selectedBackground,
          color: foregroundColor,
        }}
      >
        <span className={styles.previewText}>
          {isLargeText ? 'Large Text' : 'Normal Text'}
        </span>
      </div>
      <div className={styles.previewInfo}>
        <span className={styles.colorLabel}>
          Foreground: {foregroundColor}
        </span>
        <span className={styles.colorLabel}>
          Background: {selectedBackground}
        </span>
      </div>
    </div>
  );

  // Render background selector
  const renderBackgroundSelector = () => (
    <div className={styles.backgroundSelector}>
      <label className={styles.selectorLabel}>Test Background:</label>
      <div className={styles.backgroundOptions}>
        {Object.entries(COMMON_BACKGROUNDS).map(([name, hex]) => (
          <button
            key={name}
            type="button"
            className={`
              ${styles.backgroundOption}
              ${selectedBackground === hex ? styles.selected : ''}
            `}
            style={{ backgroundColor: hex }}
            onClick={() => handleBackgroundChange(hex)}
            title={`${name}: ${hex}`}
            aria-label={`Test against ${name} background (${hex})`}
          >
            <span className={styles.optionLabel}>{name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Render recommendations
  const renderRecommendations = () => {
    const { recommendations } = contrastAnalysis;
    if (!recommendations || !showRecommendations) return null;

    return (
      <div className={styles.recommendations}>
        <h4 className={styles.recommendationsTitle}>
          Accessibility Recommendations
        </h4>
        
        {recommendations.lighterVariant && (
          <div className={styles.recommendation}>
            <span className={styles.recommendationLabel}>Lighter variant:</span>
            <button
              type="button"
              className={styles.recommendationColor}
              style={{ backgroundColor: recommendations.lighterVariant }}
              onClick={() => handleBackgroundChange(recommendations.lighterVariant!)}
              title={`Use lighter variant: ${recommendations.lighterVariant}`}
            >
              {recommendations.lighterVariant}
            </button>
          </div>
        )}
        
        {recommendations.darkerVariant && (
          <div className={styles.recommendation}>
            <span className={styles.recommendationLabel}>Darker variant:</span>
            <button
              type="button"
              className={styles.recommendationColor}
              style={{ backgroundColor: recommendations.darkerVariant }}
              onClick={() => handleBackgroundChange(recommendations.darkerVariant!)}
              title={`Use darker variant: ${recommendations.darkerVariant}`}
            >
              {recommendations.darkerVariant}
            </button>
          </div>
        )}
        
        {recommendations.alternativeColors && recommendations.alternativeColors.length > 0 && (
          <div className={styles.recommendation}>
            <span className={styles.recommendationLabel}>Alternative colors:</span>
            <div className={styles.alternativeColors}>
              {recommendations.alternativeColors.slice(0, 3).map(color => (
                <button
                  key={color}
                  type="button"
                  className={styles.alternativeColor}
                  style={{ backgroundColor: color }}
                  onClick={() => handleBackgroundChange(color)}
                  title={`Use alternative: ${color}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render multiple background results
  const renderMultipleBackgroundResults = () => {
    if (!testMultipleBackgrounds) return null;

    return (
      <div className={styles.multipleResults}>
        <h4 className={styles.multipleResultsTitle}>
          Contrast Against Common Backgrounds
        </h4>
        <div className={styles.backgroundResults}>
          {Object.entries(multipleBackgroundAnalysis).map(([name, analysis]) => {
            const status = ContrastCalculator.getAccessibilityStatus(analysis.contrast);
            
            return (
              <div
                key={name}
                className={`${styles.backgroundResult} ${styles[status.status]}`}
              >
                <div className={styles.resultHeader}>
                  <div
                    className={styles.resultSwatch}
                    style={{ backgroundColor: analysis.background }}
                  />
                  <span className={styles.resultName}>{name}</span>
                  <span className={styles.resultIcon}>{status.icon}</span>
                </div>
                <div className={styles.resultDetails}>
                  <span className={styles.resultRatio}>
                    {analysis.contrast.ratio.toFixed(1)}:1
                  </span>
                  <span className={styles.resultGrade}>
                    {analysis.contrast.grade}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render detailed analysis
  const renderDetailedAnalysis = () => {
    if (!showDetails) return null;

    const { contrast } = contrastAnalysis;

    return (
      <div className={styles.detailedAnalysis}>
        <div className={styles.analysisGrid}>
          <div className={styles.analysisItem}>
            <span className={styles.analysisLabel}>Contrast Ratio:</span>
            <span className={styles.analysisValue}>{contrast.ratio.toFixed(2)}:1</span>
          </div>
          
          <div className={styles.analysisItem}>
            <span className={styles.analysisLabel}>Accessibility Score:</span>
            <div className={styles.scoreBar}>
              <div
                className={styles.scoreProgress}
                style={{ width: `${contrast.score}%` }}
              />
              <span className={styles.scoreText}>{contrast.score}/100</span>
            </div>
          </div>
          
          <div className={styles.analysisItem}>
            <span className={styles.analysisLabel}>WCAG Compliance:</span>
            <div className={styles.complianceList}>
              <span className={contrast.wcagAA ? styles.pass : styles.fail}>
                AA Normal: {contrast.wcagAA ? 'Pass' : 'Fail'}
              </span>
              <span className={contrast.wcagAALarge ? styles.pass : styles.fail}>
                AA Large: {contrast.wcagAALarge ? 'Pass' : 'Fail'}
              </span>
              <span className={contrast.wcagAAA ? styles.pass : styles.fail}>
                AAA Normal: {contrast.wcagAAA ? 'Pass' : 'Fail'}
              </span>
              <span className={contrast.wcagAAALarge ? styles.pass : styles.fail}>
                AAA Large: {contrast.wcagAAALarge ? 'Pass' : 'Fail'}
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.bestTextColor}>
          <span className={styles.bestTextLabel}>Best text color for this background:</span>
          <div
            className={styles.bestTextDemo}
            style={{
              backgroundColor: foregroundColor,
              color: bestTextColor.color,
            }}
          >
            <span>{bestTextColor.color}</span>
            <span className={styles.bestTextRatio}>
              ({bestTextColor.contrast.ratio.toFixed(1)}:1)
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.colorContrastIndicator} ${styles[size]} ${className}`}>
      {/* Main indicator */}
      <div 
        className={`${styles.mainIndicator} ${interactive ? styles.interactive : ''}`}
        onClick={toggleDetails}
      >
        {renderContrastBadge()}
        {renderColorPreview()}
        
        {interactive && (
          <button
            type="button"
            className={styles.detailsToggle}
            onClick={toggleDetails}
            aria-expanded={showDetails}
            aria-label={showDetails ? 'Hide details' : 'Show details'}
          >
            <svg
              className={`${styles.toggleIcon} ${showDetails ? styles.expanded : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Status message */}
      <div className={`${styles.statusMessage} ${styles[accessibilityStatus.status]}`}>
        {accessibilityStatus.message}
      </div>

      {/* Interactive background selector */}
      {interactive && renderBackgroundSelector()}

      {/* Detailed analysis */}
      {renderDetailedAnalysis()}

      {/* Recommendations */}
      {renderRecommendations()}

      {/* Multiple background results */}
      {renderMultipleBackgroundResults()}

      {/* Screen reader information */}
      <div className={styles.srOnly}>
        Color contrast: {contrastAnalysis.contrast.ratio.toFixed(1)} to 1 ratio.
        {contrastAnalysis.contrast.wcagAA ? ' Meets WCAG AA standards.' : ' Does not meet WCAG AA standards.'}
        {contrastAnalysis.contrast.wcagAAA ? ' Meets WCAG AAA standards.' : ''}
      </div>
    </div>
  );
};

export default ColorContrastIndicator;