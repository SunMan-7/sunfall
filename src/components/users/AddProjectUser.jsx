/*
This component allows specific users to add other members and assigned roles.
*/
import { useRef, useState, } from 'react';
import AddUserForm from './AddUserForm';
import { INSERT_USER_ORGANIZATION,
  GET_USER_ID_BY_EMAIL, INSERT_USER_PROJECT } from '../../api/usersGql';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 
import { projRoles } from '../../helpers';

const AddProjectUser = ({requeryUsers, emailList}) => {
  const email = useRef();
  const role = useRef(); 
  const { user } = useOutletContext();
  const organization = JSON.parse(localStorage.getItem('organization'));
  const project = JSON.parse(localStorage.getItem('project'));
  
  // const hasProjectRole = projRoles.some(role => role.id === user.defaultRole); 

  // check if the logged in user has contributor, tagger or viewer role, or organizational viewer role.  
  const isLowLevelRole = (user.defaultRole === 'p_contributor' || 
    user.defaultRole === 'p_tagger' || user.defaultRole === 'p_viewer' || user.defaultRole === 'o_viewer');

  const [insertUserOrganization] = useMutation(INSERT_USER_ORGANIZATION);
  const [insertUserProject] = useMutation(INSERT_USER_PROJECT, {
    refetchQueries: [requeryUsers]
  });  
  const [getUser,] = useLazyQuery(GET_USER_ID_BY_EMAIL);

  // project members cannot add members at the organization page, add button will be set to true;
  const [isDisabled, setIsDisabled] = useState(isLowLevelRole);
  
  const addUser = async (userId) => {
    try {      
        // Handle project membership
        await insertUserProject({
          variables: { userProjects: { 
            user_id: userId, user_role: role.current.value, project_id: project.id 
          }},
        });
        toast.success('Successfully added user to this project');

        // Handle organization membership
        await insertUserOrganization({
          variables: { values: { 
            user_id: userId, organization_id: organization.id, is_revoked: false 
          } },
        });
    } catch (error) {
      console.error(error);
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
    roles={projRoles}
    isDisabled={isDisabled}
    emailRef={email}
    roleRef={role}
  />
  )
}

export default AddProjectUser