/* 
This will display a list of filter options that users can use to filter specific
image types (for catalogue tab).
*/

import { useState, memo } from 'react';
import { Form, Button} from 'react-bootstrap';
import { inputStyle, buildWhereClause } from '../../helpers';
import Select from 'react-select';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_DEPLOYMENT_NAMES_BY_LOC_ID } from '../../api/deploymentGql';
import { GET_PROJECT_LOCATIONS } from '../../api/locationGql';
import { GET_SUBPROJECTS } from '../../api/subprojectGql';
import { GET_PROJECT_SPECIES } from '../../api/speciesGql';

const FilterOptions = ({fetchData, loading}) => {
  const { id: projectId } = JSON.parse(localStorage.getItem('project'));
  const [species, setSpecies] = useState();
  const [subproject, setSubproject] = useState(null);
  const [location, setLocation] = useState(null);
  const [deployment, setDeployment] = useState(null);

  // fetch list of species from the database
  const { data: speciesList, loading: loadingSpecies } = useQuery(GET_PROJECT_SPECIES, {
    variables: {projectId}, skip: !projectId
  });

  // fetch subproject names from the database
  const { data: subprojectNames, loading: loadingSubprojects } = useQuery(GET_SUBPROJECTS, {
    variables: {projectId}, skip: !projectId
  });

  // Fetch location names from the database
  const { data: locationNames, loading: loadingLocations} = useQuery(GET_PROJECT_LOCATIONS, {
    variables: {projectId}, skip: !projectId
  });

  // fetch deployment names from the database based on the location entered 
  const [getDeploymentNames, 
    { data: depNames, loading: loadingDeployments}] = useLazyQuery(GET_DEPLOYMENT_NAMES_BY_LOC_ID); 

  // Fetch data after users enters their filtered option(s)
  const handleFetch = () => {    
    const condition = buildWhereClause({
      projectId,
      locationId: location?.value,
      subprojectId: subproject?.value,
      deploymentId: deployment?.value,
      isIdentified: true,
      speciesId: species?.value
    })
    fetchData({
      variables: {condition}
    })
  }

  return (
    <Form>
      <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>        
      <Form.Group style={inputStyle} >          
          <Select                        
            onChange={(prop) => {setSpecies(prop) }}
            isDisabled={loadingSpecies}
            isLoading={loadingSpecies}
            isClearable
            options={speciesList?.species?.map(s => (
              {value: s?.id, label: s?.common_name,
                scientificName: s?.scientific_name
              }
            ))}           
            placeholder='Select species...' 
          />
          <Form.Text style={{fontSize: '0.80rem',}}>
            {species &&
              species?.scientificName
            }
          </Form.Text>
        </Form.Group>
        <Form.Group style={inputStyle} >          
          <Select                        
            onChange={(prop) => {setSubproject(prop) }}
            isDisabled={loadingSubprojects}
            isLoading={loadingSubprojects}
            isClearable                   
            options={subprojectNames?.subprojects?.map(s => (
              {value: s.id, label: s.subproject_name}
              ) )}           
            placeholder='Select subproject...'    
            size='sm'
            style={{fontSize: '10px'}}
          />
        </Form.Group>
        <Form.Group style={inputStyle} >
          {/* <Form.Label>Deployment</Form.Label> */}
          <Select                 
            onChange={prop => {
              setLocation(prop)
              getDeploymentNames({ variables: {
                projectId, locationId: prop?.value
              }})
            }}    
            isDisabled={loadingLocations}
            isLoading={loadingLocations}
            isClearable                      
            options={locationNames?.locations?.map(l => (
              {value: l.id, label: l.location_name}
              ) )}                       
            placeholder='Select location...' 
            size='sm'
          />          
        </Form.Group> 

        <Form.Group style={ inputStyle} >
          {/* <Form.Label>Deployment</Form.Label> */}
          <Select                 
            onChange={prop => {setDeployment(prop)}}    
            isDisabled={!location || loadingDeployments}
            isLoading={loadingDeployments}
            isClearable           
            options={depNames?.deployments?.map(d => (
              {value: d?.id, label: d?.deployment_name,
              cameraName: d?.camera?.camera_name, checkNumber: d?.check_number
              }
              ) )}           
            placeholder='Select camera checks...'     
          />
        </Form.Group>       
      </div>      
      <Button 
        className='mt-2'
        style={{width: '100%'}}
          onClick={handleFetch}
          disabled={loading || (!species && !subproject && !location && !deployment)}   
          size='sm'       
      >
        {loading ? 'loading...' : 'Fetch Data'}
      </Button>
      <hr/>
    </Form>  
  )
}

export default memo(FilterOptions)