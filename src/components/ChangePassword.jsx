/*
This component allows users to change their passwords outside the settings page.
Users will be redirected to the sign-in page after changing password.
*/
import {useLocation, Navigate } from 'react-router-dom';
import styles from '../styles/components/SignIn.module.css'
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import Input from './Input';
import { useChangePassword } from '@nhost/react';
import Spinner from './Spinner';

const ChangePassword = () => {
  const location = useLocation();
  const {changePassword, isLoading, isSuccess, isError, error } = useChangePassword();  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  // Define an asynchronous function named 'updatePassword' intended to be called when a user attempts to update their password.
  const updatePassword = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior to handle it via JavaScript.
    
    // Check if the new password and confirmation password do not match.
    if (newPassword !== confirmPassword) {
      // If the passwords do not match, set an error message and exit the function early.
      return setErrorMsg('Password does not match');
    }

    // Check if the new password is less than the required length of 9 characters.
    if (newPassword.length < 9 ) {
      // If it is too short, set an error message and exit the function early.
      return setErrorMsg('Password must be at least 9 characters');
    }  
    
    // Check if the new password is empty.
    if (!newPassword){
      // If it is empty, set an error message and exit the function early.
      // This is an additional safeguard in case form validation fails.
      return setErrorMsg('Password cannot be empty');
    }

    // Attempt to update the user's password with the new password.
    await changePassword(newPassword);       
  };

  // After attempting to update the password, check if the update was successful.
  if(isSuccess){ 
    // If the update was successful, display a success message to the user.
    toast.success('Successfully changed password');
    // Redirect the user to the sign-in page, (users should be automatically re-authenticated & signed in).
    // The 'replace' flag ensures the navigation replaces the current entry in the history stack,
    // so the user won't return to the update form when navigating back.
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  return (
    <div className={styles.container}> 
      <div className={styles.card}>
        <div className={styles['logo-wrapper']}>
          <img src={process.env.PUBLIC_URL + 'jaguar-logo-no-bg.png'} alt="jaguarLogo" />
        </div>
        <form onSubmit={updatePassword} className={styles.form}>
          <Input
            type="password"
            label="New Password"
            value={newPassword}
            onChange={e => {
              setNewPassword(e.target.value)
              setErrorMsg('');
            }} 
            placeholder="New Password"                 
            required
          />
          <Input
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={e => {
              setConfirmPassword(e.target.value)
            }}
            placeholder="Confirm New Password" 
            required
          />
          <button type="submit" className={styles.button}>
            {isLoading ? <Spinner size="sm" /> : 'Update'}
          </button>
          {errorMsg && <p className={styles['error-text']}>{errorMsg}</p>}
          {isError ? <p className={styles['error-text']}>{error?.message}</p>: null}
        </form>
      </div>
    </div>  
  )
}

export default ChangePassword