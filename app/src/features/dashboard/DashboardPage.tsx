// Dashboard Page Component - New Implementation
import React from 'react';
import { Dashboard } from './components/Dashboard';

interface DashboardPageProps {
  initialTrackerId?: number | undefined;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ initialTrackerId }) => {
  return <Dashboard initialTrackerId={initialTrackerId} />;
};

export default DashboardPage;
