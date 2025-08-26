import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import styles from '../../styles/shared/layouts/main-layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className={styles.layout}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <a href='/' className={styles.logo}>
              Habit Tracker
            </a>
            <nav>
              <ul className={styles.navigation}>
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
        </header>

        <main className={styles.main}>
          <div className={styles.mainContent}>
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>

        <footer className={styles.footer}>
          <p>© 2024 Habit Tracker. Built with React 19 and TypeScript.</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
