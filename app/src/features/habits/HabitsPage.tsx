// Habits Page Component
import FadeText from '../../shared/components/FadeText';
import { useAppNavigation } from '../../shared/utils/navigation';
import styles from './HabitsPage.module.css';

const HabitsPage = () => {
  const { routeParams } = useAppNavigation();

  return (
    <div className={styles.habitsPage}>
      <div className={styles.header}>
        <FadeText 
          text={routeParams.id ? `Habit Details: ${routeParams.id}` : "Your Habits"} 
          className={styles.title}
          delay={100}
          duration={600}
        />
        <p className={styles.subtitle}>
          {routeParams.id 
            ? "View and manage this specific habit"
            : "Manage your daily habits and track progress"
          }
        </p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <FadeText 
            text="Habits management coming soon..." 
            delay={400}
            duration={600}
          />
        </div>
      </div>
    </div>
  );
};

export default HabitsPage;