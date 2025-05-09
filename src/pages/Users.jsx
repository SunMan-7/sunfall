/*
This component displays a list of project members in the project dashboard. It 
also allows organization admin, organization editor, project admin and project 
editor to add new members to the project. Project roles can be changed and 
membership can be revoked.
*/
import { Card } from "react-bootstrap";
import { GET_PROJECT_MEMBERS, } from "../api/usersGql";
import { useQuery, } from '@apollo/client'; 
import Spinner from '../components/Spinner';
import { useOutletContext } from 'react-router-dom';
import AddProjectUser from "../components/users/AddProjectUser";
import EditProjectUserList from "../components/users/EditProjectUserList";

const Users = () => {
  const { user } = useOutletContext();
  const {id: projectId } = JSON.parse(localStorage.getItem('project'));
  const {loading, error, data } = useQuery(GET_PROJECT_MEMBERS, {
    variables: { projectId},
    skip: !projectId 
  });   
  
  return (
    <Card className="p-3 shadow" style={{maxWidth: '50em'}}>
      <h5>Project Members</h5>
      <AddProjectUser  
        emailList = {data?.user_projects?.map(member => member.user.email)}
        requeryUsers={GET_PROJECT_MEMBERS}
      />
      <div className="mt-3">
      {
        error 
        ? <div>Unable to fetch data</div>
        : !loading
        ? data?.user_projects.length > 0 && 
          <>
            <p>Below are the persons who have access to this project only:</p>
            <EditProjectUserList
              userData={data?.user_projects}
              user_id={user?.id}
              userRole={user?.defaultRole}
            />
          </>
        : <Spinner />
      }   
      </div>   
    </Card>
  )
}

export default Users