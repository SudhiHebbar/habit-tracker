// Dashboard Page Component - New Implementation
import React from 'react';
import { MainLayout } from '../../shared/components/Layout/MainLayout';
import { Dashboard } from './components/Dashboard';

interface DashboardPageProps {
  initialTrackerId?: number | undefined;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ initialTrackerId }) => {
  return (
    <MainLayout>
      <Dashboard initialTrackerId={initialTrackerId} />
    </MainLayout>
  );
};

export default DashboardPage;
