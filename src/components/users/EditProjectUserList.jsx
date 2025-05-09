/*
This component allows specific users to change roles or revoke users. Only project admins
and higher-level users can change roles and revoke users.
*/
import { useMemo } from 'react';
import UserList from './UserList';
import { toast } from 'react-hot-toast';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_PROJECTS_BYKEY } from '../../api/usersGql';
import { projRoles } from '../../helpers';


const EditProjectUserList = (props) => {
  const { userData, user_id, userRole} = props; 
  const [updateUserProject] = useMutation(UPDATE_USER_PROJECTS_BYKEY);

  //only admin, organization admin and project admin can change user role and revoke users  
  const isProjectAdmins = userRole === 'p_admin' || userRole === 'o_admin' || userRole === 'admin';

  // Change roles
  const handleChangeRole = async(id, role) => { 
    // change roles for specific projects if users belong to a project
    try{
      await updateUserProject({
        variables: {
          id,
          values: {user_role: role} 
        }
      })
      toast.success("Project member's role updated successfully.");
    }catch(error){
      console.log('project', error);
      toast.error("Unable to change role! You may not have sufficient permissions.");
    }    
  }

  const handleChangeRevoke = async(id, isRevoked) => {
    // if revoking project members, then is_p_revoked field is changed
    try{
      await updateUserProject({
        variables: {
          id, 
          values: {is_p_revoked: isRevoked},
        }
      })
      isRevoked 
      ? toast.success('Project member has been revoked!', {id: 'revoked', iconTheme: {primary: 'orange'}})
      : toast.success( 'Project member has been unrevoked!', {id: 'revoked', iconTheme: {primary: '#61D345'}});
    }catch(error){
      console.log(error);
      toast.error("Unable to revoke project member! You may not have sufficient permissions.");
    }
  }
  
  // Memoize the mapped userData and roles
  const memoizedUserData = useMemo(() => {
    return userData.map(u => ({
      ...u,
      role: u?.user_role,
      isRevoked: u?.is_p_revoked,
      roles: projRoles.map(r => (
        <option key={r.id} value={r.id}>{r.label}</option>
      ))
    }));
  }, [userData, projRoles]);

  // will disable select and revoke button for lower level user roles.
  const isDisabled = (member) => {
    return  member.user.id === user_id || !isProjectAdmins
  };  
  
  return (
    <UserList
      userData={memoizedUserData}
      onRoleChange={handleChangeRole}
      onRevokeChange={handleChangeRevoke}
      isDisabled={isDisabled}
    />
  )
}

export default EditProjectUserList