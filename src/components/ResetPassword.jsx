/*
This component allows users to reset their password. A registered email address 
will be required and a reset link will be sent to that address.
*/
import React from 'react';
import styles from '../styles/components/SignIn.module.css';
import { useResetPassword } from '@nhost/react';
import { useState } from 'react';
import Input from './Input';
import Spinner from './Spinner';
import jaguarLogo from '/jaguar-logo-no-bg.png'

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const { resetPassword, isLoading, isSent, isError, error } = useResetPassword()

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    await resetPassword(email, {
      redirectTo: '/change-password'
    });
  }

  if(isSent){
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles['logo-wrapper']}>
            <img src={process.env.PUBLIC_URL + 'jaguar-logo-no-bg.png'} alt="jaguarLogo" />
          </div>
          <div className='mt-3'>
            Success! We've just sent a password reset link to your email. 
            Please check your inbox and follow the instructions to securely 
            reset your password. If you don't see the email, don't forget to 
            check your spam folder. If you encounter any issues, feel free to 
            contact our support team for assistance.
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* <span className={styles['app-name']}>SpotScan</span> */}
        <div className={styles['logo-wrapper']}>
          <img src={jaguarLogo} alt="jaguarLogo" />
        </div>
        
        <form onSubmit={handleFormSubmit} className={styles.form}>
          <Input
            type="email"
            label="Enter email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />

          <button type="submit" className={styles.button}>
            {isLoading ? <Spinner size='sm' /> : "Reset Password" }
          </button>
          {isError ? <p className={styles['error-text']}>
            {error?.message}</p> : null} 
        </form>
      </div>

      {/* <p className={styles.text}>
        Already have an account?{' '}
        <Link to="/sign-in" className={styles.link}>
          Sign in
        </Link>
      </p> */}
    </div>
  )
}

export default ResetPassword