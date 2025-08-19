// Settings Page Component
import FadeText from '../../shared/components/FadeText';
import styles from './SettingsPage.module.css';

const SettingsPage = () => {
  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <FadeText 
          text="Settings" 
          className={styles.title}
          delay={100}
          duration={600}
        />
        <p className={styles.subtitle}>Customize your habit tracking experience</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <FadeText 
            text="Settings panel coming soon..." 
            delay={400}
            duration={600}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;