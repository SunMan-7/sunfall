/* 
This will display a list of filter options that users can use to filter specific
image types.
*/

import { useState, memo, useEffect, useContext } from 'react';
import styles from '../../styles/components/Identify.module.css'
import { Form, Button} from 'react-bootstrap';
import { inputStyle, buildWhereClause, parseDateFields } from '../../helpers';
import Select from 'react-select';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_DEPLOYMENT_NAMES_BY_LOC_ID } from '../../api/deploymentGql';
import { GET_PROJECT_LOCATIONS } from '../../api/locationGql';
import { GET_SUBPROJECTS } from '../../api/subprojectGql';
import { GET_PROJECT_SPECIES } from '../../api/speciesGql';
import { EyeSlashIcon, EyeIcon, } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import IdentifyContext from './IdentifyContext';

const iconStyle = { width: '0.95rem' };

const FilterOptions = ({ setImages, nhost}) => {
  const {data, getImages, loading} = useContext(IdentifyContext);
  const { id: projectId } = JSON.parse(localStorage.getItem('project'));
  const [species, setSpecies] = useState();
  const [subproject, setSubproject] = useState(null);
  const [location, setLocation] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const [isIdentified, setIsIdentified] = useState(null);

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
    
  const processImages = (data) => {
    const newImages = (data || []).map((image) => {
      try {
        // Extract and parse date fields from the image object
        const { dateTaken, uploadedAt, identifiedAt, profiledAt } = parseDateFields(image);      
  
        return {
          id: image.file_id,
          src: nhost?.storage?.getPublicUrl({ fileId: image.file_id }),
          nano: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADBAMAAABG2rP1AAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAA9QTFRF3d3d2dnZ0NDQ0tLS19fXXxw5gQAAABFJREFUeJxjZGBgFFJiZGAAAAD9ADiVKTTFAAAAAElFTkSuQmCC",
          width: 150,
          height: 100,
          dateTaken,
          deployment: image.deployment,
          name: image.file_name,
          isHighlighted: image.is_highlighted,
          isIdentified: image.is_identified,
          identifiedBy: image.identified_by,
          identifiedAt,
          isProfiled: image.is_profiled,
          profiledBy: image.profiled_by,
          profiledAt,
          remarks: image.remarks,
          imageSpecies: image.image_species,
          totalIndividuals: image.image_species_aggregate?.aggregate?.sum?.individual_count,
          uploadedAt,
          uploadedBy: image.uploaded_by,
          tags: createTagObjects(
            image.deployment.camera.camera_name, 
            dateTaken, 
            image.is_identified, 
            image.is_highlighted),
          customOverlay: createCustomOverlay(image)
        };
      } catch (error) {
        console.error(error);
        return null;  // Return null or some error indicator for this item
      }
    }).filter(Boolean); // Remove any null entries due to errors
  
    setImages(newImages);  // Update the state once with the complete new array
  };
 
  // Filters images based on the filter inputs
  // const handleFilter = useCallback((e) => {
  //   e?.preventDefault(); 

  //   let data2 = data?.filter(i => {      
  //     return(
  //       (species === null || i?.image_species?.some(s => s.species_id === species?.value)) &&
  //       (location === null || i?.deployment?.location?.id === location?.value ) &&
  //       (subproject === null || i?.deployment?.subproject?.id === subproject?.value) &&
  //       (deployment === null || i?.deployment?.id === deployment?.value ) &&
  //       (isIdentified === null || i?.is_identified === isIdentified?.value) 
  //     )
  //   })

  //   processImages(data2)
  // }, [data, species, deployment, location, subproject, isIdentified, processImages])  

  // Fetch data after users enters their filtered option(s)
  const handleFetch = () => {    
    const condition = buildWhereClause({
      projectId,
      locationId: location?.value,
      subprojectId: subproject?.value,
      deploymentId: deployment?.value,
      isIdentified: isIdentified?.value ,
      speciesId: species?.value
    })
    getImages({
      variables: {condition}
    })
  }

  useEffect(() => {
    processImages(data);
  }, [data])

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
        <Form.Group style={inputStyle} >
          {/* <Form.Label>Deployment</Form.Label> */}
          <Select                 
            onChange={prop => {setIsIdentified(prop)}}    
            // isDisabled={!location || loadingDeployments}
            // isLoading={loadingDeployments}
            isClearable           
            options={[
              {value: true, label: 'Identified'}, {value: false, label: 'Unidentified'}
            ]}           
            placeholder='Identified?'     
          />
        </Form.Group>       
      </div>      
      <Button 
        className='mt-2'
        style={{width: '100%'}}
          onClick={handleFetch}
          disabled={loading || (!species && !subproject && !location && !deployment && !isIdentified)}   
          size='sm'       
      >
        {loading ? 'loading...' : 'Fetch Data'}
      </Button>
      <hr/>
    </Form>  
  )
}

export default memo(FilterOptions)

// Constructs tag objects for each image, including identification icons and camera details.
const createTagObjects = (cameraName, dateTaken, isIdentified, isHighlighted) => {
  const isHighlightedIcon = <StarIcon style={iconStyle} />
  const isIdentifiedIcon =  isIdentified 
    ? <EyeIcon style={iconStyle}/> 
    : <EyeSlashIcon style={{ ...iconStyle, color: 'orange' }} />;
  // const cameraName =  image.deployment.camera.camera_name;
  const tagObjects = [{value: isIdentifiedIcon }, {value: cameraName}, {value: dateTaken},]

  return (isHighlighted ? [{value: isHighlightedIcon}, ...tagObjects] : tagObjects) 
};

// Generates a custom overlay component for each image, displaying additional metadata such as file name,
// camera placement, and check number.
const createCustomOverlay = (image) => {
  const cameraPlacement = image.deployment.camera_placement === 1 
    ? `${image.deployment.camera_placement} | left` 
    : `${image.deployment.camera_placement} | right`;

  const checkNumber = `Check ${image.deployment.check_number}`;

  return (
    <div className={styles['custom-overlay__caption']}>
      <div className={styles['custom-overlay__tag']}>
        {image?.file_name}
      </div>
      <div className={styles['custom-overlay__tag']}>
        {cameraPlacement}
      </div>
      <div className={styles['custom-overlay__tag']}>
        {checkNumber}
      </div>
    </div>
  );
};



