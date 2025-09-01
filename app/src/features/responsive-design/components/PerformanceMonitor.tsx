/**
 * PerformanceMonitor Component
 *
 * Real-time performance monitoring dashboard for responsive design
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import { useViewportSize } from '../hooks/useViewportSize';
import { getPerformanceMetrics, getPerformanceConfig } from '../services/performanceOptimizer';
import styles from './PerformanceMonitor.module.css';

/**
 * Performance metric interface
 */
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: { warning: number; critical: number };
  history: number[];
}

/**
 * Component props
 */
interface PerformanceMonitorProps {
  isOpen: boolean;
  onClose: () => void;
  updateInterval?: number;
  maxHistoryLength?: number;
  className?: string;
}

/**
 * PerformanceMonitor component
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isOpen,
  onClose,
  updateInterval = 1000,
  maxHistoryLength = 60,
  className = '',
}) => {
  const { current, viewport } = useBreakpoint();
  const { deviceType, capabilities } = useDeviceDetection();
  const { width, height, aspectRatio } = useViewportSize();

  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize metrics
  const initializeMetrics = useCallback((): PerformanceMetric[] => {
    return [
      {
        name: 'FPS',
        value: 60,
        unit: 'fps',
        threshold: { warning: 30, critical: 15 },
        history: [],
      },
      {
        name: 'Memory',
        value: 0,
        unit: 'MB',
        threshold: { warning: 100, critical: 200 },
        history: [],
      },
      {
        name: 'Load Time',
        value: 0,
        unit: 'ms',
        threshold: { warning: 3000, critical: 5000 },
        history: [],
      },
      {
        name: 'Network Latency',
        value: 0,
        unit: 'ms',
        threshold: { warning: 1000, critical: 2000 },
        history: [],
      },
    ];
  }, []);

  // Update metrics from performance optimizer
  const updateMetrics = useCallback(() => {
    const currentMetrics = getPerformanceMetrics();

    setMetrics(prev =>
      prev.map(metric => {
        let newValue = metric.value;

        // Get actual values from performance service
        switch (metric.name) {
          case 'FPS':
            newValue = currentMetrics.fps ?? 60;
            break;
          case 'Memory':
            newValue = currentMetrics.memory ?? 0;
            break;
          case 'Load Time':
            newValue = currentMetrics.loadTime ?? 0;
            break;
          case 'Network Latency':
            newValue = currentMetrics.networkLatency ?? 0;
            break;
        }

        // Update history
        const newHistory = [...metric.history, newValue];
        if (newHistory.length > maxHistoryLength) {
          newHistory.shift();
        }

        return {
          ...metric,
          value: newValue,
          history: newHistory,
        };
      })
    );
  }, [maxHistoryLength]);

  // Initialize and start monitoring
  useEffect(() => {
    if (isOpen) {
      setMetrics(initializeMetrics());
      const interval = setInterval(updateMetrics, updateInterval);
      return () => clearInterval(interval);
    }
  }, [isOpen, initializeMetrics, updateMetrics, updateInterval]);

  // Get performance status
  const getMetricStatus = useCallback(
    (metric: PerformanceMetric): 'good' | 'warning' | 'critical' => {
      if (metric.value >= metric.threshold.critical) return 'critical';
      if (metric.value >= metric.threshold.warning) return 'warning';
      return 'good';
    },
    []
  );

  // Calculate overall performance score
  const overallScore = useMemo(() => {
    if (metrics.length === 0) return 100;

    const scores = metrics.map(metric => {
      const status = getMetricStatus(metric);
      switch (status) {
        case 'critical':
          return 0;
        case 'warning':
          return 50;
        default:
          return 100;
      }
    });

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [metrics, getMetricStatus]);

  // Device info summary
  const deviceInfo = useMemo(
    () => ({
      breakpoint: current,
      deviceType,
      hasTouch: capabilities?.touch ?? false,
      viewport: `${width}×${height}`,
      aspectRatio: aspectRatio.toFixed(2),
      pixelRatio: capabilities?.devicePixelRatio ?? 1,
      networkSpeed: capabilities?.networkSpeed ?? 'unknown',
    }),
    [current, deviceType, capabilities, width, height, aspectRatio]
  );

  if (!isOpen) return null;

  return (
    <div className={`${styles.performanceMonitor} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Performance Monitor</h3>
          <div
            className={`${styles.overallScore} ${styles[overallScore >= 80 ? 'good' : overallScore >= 50 ? 'warning' : 'critical']}`}
          >
            {overallScore}%
          </div>
        </div>

        <div className={styles.controls}>
          <button
            className={styles.collapseButton}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? '▲' : '▼'}
          </button>
          <button className={styles.closeButton} onClick={onClose} aria-label='Close'>
            ✕
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className={styles.content}>
          {/* Performance Metrics */}
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Performance Metrics</h4>
            <div className={styles.metricsGrid}>
              {metrics.map(metric => (
                <div
                  key={metric.name}
                  className={`${styles.metricCard} ${styles[getMetricStatus(metric)]}`}
                >
                  <div className={styles.metricHeader}>
                    <span className={styles.metricName}>{metric.name}</span>
                    <span className={`${styles.metricStatus} ${styles[getMetricStatus(metric)]}`}>
                      ●
                    </span>
                  </div>
                  <div className={styles.metricValue}>
                    {metric.value.toFixed(metric.name === 'FPS' ? 0 : 1)}
                    <span className={styles.metricUnit}>{metric.unit}</span>
                  </div>
                  <div className={styles.metricChart}>
                    <MiniChart data={metric.history} status={getMetricStatus(metric)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Device Information */}
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Device Information</h4>
            <div className={styles.deviceInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Breakpoint:</span>
                <span className={styles.infoValue}>{deviceInfo.breakpoint}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Device Type:</span>
                <span className={styles.infoValue}>{deviceInfo.deviceType}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Touch Support:</span>
                <span className={styles.infoValue}>{deviceInfo.hasTouch ? 'Yes' : 'No'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Viewport:</span>
                <span className={styles.infoValue}>{deviceInfo.viewport}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Aspect Ratio:</span>
                <span className={styles.infoValue}>{deviceInfo.aspectRatio}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Pixel Ratio:</span>
                <span className={styles.infoValue}>{deviceInfo.pixelRatio}x</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Network:</span>
                <span className={styles.infoValue}>{deviceInfo.networkSpeed}</span>
              </div>
            </div>
          </section>

          {/* Performance Config */}
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Configuration</h4>
            <PerformanceConfig />
          </section>
        </div>
      )}
    </div>
  );
};

/**
 * Mini chart component for metric history
 */
const MiniChart: React.FC<{
  data: number[];
  status: 'good' | 'warning' | 'critical';
}> = ({ data, status }) => {
  const maxValue = Math.max(...data, 1);
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className={styles.miniChart} viewBox='0 0 100 100' preserveAspectRatio='none'>
      {data.length > 1 && (
        <polyline
          points={points}
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          className={styles[status]}
        />
      )}
    </svg>
  );
};

/**
 * Performance configuration display
 */
const PerformanceConfig: React.FC = () => {
  const config = getPerformanceConfig();

  return (
    <div className={styles.configGrid}>
      <div className={styles.configItem}>
        <span className={styles.configLabel}>Lazy Loading:</span>
        <span className={styles.configValue}>{config.enableLazyLoading ? 'On' : 'Off'}</span>
      </div>
      <div className={styles.configItem}>
        <span className={styles.configLabel}>Virtualization:</span>
        <span className={styles.configValue}>{config.enableVirtualization ? 'On' : 'Off'}</span>
      </div>
      <div className={styles.configItem}>
        <span className={styles.configLabel}>Resize Throttle:</span>
        <span className={styles.configValue}>{config.throttleResize}ms</span>
      </div>
      <div className={styles.configItem}>
        <span className={styles.configLabel}>Scroll Debounce:</span>
        <span className={styles.configValue}>{config.debounceScroll}ms</span>
      </div>
      <div className={styles.configItem}>
        <span className={styles.configLabel}>Low Power Mode:</span>
        <span className={styles.configValue}>{config.lowPowerMode ? 'On' : 'Off'}</span>
      </div>
      <div className={styles.configItem}>
        <span className={styles.configLabel}>Reduced Motion:</span>
        <span className={styles.configValue}>{config.reducedMotionFallback ? 'On' : 'Off'}</span>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
