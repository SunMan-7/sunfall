/*
This component allows specific Organization admin to change roles or revoke users. 
*/
import { useMemo, memo } from 'react';
import UserList from './UserList';
import { toast } from 'react-hot-toast';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_ORGANIZATION_BYKEY } from '../../api/usersGql';
import { orgRoles } from '../../helpers';


const EditOrgUserList = (props) => {
  const { userData, user_id, userRole } = props; 
  const [updateUserOrganization] = useMutation(UPDATE_USER_ORGANIZATION_BYKEY); 

  //only admin or organization admins can change user role
  const isAdmins = userRole === 'o_admin' || userRole === 'admin';

  // Change roles
  const handleChangeRole = async(id, role) => {     
    try{
      // Change user's organization role to selected role.
      await updateUserOrganization({
        variables: {
          id,
          values: { role }
        }
      })
      toast.success("Member's role updated successfully.")
    }catch(error){
      console.log('organization', error);
      toast.error("Unable to change role! You may not have sufficient permissions.");
    }     
  }

  const handleChangeRevoke = async(id, is_revoked) => {
    try{
      // Change user's revoked status within the organization
      await updateUserOrganization({
        variables: {
          id,
          values: { is_revoked }
        }
      })      

      is_revoked 
      ? toast.success('Member has been revoked!', {id: 'revoked', iconTheme: {primary: 'orange'}})
      : toast.success( 'Member has been unrevoked!', {id: 'revoked', iconTheme: {primary: '#61D345'}});
    }catch(error){
      console.log(error);
      toast.error("Unable to revoke member! You may not have sufficient permision.")
    };
  }

  // Memoize the mapped userData and roles
  const memoizedUserData = useMemo(() => {
    return userData?.map(u => ({
      ...u,
      role: u?.role,
      isRevoked: u?.is_revoked,
      roles: orgRoles.map(r => (
        <option key={r.id} value={r.id}>{r.label}</option>
      ))
    }));
  }, [userData, orgRoles]);

  //Editable form fields will be disabled if its the user's own details or if they are not admin
  //or organization admin.
  const isDisabled = (staff) => {
    return (staff.user?.id === user_id  || !isAdmins);
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

export default memo(EditOrgUserList);