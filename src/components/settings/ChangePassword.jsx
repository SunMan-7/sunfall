/*
This component allows users to change their passwords at the settings page only.
*/
import styles from '../../styles/components/Settings.module.css'
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import Input from '../Input';
import { useChangePassword } from '@nhost/react';

const ChangePassword = () => {
  const {changePassword, isLoading, isError, error } = useChangePassword();  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);
  const [disabled, setDisabled] = useState(true);

  // Define an asynchronous function named 'updatePassword' to handle updating the user's password.
  const updatePassword = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior.
    
    // Check if the new password and confirm password do not match.
    if (newPassword !== confirmPassword) {
      // If they don't match, set an error message and exit the function early.
      return setErrorMsg('Password does not match');
    }

    // Check if the new password is less than the required length (9 characters).
    if (newPassword.length < 9 ) {
      // If it is too short, set an error message and exit the function early.
      return setErrorMsg('Password must be at least 8 characters');
    }  
    
    // Check if the new password is not set (empty).
    if (!newPassword){
      // If it is empty, set an error message and exit the function early.
      return setErrorMsg('Password cannot be empty');
    }

    try {
      // Attempt to change the password with the new password value.
      await changePassword(newPassword);
      // Reset the newPassword and confirmPassword fields to empty strings.
      setNewPassword('');
      setConfirmPassword('');
      // Disable the button to prevent multiple submissions.
      setDisabled(true);
      // Display a success message to the user.
      toast.success('Successfully updated password!');
    } catch(error) {
      // If an error occurs, log it to the console.
      console.error(error);
    }       
  };


  return (
    <div className={styles.container}>      
      <div className={styles.info}>
        <h2>Change password?</h2>
        <p>Make sure to pick a strong password with at least 9 characters.</p>
      </div>

      <div className={styles.card}>
        <form onSubmit={updatePassword} className={styles.form}>
          <div className={styles['form-fields']}>
            <div className={styles['input-group']}>
              <Input
                type="password"
                label="New Password"
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value)
                  setDisabled(false)
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
            </div>              
          </div>
          
          <div className={styles['form-footer']}>
            <button
              type="submit"
              disabled={disabled || isLoading}
              className={styles.button}
            >
              Update
            </button>
          </div>
          {errorMsg && <p className={styles['error-text']}>{errorMsg}</p>}
          {isError ? <p className={styles['error-text']}>{error?.message}</p>: null}
        </form>
      </div>
    </div>  
  )
}

export default ChangePassword