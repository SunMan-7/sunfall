/*
This component displays a form where users can register.
*/
import styles from '../styles/components/SignUp.module.css';
import { useSignUpEmailPassword } from '@nhost/react';

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Input from './Input';
import Spinner from './Spinner';
import jaguarLogo from '/jaguar-logo-no-bg.png';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState(false)

  const { signUpEmailPassword, isLoading, isSuccess, 
    needsEmailVerification, isError, error} = useSignUpEmailPassword();

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 9 ) {
      return setErrorMsg('Password must be at least 9 characters')
    } 

    if (password !== confirmPassword) {
      return setErrorMsg('Password does not match')
    }     

    signUpEmailPassword(email, password, {
      displayName: `${firstName} ${lastName}`.trim(),
      metadata: {
        firstName,
        lastName
      }
    })
  };

  if(isSuccess) {
    return <Navigate to="/" replace={true} />
  }

  const disableForm = isLoading || needsEmailVerification

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* <span className={styles['app-name']}>SpotScan</span> */}
        <div className={styles['logo-wrapper']}>
          <img src={jaguarLogo} alt="jaguarLogo" />
        </div>

        {needsEmailVerification ? (
          <p className={styles['verification-text']}>
            Please check your mailbox and follow the verification link to
            verify your email.
          </p>
        ) : (
          <form onSubmit={handleOnSubmit} className={styles.form}>
            <div className={styles['input-group']}>
              <Input
                label="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                disabled={disableForm}
                required
              />
              <Input
                label="Last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                disabled={disableForm}
                required
              />
            </div>
            <Input
              type="email"
              label="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={disableForm}
              required
            />
            <Input
              type="password"
              label="Create password"
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                setErrorMsg('');
              }}
              disabled={disableForm}
              required
            />
            <Input
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value)
              }}
              disableForm={disableForm} 
              required
            />
            <div style={{textAlign: 'center', color: 'red'}}>{errorMsg}</div>

            <button type="submit" className={styles.button}>
              {isLoading ? <Spinner size='sm' /> : "Create account" }
            </button>
            {isError ? <p className={styles['error-text']}>
              {error?.message}</p> : null} 
          </form>
        )}
      </div>

      <p className={styles.text}>
        Already have an account?{' '}
        <Link to="/sign-in" className={styles.link}>
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
