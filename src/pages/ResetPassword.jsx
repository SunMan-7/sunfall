import ResetPassword from "../components/ResetPassword";
import styles from "../styles/pages/SignIn.module.css";
import { Helmet } from 'react-helmet';

const ResetPasswordPage = () => {
  return (
    <>
      <Helmet>
        <title>Reset Password</title>
      </Helmet>

      <div className={styles.container}>
        <ResetPassword />
      </div>
    </>
  )
}

export default ResetPasswordPage