import ChangePassword from '../components/ChangePassword';
import styles from "../styles/pages/SignIn.module.css";
import { Helmet } from 'react-helmet';

const ChangePasswordPage = () => {
  return (
    <>
      <Helmet>
        <title>Change Password</title>
      </Helmet>

      <div className={styles.container}>
        <ChangePassword />
      </div>
    </>
  )
}

export default ChangePasswordPage