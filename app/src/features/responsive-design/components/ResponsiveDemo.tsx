/**
 * ResponsiveDemo Component
 *
 * Comprehensive demo showcasing all responsive design features
 */

import React, { useState, useCallback } from 'react';
import {
  ResponsiveLayout,
  MobileNavigation,
  ResponsiveGrid,
  Container,
  Flex,
  Stack,
  AdaptiveModal,
  TouchTarget,
  SwipeGesture,
  PullToRefresh,
  LongPress,
  DoubleTap,
  RippleEffect,
  PerformanceMonitor,
  useBreakpoint,
  useDeviceDetection,
  useViewportSize,
  useResponsiveLayout,
  useHaptics,
} from '../index';
import styles from './ResponsiveDemo.module.css';

/**
 * Demo navigation items
 */
const navigationItems = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/', badge: 0 },
  { id: 'features', label: 'Features', icon: '⭐', path: '/features', badge: 3 },
  { id: 'demo', label: 'Demo', icon: '🎮', path: '/demo', badge: 0 },
  { id: 'docs', label: 'Docs', icon: '📚', path: '/docs', badge: 1 },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings', badge: 0 },
  { id: 'profile', label: 'Profile', icon: '👤', path: '/profile', badge: 0 },
  { id: 'analytics', label: 'Analytics', icon: '📊', path: '/analytics', badge: 2 },
];

/**
 * ResponsiveDemo component
 */
const ResponsiveDemo: React.FC = () => {
  const { current, isMobile, isTablet, isDesktop, getValue } = useBreakpoint();
  const { deviceType, hasTouch, supportsHaptics } = useDeviceDetection();
  const { width, height, aspectRatio } = useViewportSize();
  const { layout } = useResponsiveLayout();
  const { trigger: triggerHaptic } = useHaptics();

  const [activeNav, setActiveNav] = useState('demo');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [interactions, setInteractions] = useState<string[]>([]);

  // Add interaction log
  const addInteraction = useCallback((interaction: string) => {
    setInteractions(prev => [
      `${new Date().toLocaleTimeString()}: ${interaction}`,
      ...prev.slice(0, 9),
    ]);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    addInteraction('Pull to refresh triggered');
    await new Promise(resolve => setTimeout(resolve, 1500));
  }, [addInteraction]);

  // Responsive grid configuration
  const gridColumns = getValue({
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  });

  // Demo cards data
  const demoCards = [
    { id: 1, title: 'Touch Target', description: 'Tap me!', color: '#6366F1' },
    { id: 2, title: 'Swipe Gesture', description: 'Swipe me!', color: '#8B5CF6' },
    { id: 3, title: 'Long Press', description: 'Hold me!', color: '#10B981' },
    { id: 4, title: 'Double Tap', description: 'Double tap!', color: '#F59E0B' },
    { id: 5, title: 'Ripple Effect', description: 'Click for ripple!', color: '#EF4444' },
    { id: 6, title: 'Modal Demo', description: 'Open modal', color: '#3B82F6' },
  ];

  return (
    <ResponsiveLayout
      navigationItems={navigationItems}
      showNavigation
      header={
        <div className={styles.header}>
          <h1>Responsive Design Demo</h1>
          <div className={styles.headerControls}>
            <button
              className={styles.perfButton}
              onClick={() => setIsPerformanceOpen(!isPerformanceOpen)}
            >
              📊 Performance
            </button>
          </div>
        </div>
      }
    >
      <Container maxWidth={1200} className={styles.demoContainer}>
        <PullToRefresh onRefresh={handleRefresh}>
          {/* Device Info Section */}
          <section className={styles.section}>
            <h2>Current Device State</h2>
            <div className={styles.deviceInfoGrid}>
              <div className={styles.infoCard}>
                <strong>Breakpoint:</strong> {current}
              </div>
              <div className={styles.infoCard}>
                <strong>Device Type:</strong> {deviceType}
              </div>
              <div className={styles.infoCard}>
                <strong>Viewport:</strong> {width}×{height}
              </div>
              <div className={styles.infoCard}>
                <strong>Aspect Ratio:</strong> {aspectRatio.toFixed(2)}
              </div>
              <div className={styles.infoCard}>
                <strong>Touch Support:</strong> {hasTouch ? 'Yes' : 'No'}
              </div>
              <div className={styles.infoCard}>
                <strong>Haptics:</strong> {supportsHaptics ? 'Yes' : 'No'}
              </div>
            </div>
          </section>

          {/* Layout Showcase */}
          <section className={styles.section}>
            <h2>Layout Components</h2>
            <div className={styles.layoutShowcase}>
              <h3>Responsive Grid ({gridColumns} columns)</h3>
              <ResponsiveGrid columns={gridColumns} gap={16}>
                {demoCards.map(card => (
                  <div key={card.id} className={styles.gridItem} style={{ background: card.color }}>
                    <h4>{card.title}</h4>
                    <p>{card.description}</p>
                  </div>
                ))}
              </ResponsiveGrid>

              <h3>Flex Layout</h3>
              <Flex
                direction={getValue({ mobile: 'column', desktop: 'row' })}
                gap={16}
                justifyContent='space-between'
              >
                <div className={styles.flexItem}>Flex Item 1</div>
                <div className={styles.flexItem}>Flex Item 2</div>
                <div className={styles.flexItem}>Flex Item 3</div>
              </Flex>

              <h3>Stack Layout</h3>
              <Stack direction='vertical' spacing={12}>
                <div className={styles.stackItem}>Stack Item 1</div>
                <div className={styles.stackItem}>Stack Item 2</div>
                <div className={styles.stackItem}>Stack Item 3</div>
              </Stack>
            </div>
          </section>

          {/* Interactive Components */}
          <section className={styles.section}>
            <h2>Interactive Components</h2>
            <div className={styles.interactionGrid}>
              <TouchTarget
                onClick={() => {
                  addInteraction('Touch Target clicked');
                }}
                className={styles.interactionCard}
              >
                <div>
                  <h4>Touch Target</h4>
                  <p>Minimum 44px touch area</p>
                </div>
              </TouchTarget>

              <SwipeGesture
                onSwipeLeft={() => addInteraction('Swiped left')}
                onSwipeRight={() => addInteraction('Swiped right')}
                onSwipeUp={() => addInteraction('Swiped up')}
                onSwipeDown={() => addInteraction('Swiped down')}
                className={styles.interactionCard}
              >
                <div>
                  <h4>Swipe Gesture</h4>
                  <p>Try swiping in any direction</p>
                </div>
              </SwipeGesture>

              <LongPress
                onLongPress={() => addInteraction('Long press detected')}
                onPress={() => addInteraction('Quick press')}
                className={styles.interactionCard}
              >
                <div>
                  <h4>Long Press</h4>
                  <p>Press and hold for long press</p>
                </div>
              </LongPress>

              <DoubleTap
                onDoubleTap={() => addInteraction('Double tap detected')}
                onSingleTap={() => addInteraction('Single tap')}
                className={styles.interactionCard}
              >
                <div>
                  <h4>Double Tap</h4>
                  <p>Double tap for special action</p>
                </div>
              </DoubleTap>

              <RippleEffect className={styles.interactionCard}>
                <div>
                  <h4>Ripple Effect</h4>
                  <p>Click anywhere for ripple</p>
                </div>
              </RippleEffect>

              <TouchTarget onClick={() => setIsModalOpen(true)} className={styles.interactionCard}>
                <div>
                  <h4>Adaptive Modal</h4>
                  <p>Opens appropriate to device</p>
                </div>
              </TouchTarget>
            </div>
          </section>

          {/* Interaction Log */}
          <section className={styles.section}>
            <h2>Interaction Log</h2>
            <div className={styles.interactionLog}>
              {interactions.length === 0 ? (
                <p className={styles.emptyLog}>No interactions yet. Try the components above!</p>
              ) : (
                interactions.map((interaction, index) => (
                  <div key={index} className={styles.logItem}>
                    {interaction}
                  </div>
                ))
              )}
            </div>
          </section>
        </PullToRefresh>
      </Container>

      {/* Adaptive Modal */}
      <AdaptiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Responsive Modal Demo'
        size='medium'
      >
        <div className={styles.modalContent}>
          <p>This modal adapts based on your device:</p>
          <ul>
            <li>
              <strong>Mobile:</strong> Bottom sheet with swipe to dismiss
            </li>
            <li>
              <strong>Tablet:</strong> Side drawer
            </li>
            <li>
              <strong>Desktop:</strong> Centered modal
            </li>
          </ul>
          <p>
            Current presentation:{' '}
            <strong>{isMobile ? 'Bottom Sheet' : isTablet ? 'Drawer' : 'Modal'}</strong>
          </p>

          <div className={styles.modalActions}>
            <button
              onClick={() => {
                addInteraction('Modal action triggered');
                setIsModalOpen(false);
              }}
            >
              Action
            </button>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      </AdaptiveModal>

      {/* Performance Monitor */}
      <PerformanceMonitor
        isOpen={isPerformanceOpen}
        onClose={() => setIsPerformanceOpen(false)}
        updateInterval={1000}
      />
    </ResponsiveLayout>
  );
};

export default ResponsiveDemo;
