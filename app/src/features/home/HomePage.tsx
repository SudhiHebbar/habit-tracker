// Home Page Component
import FadeText from '../../shared/components/FadeText';
import Button from '../../shared/components/Button';
import { useAppNavigation } from '../../shared/utils/navigation';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { goToDashboard } = useAppNavigation();

  return (
    <div className={styles.homePage}>
      <div className={styles.hero}>
        <FadeText 
          text="Welcome to Habit Tracker" 
          className={styles.title}
          delay={200}
          duration={800}
        />
        <FadeText 
          text="Build better habits, track your progress, achieve your goals" 
          className={styles.subtitle}
          delay={600}
          duration={800}
        />
        <div className={styles.actions}>
          <Button 
            variant="primary" 
            size="large" 
            onClick={goToDashboard}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;