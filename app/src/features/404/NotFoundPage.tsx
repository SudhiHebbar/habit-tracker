// 404 Not Found Page Component
import FadeText from '../../shared/components/FadeText';
import Button from '../../shared/components/Button';
import { useAppNavigation } from '../../shared/utils/navigation';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  const { goToHome } = useAppNavigation();

  return (
    <div className={styles.notFoundPage}>
      <div className={styles.content}>
        <FadeText text='404' className={styles.errorCode} delay={100} duration={600} />
        <FadeText text='Page Not Found' className={styles.title} delay={300} duration={600} />
        <FadeText
          text="The page you're looking for doesn't exist or has been moved."
          className={styles.message}
          delay={500}
          duration={600}
        />
        <div className={styles.actions}>
          <Button variant='primary' onClick={goToHome}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
