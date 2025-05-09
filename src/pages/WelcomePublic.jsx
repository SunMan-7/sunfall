/*
This component displays a message to newly registered users after they sign up.
*/
import { Helmet } from 'react-helmet';
import styles from '../styles/pages/WelcomePublic.module.css';
// import { Card } from 'react-bootstrap';
import { useSignOut } from '@nhost/react';
// import SignIn from '../components/SignIn';
import jaguarLogo from '/jaguar-logo-no-bg.png'

const WelcomePublicPage = () => {
  const { signOut } = useSignOut();
  return (
    <>
      <Helmet>
        <title>Welcome - FD</title>
      </Helmet>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.card}>
            <div className={styles['logo-wrapper']}>
              <img src={jaguarLogo} alt="logo" />
            </div>
            <h5 className={styles['notification-text']}>
              You have successfully signed in. <br />
              You are not assigned to any organization. <br/>
              Check with your organization and sign in again.
            </h5>
            <br/>
            <button
              onClick={signOut} 
              className={styles.button}
            >
              {/* <Icon className={styles['sidebar__link-icon']} /> */}
              <span
              >Log out</span>
            </button>
          </div>
          

        </div>
        {/* <SignIn /> */}
      </div>
    </>
  );
};

export default WelcomePublicPage;