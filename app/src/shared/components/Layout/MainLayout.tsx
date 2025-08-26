import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import { Container } from './Container';
import styles from '../../../../styles/shared/layouts/MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  sidebar?: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  fullWidth = false,
  sidebar,
  className = '',
}) => {
  return (
    <ErrorBoundary>
      <div className={`${styles.layout} ${className}`}>
        <header className={styles.header}>
          <Container>
            <div className={styles.headerContent}>
              <a href='/' className={styles.logo}>
                <span className={styles.logoIcon}>📊</span>
                <span className={styles.logoText}>Habit Tracker</span>
              </a>
              <nav className={styles.navigation}>
                <ul className={styles.navigationList}>
                  <li>
                    <a href='/dashboard' className={styles.navigationLink}>
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a href='/habits' className={styles.navigationLink}>
                      Habits
                    </a>
                  </li>
                  <li>
                    <a href='/settings' className={styles.navigationLink}>
                      Settings
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </Container>
        </header>

        <div className={styles.body}>
          {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}

          <main className={styles.main}>
            {fullWidth ? children : <Container>{children}</Container>}
          </main>
        </div>

        <footer className={styles.footer}>
          <Container>
            <div className={styles.footerContent}>
              <p className={styles.footerText}>
                © 2024 Habit Tracker. Built with React 19 and React Bits.
              </p>
            </div>
          </Container>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
