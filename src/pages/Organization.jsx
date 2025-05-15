/*
This component displays a list of projects within an organization. Users can click on
any project and it will direct them to a project dashboard. This component also list 
organization admin members. Apart from the displays, users can also view cameras,
locations and edit organization details. Users can also add new members to organization 
admins and change roles or revoke membership.
*/
import {useNavigate, useOutletContext} from 'react-router-dom';
import { useState, } from 'react';
import styles from '../styles/pages/Organization.module.css';
import { Button, Dropdown, DropdownButton,} from 'react-bootstrap';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { GET_PROJECTS } from '../api/projectGql';
// import { GET_PROJECT_ROLE, } from '../api/usersGql';
import { GET_USER_PROJECT_ROLE } from '../api/organizationGql';
import { useQuery, useLazyQuery, useMutation, gql} from '@apollo/client';
import Spinner from '../components/Spinner';
import EditOrganization from '../components/organizationPage/EditOrganization';
import { formatTimeAgo } from '../helpers';
import AddOrgUser from '../components/users/AddOrgUser';
import { orgRoles, highLevelRoles } from '../helpers';
import { GET_ORGANIZATION_STAFF } from '../api/usersGql';
import EditOrgUserList from '../components/users/EditOrgUserList';
import { toast } from 'react-hot-toast';

// Updates user's default role. 
// This is placed here so that it updates the user cache 
// without requering GET_USER_QUERY (IDK why)
const UPDATE_USER_MUTATION = gql `
  mutation ($userId: uuid!, $values: users_set_input) {
    updateUser(pk_columns: {id: $userId}, 
      _set: $values
    ) {
      id
      defaultRole
      metadata
    }
  }
`

const OrganizationPage = () => {
  const navigate = useNavigate();
  const {id, organization_name} = JSON.parse(localStorage.getItem('organization'));
  const { user } = useOutletContext();
  const {loading, error, data } = useQuery(GET_PROJECTS, {
    variables: { organizationId: id },
    skip: !id
  })   
  const {loading: loadingUsers, error: errorUsers, data: staffs } = useQuery(GET_ORGANIZATION_STAFF,{
    variables: { organizationId: id},
    skip: !id,
  }); 
  const [getProjectRole, {loading: gettingProjectRole}] = useLazyQuery(GET_USER_PROJECT_ROLE)
  const [updateDefaultRole] = useMutation(UPDATE_USER_MUTATION);

  //display modal to edit organization details
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  //redirect users to a new page where users can insert new project
  const handleNewProject = () => {
    navigate('/new-project')
  }

  // Redirects users to the dashboard after clicking on a project
  const handleItemClick = async (project) => {    
    const processing = toast.loading('Please wait...');
    try {
      // Check if the user has a high-level role
      if (highLevelRoles.includes(user?.defaultRole)) {
        toast.dismiss(processing);
        setProjectAndNavigate(project);
      } else {
        // Retrieve and update the user's role for the project
        const { data: projectRoleData } = await getProjectRole({
          variables: { userId: user?.id, projectId: project?.id },
        });
        
        if(projectRoleData?.user_projects[0]?.is_p_revoked) {
          throw new Error('You are revoked from this project');
        }

        // if (projectRoleData?.user_projects?.length > 0) {
          const defaultRole = projectRoleData.user_projects[0].user_role;
          await updateDefaultRole({
            variables: {
              userId: user.id,
              values: { defaultRole},
            },
          });
        // }
        toast.dismiss(processing);
        setProjectAndNavigate(project);
      }
    } catch (error) {
      // toast.dismiss(processing);
      console.error(error);
      toast.error(error.message, {id: processing});
      // alert('Something went wrong!');
    }    
  };

  // Sets the current project in localStorage and navigates to the project page
  const setProjectAndNavigate = (project) => {
    localStorage.setItem('project', JSON.stringify(project));
    navigate("/organization/project", { state: { 'project': project } });
  };

  return (
    <>
    <div className={styles['content-wrapper']}>
      <div className={styles.heading}>
        <h4>{organization_name}</h4>
        <DropdownButton variant='secondary' title='Organization details'>
          <Dropdown.Item as='button' onClick={() => navigate('/organization/cameras')}>Cameras</Dropdown.Item>
          <Dropdown.Item as='button' onClick={handleShow}>Edit organization</Dropdown.Item>
        </DropdownButton>        
      </div>
      <div className={styles.subheading}>
        <h5>Projects</h5>
        {user?.defaultRole !== 'admin' &&
        <Button variant="outline-secondary" size='sm' 
          style={{display: 'flex', alignItems: 'center'}}
          onClick={handleNewProject}
        >
          <PlusCircleIcon className={styles.icon}/> <span>New Projects</span>
        </Button>
        }
      </div>
      <div className={styles['project-list']}>
        {error && <p>Something went wrong. Try to refresh the page.</p>}
        {(loading || gettingProjectRole) && <Spinner />} 
        {data?.projects?.length
        ? <>
          {data.projects.map((project, index) => ( 
          <div className={styles['project-item']} key={index}>                  
            <button className={styles['project-button']}
              onClick={() => handleItemClick(project)}
            >
              <p style={{marginBottom: 0, }}>
              <strong>{project.short_name}</strong> <br /> 
              <span className={styles.span}>
                created by {project?.created_by} {formatTimeAgo(project?.created_at)} 
              </span>
              </p>     
            </button>            
          </div>  
          ))}
          </>
        : <div>No projects created.</div>
        }       
      </div>
      <div>
        <h5>Organization Administrators</h5>
        <p></p>
        <AddOrgUser 
          emailList = {staffs?.user_organizations?.map(staff => staff?.user?.email)}
          requeryUsers={GET_ORGANIZATION_STAFF}
        />
        <div className='mt-3'>          
          {errorUsers && <div>Error fetching data. Try again</div> }
          {loadingUsers && <Spinner />}
          {staffs?.user_organizations?.length
          ? <>
            <p>Below are the people who can manage all projects listed above:</p>
            <EditOrgUserList
              userData={staffs?.user_organizations}
              user_id={user?.id}
              userRole={user?.defaultRole}
            />
            </>            
          : <div>No members added as yet.</div>  
          
        }
        </div>
      </div>      
    </div>   
    {show && <EditOrganization show={show} handleClose={handleClose} />} 
    </>
  )
}

export default OrganizationPage