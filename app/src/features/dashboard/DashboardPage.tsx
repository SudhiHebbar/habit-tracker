// Dashboard Page Component
import FadeText from '../../shared/components/FadeText';
import Button from '../../shared/components/Button';
import { useAppNavigation } from '../../shared/utils/navigation';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { goToHabits } = useAppNavigation();

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.header}>
        <FadeText 
          text="Dashboard" 
          className={styles.title}
          delay={100}
          duration={600}
        />
        <p className={styles.subtitle}>Track your habits and monitor your progress</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <FadeText 
            text="Dashboard content coming soon..." 
            delay={400}
            duration={600}
          />
          <Button variant="primary" onClick={goToHabits}>
            View Habits
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;