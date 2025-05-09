/*
This component allows organizational level roles to be added.
*/
import { useRef, useState, } from 'react';
import AddUserForm from './AddUserForm';
import { GET_USER_ID_BY_EMAIL, INSERT_USER_ORGANIZATION } from '../../api/usersGql';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 
import { orgRoles } from '../../helpers';

const AddOrgUser = ({requeryUsers, emailList}) => {
  const email = useRef();
  const role = useRef(); 
  const { user } = useOutletContext();
  const organization = JSON.parse(localStorage.getItem('organization'));

  // Check if the user has an admin, organization admin or editor role.
  const isHighLevelRole = (user.defaultRole === 'o_admin' || 
    user.defaultRole === 'o_editor' || user.defaultRole === 'admin');

  const [insertUserOrganization] = useMutation(INSERT_USER_ORGANIZATION, {
    refetchQueries: [requeryUsers]
  }); 
  // const [upsertDefaultOrganization] = useMutation(UPSERT_DEFAULT_ORGANIZATION); 
  const [getUser,] = useLazyQuery(GET_USER_ID_BY_EMAIL);

  // if user does not have high level roles, then add member button will be disabled
  const [isDisabled, setIsDisabled] = useState(!isHighLevelRole);
  
  //Add user to user_organizations table
  const addUser = async (userId) => {
    try {
      await insertUserOrganization({
        variables: { values: { 
          user_id: userId, organization_id: organization?.id, 
          role: role.current.value, is_revoked: false 
        } },
      });
      toast.success('Successfully added user.');
    } catch (error) {
      console.error(1, error);
      toast.error("Unable to add user! You may not have permission to add.");
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsDisabled(true);
    const processing = toast.loading('Please wait...');

    // Check if email is already in the list
    const isAlreadyAdded = emailList?.includes(email.current.value);
    if (isAlreadyAdded) {
      toast.dismiss(processing);
      setIsDisabled(false);
      return toast.error('User is already in the list below.');
    }   

    // Fetch user by email and add if not already added
    const { data } = await getUser({ variables: { email: email.current.value } });
    const user = data?.users?.[0];
 
    if (user) {
      addUser(user.id);
    } else {
      toast.error('User has not signed up as yet');
    }
    toast.dismiss(processing);
    setIsDisabled(false);
  };


return (
  <AddUserForm 
    onSubmit={handleInvite}
    roles={orgRoles}
    isDisabled={isDisabled}
    emailRef={email}
    roleRef={role}
  />
  )
}

export default AddOrgUser