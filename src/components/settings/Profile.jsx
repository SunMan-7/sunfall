/*
This component allows users to change their profile name
*/
import styles from '../../styles/components/Settings.module.css'
import { gql, useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Input from '../Input';

const UPDATE_USER_MUTATION = gql `
  mutation ($id: uuid!, $displayName: String!, $metadata: jsonb) {
    updateUser(pk_columns: {id: $id}, 
      _set: {displayName: $displayName, metadata: $metadata}
    ) {
      id
      displayName
      metadata
    }
  }
`

const Profile = () => {
  const { user } = useOutletContext();
  const [mutateUser] = useMutation(UPDATE_USER_MUTATION);

  const [firstName, setFirstName] = useState(user?.metadata?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.metadata?.lastName ?? '');

  const isFirstNameDirty = firstName !== user?.metadata?.firstName;
  const isLastNameDirty = lastName !== user?.metadata?.lastName;
  const isProfileFormDirty = isFirstNameDirty || isLastNameDirty;

  const updateUserProfile = async e => {
    e.preventDefault();

    try {
      await mutateUser({
        variables: {
          id: user.id,
          displayName: `${firstName} ${lastName}`.trim(),
          metadata: {
            firstName,
            lastName
          }
        }
      })
      toast.success('Updated successfully', {id: 'updateProfile'})
    } catch (error) {
      console.error(error.message);
      toast.error('Unable to update profile', {id: 'updateProfile'})
    }
  };

  return (
    <div>

      <div className={styles.container}>
        <div className={styles.info}>
          <h2>Profile</h2>
          <p>Update your personal information.</p>
        </div>

        <div className={styles.card}>
          <form onSubmit={updateUserProfile} className={styles.form}>
            <div className={styles['form-fields']}>
              <div className={styles['input-group']}>
                <Input
                  type="text"
                  label="First name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  label="Last name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className={styles['input-email-wrapper']}>
                <Input
                  type="email"
                  label="Email address"
                  value={user?.email}
                  readOnly
                />
              </div>
            </div>

            <div className={styles['form-footer']}>
              <button
                type="submit"
                disabled={!isProfileFormDirty}
                className={styles.button}
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>          
    </div>
  );
};

export default Profile;
