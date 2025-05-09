/*
This component allows users to a one recent project. Users can click on their organization name
and it will direct them to the organization page. Users can also click on global data or download
under Resources. Admin users will be able to see a slightly different display, which is a list of 
organizations and their projects.
*/
import { useNavigate, useOutletContext} from 'react-router-dom';
import { useState } from 'react';
import styles from '../styles/pages/Home.module.css';
import { Row, Col, Button } from 'react-bootstrap';
import NewOrganization from '../components/admin/NewOrganization';
import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client';
import Spinner from '../components/Spinner';
import { GET_ORGANIZATIONS_PROJECTS, GET_USER_PROJECT_ROLE } from '../api/organizationGql';
import { formatTimeAgo } from '../helpers';
import { toast } from 'react-hot-toast';

// Updates user's default role. 
// This is placed here so that it updates the user cache 
// without requering GET_USER_QUERY (IDK why)
const UPDATE_USER_MUTATION = gql `
  mutation ($userId: uuid!, $values: users_set_input, $organizationId: Int!) {
    updateUser(pk_columns: {id: $userId}, 
      _set: $values,
      _append: {metadata: {defaultOrganizationId: $organizationId}}
    ) {
      id
      defaultRole
      metadata
    }
  }
`

const AdminPage = () => {
  const navigate = useNavigate(); 
  const { user } = useOutletContext();
  const [show, setShow] = useState(false); 

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const {loading, error, data } = useQuery(GET_ORGANIZATIONS_PROJECTS); 
  const [getProjectRole] = useLazyQuery(GET_USER_PROJECT_ROLE);
  const [updateDefaultRole] = useMutation(UPDATE_USER_MUTATION);

  // Function to get the is_revoked and role for a specific organization ID
  function getOrganizationDetails(organizationId) {
    const organization = user?.user_organizations.find(org => org.organization_id === organizationId);
    if (organization) {
      // Return an object containing is_revoked and role
      return { is_revoked: organization.is_revoked, role: organization.role };
    } else {
      // Return null or handle the case when organization is not found
      return null;
    }
  }

  const handleItemClickOrganization = async (organization) => {
    if( user?.defaultRole === 'admin'){
      localStorage.setItem('organization', JSON.stringify(organization)); 
      return navigate("/organization", {state: {organization}});
    }
    const processing = toast.loading('Please wait...');
    const {is_revoked, role: defaultRole } = getOrganizationDetails(organization?.id);

    try{
    // Check if the user is not revoked from organization
    if (is_revoked){
      throw new Error("You are revoked from this organization!")
    }

    if(defaultRole !== 'member'){
      await updateDefaultRole({
        variables: {
          userId: user.id,
          values: { defaultRole},
          organizationId: organization?.id
        },
      });
    } else {
      await updateDefaultRole({
        variables: {
          userId: user.id,
          values: { defaultRole: "user"},
          organizationId: organization?.id
        },
      });
    }   
    // localStorage.setItem('organization', JSON.stringify({'organization': organization})); 
    localStorage.setItem('organization', JSON.stringify(organization));  
    toast.dismiss(processing);     
    navigate("/organization", {state: {organization}})   
  }catch(error){
    console.error(error);
    toast.error(error.message, {id: processing});
  } 
  };
  
  const handleItemClickProject = async(organization, project) => {
    if( user?.defaultRole === 'admin'){
      localStorage.setItem('organization', JSON.stringify(organization));
      localStorage.setItem('project', JSON.stringify(project));    
      return navigate("/organization/project", {state: {'project': project}} );
      // return navigate("/organization", {state: {organization}});
    }
    const processing = toast.loading('Please wait...');
    const {is_revoked, role: defaultRole } = getOrganizationDetails(organization?.id);

    try {
      // Check if the user is not revoked from organization
      if (is_revoked){
        throw new Error("You are revoked from this organization!")
      }

      // Check if the user has a high-level role
      if (defaultRole !== 'member') {
        await updateDefaultRole({
          variables: {
            userId: user.id,
            values: { defaultRole},
            organizationId: organization?.id
          },
        });        
        localStorage.setItem('organization', JSON.stringify(organization));
        localStorage.setItem('project', JSON.stringify(project));   
        toast.dismiss(processing);  
        navigate("/organization/project", {state: {'project': project}} );
      } else {
        // Retrieve and update the user's role for the project
        const { data: projectRoleData } = await getProjectRole({
          variables: { userId: user?.id, projectId: project?.id },
        });

        if(projectRoleData?.user_projects[0]?.is_p_revoked) {
          throw new Error('You are revoked from this project');
        }

        // if (projectRoleData?.user_projects?.length > 0) {
          const defaultRole = projectRoleData?.user_projects[0]?.user_role;
          await updateDefaultRole({
            variables: {
              userId: user.id,
              values: { defaultRole},
              organizationId: organization?.id
            },
          });
        // }
        toast.dismiss(processing);
        localStorage.setItem('organization', JSON.stringify(organization));
        localStorage.setItem('project', JSON.stringify(project));     
        navigate("/organization/project", {state: {'project': project}} );
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, {id: processing});
    } 
  };

  if(loading){
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Spinner/>
      </div>
    )
  }

  if(error) {
    console.log(error)
    return <div>Something went wrong! Try refreshing the page</div>
  }  

  return (  
    <> 
      <div className={styles.content} >
        <Row >
          <Col sm={12} md="8">
            <div className={styles['content-heading']}>
              <div><h3 className="mb-">Current Projects</h3></div>
              <div>
                {user.defaultRole === 'admin' && 
                <Button variant="outline-secondary" size='sm' onClick={handleShow}>
                  New Organization
                </Button>
                }
              </div>
            </div>
            
            <div className={styles['left-list']}>            
            {
             data?.organizations.map((organization, index) => (              
              <div key={index} className="mb-4">
                <button>
                  <strong onClick={() => handleItemClickOrganization(organization)} >
                    {organization.organization_name}
                  </strong>
                </button>  
                <div className={styles['project-wrapper']}>
                  {organization?.projects?.length > 0 &&
                  <button
                    className={styles['project-button']}
                    onClick={() => handleItemClickProject(organization, organization?.projects[0])}
                  >
                    <p style={{marginBottom: 0, }}>
                      <strong>{organization?.projects[0]?.short_name}</strong> <br/>
                      <span className={styles.span}>
                        created by {organization?.projects[0]?.created_by} {formatTimeAgo(organization?.projects[0]?.created_at)}
                      </span>
                    </p>  
                  </button> 
                  }
                </div>      
              </div>              
            )) 
            }            
            </div>
          </Col>

          <Col sm={12} md="4">
          <p style={{marginBottom: '10px'}}>Organizations</p> 
          <div className={styles['right-list']} >                      
            {data?.organizations.map((organization, index) => (  
            <div key={index} className="mb-2" >
              <button className={styles['organization-button']}>
                <strong onClick={() => handleItemClickOrganization(organization)} >
                  {organization.organization_name}
                </strong>
              </button> 
            </div>
            ))}
          </div>
          <p style={{marginBottom: '10px'}}>Resources</p>
          <div className={styles['right-list']}>
            <div className='mb-2'>
              <button className={styles['resource-button']}
                onClick={() => navigate('/species')}
              >
                <strong>Species</strong>
              </button>
            </div>

            <div className='mb-2'>
              <button className={styles['resource-button']}
                onClick={() => navigate('/individuals')}
              >
                <strong>Individuals</strong>
              </button>
            </div>

            <div className='mb-2' style={{display: user?.defaultRole === 'admin' ? {}: 'none'}}>
              <button className={styles['resource-button']}
                onClick={() => navigate('/download-data')}
              >
                <strong>Download Data</strong>
              </button>
            </div>

            <div className='mb-2'>
              <button className={styles['resource-button']}
                onClick={() => 
                  window.open(
                    'https://belizecameratrap-docs.netlify.app/docs/category/the-basics', 
                    '_blank')
                  }
              >
                <strong>User Guide</strong>
              </button>
            </div>

          </div>
          </Col>
        </Row>      
      </div>
      {show && <NewOrganization show={show} handleClose={handleClose} />}
    </>
  )
}

export default AdminPage