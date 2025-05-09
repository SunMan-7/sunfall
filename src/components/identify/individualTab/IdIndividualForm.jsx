/*
This form consists of an input field where users can select one or more individual names. 
The corresponding images of the selected individuals will be displayed below. Users can
click "Match" if a match is found. 
*/ 

import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import Spinner from '../../Spinner';
import { ADD_INDIVIDUAL_IMAGES, UPDATE_IMAGE_IS_PROFILED,
  GET_IMAGES_SID_DID_SPID
} from '../../../api/identifyGql';
import { GET_INDIVIDUALS, GET_INDIVIDUALS_ROSETTES_SPECIESID } from '../../../api/individualsGql';
import { useOutletContext } from 'react-router-dom';
import CustomSlider from '../../CustomSlider';

const IdIndividualForm = ({imageIds, speciesId, cancel}) => {  
  const { nhost } = useOutletContext(); // To retrieve image URLs
  const [individuals, setIndividuals] = useState([]) // Save individual(s) selected
  const [currentIndex, setCurrentIndex] = useState(0) // Save current index of image selected
  const [rosette, setRosette] = useState(); // Save rosette

  // Fetch data from the individual_images table
  const [addIndividualImages, {loading: addingData}] = useMutation(ADD_INDIVIDUAL_IMAGES, {
    refetchQueries: [GET_INDIVIDUALS]
  });

  // Update rows in image table to set is_profiled to true.
  const [updateImageIsProfiled, {loading: updatingImageIsProfiled}] = useMutation(UPDATE_IMAGE_IS_PROFILED, 
    { refetchQueries: [GET_IMAGES_SID_DID_SPID] }
    );
  
  // Fetch names and rosette id from individuals table.
  // const {loading: loadingIndividuals, data } = useQuery(GET_INDIVIDUAL_NAMES);
 
  // Fetch names and rosette id from individuals table.
  const {loading: loadingIndividuals, data } = useQuery(GET_INDIVIDUALS_ROSETTES_SPECIESID, {
    variables: {speciesId},
    skip: !speciesId
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    const combinedArray = []; // declare empty array

    // Merge each object from the individuals array to each object in imageIds array.
    for (let i = 0; i < imageIds.length; i++) {
      for (let j = 0; j < individuals.length; j++) {
        combinedArray.push({
          image_file_id: imageIds[i],
          individual_id: individuals[j].value,          
        });
      }
    }    

    try {
      // Insert rows of data into the individual_images table in the database
      await addIndividualImages({
        variables: {
          individuals: combinedArray
        }
      })
      // Update is_profiled field to true in the image table based on id provided
      updateImageIsProfiled({
        variables: {
          fileIds: imageIds
        }
      })
      toast.success('Data saved successfully.');
      cancel(); // Close off the modal window
    }catch(error) {
      console.error(error.message);
      toast.error('Unable to add data');
    }
  };

  // function to merge rosette object array within one or more individual object arrays
  const handleIndividualSelections = (selected) => {
    setIndividuals(selected); // Store selected individuals
    const mergedArray = selected.flatMap((obj) => {
      return obj.rosettes?.flatMap((r) => {
        return {
          src: nhost.storage.getPublicUrl({ fileId: r.file_id }),
          name: obj.label,
          side: r.side,
        };
      }) || []; // return empty array if none found
    });
    setRosette(mergedArray);  
  }

  return (
    <>
    <Form onSubmit={handleSubmit} style={{fontSize: '12px'}}>     
      <Form.Group className="mb-2" >
        {/* <Form.Label> Select named individual(s) that match individual on the left:<span style={{color: 'red'}}>*</span></Form.Label> */}
        <Select 
          value={individuals}            
          onChange={ selected => handleIndividualSelections(selected)}
          isClearable 
          isMulti
          isLoading={loadingIndividuals}   
          isDisabled={loadingIndividuals}        
          options={data?.individuals?.map(i => (
            {value: i.id, label: i.individual_name, 
              rosettes: i.rosettes,             
            }
          ) )}                    
          placeholder='Select individual...'                    
          required
          size='sm'
        />
      </Form.Group>          

      {individuals?.length > 0 && 
      <div >
        <div>
          {rosette[currentIndex]?.name} {rosette[currentIndex]?.side}
        </div>        
        <CustomSlider 
          images={rosette} 
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />        
      </div>
      }
        
      <div className='mt-4' 
        style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}
      >
        <Button variant="outline-secondary" onClick={cancel} size='sm'>
          Cancel
        </Button>
        <Button variant="primary" type="submit" size='sm'
          disabled={addingData || updatingImageIsProfiled || !individuals}
        >
          {addingData || updatingImageIsProfiled ? <Spinner size='sm'/> : 'Match Selections'} 
        </Button>
      </div>
    </Form>
    </>
  )
}

export default IdIndividualForm