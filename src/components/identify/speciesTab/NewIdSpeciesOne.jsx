// This component allows users to identify species in a single image. 
// To identify multiple images simultaneously, then NewIdSpecies component 
// will be used which is opened from the FloatingMenu component. 

import { useRef, useState, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import {Form, Button} from 'react-bootstrap';
import Select from 'react-select';
import { useQuery, useMutation } from '@apollo/client';
import { INSERT_IMAGE_SPECIES, UPDATE_IMAGES, INSERT_IDENTIFY_HISTORY_BULK 
} from '../../../api/identifyGql';
import { GET_SPECIES } from '../../../api/speciesGql';
import { toast } from 'react-hot-toast';
// import Spinner from '../../Spinner';
import { label, inputStyle } from '../../../helpers';
import IdentifyContext from '../IdentifyContext';

const NewIdSpeciesOne = ({images, setImages, currentImageIndex, setCurrentImageIndex}) => {
  const { user } = useOutletContext();
  const { refetchImages } = useContext(IdentifyContext);
  const remarks = useRef(''); 
  const [isProcessing, setIsProcessing] = useState(false);

  // Store species details in array.
  const [animals, setAnimals] = useState(    
    [{
      selectedSpecies: null,
      individual_count: 1, 
      image_file_id: images[currentImageIndex]?.id,      
    }]
  );

  const { data: speciesData } = useQuery(GET_SPECIES)
  const [insertImageSpecies] = useMutation(INSERT_IMAGE_SPECIES);
  const [insertIdentifyHistory] = useMutation(INSERT_IDENTIFY_HISTORY_BULK);
  const [updateImages] = useMutation(UPDATE_IMAGES) 

  // Update the properties of an animal at a specific index
  const handleAnimalChange = (index, event) => { 
    const {name, value} = event.target; 
    const temp = [...animals ]; // Create a copy of the animals array
    
    // Update the property of the animal at the specified index
    temp[index][name] = name === 'individual_count' ? +value : value; 
    setAnimals(temp);  // Update the state with the modified array 
  };

  // Update the species_id property of an animal at a specific index
  const handleSpeciesIDChange = (index, selectedOption) => {
    const temp = [...animals]; // Create a copy of the animals array

    // Update the species_id property of the animal at the specified index
    temp[index].selectedSpecies = selectedOption;
    setAnimals(temp); // Update the state with the modified array
  };

  // Add a new animal object to the animals array
  const handleAddAnimal = () => {
    // Create a new animal object with default values
    const temp = {
      selectedSpecies: null,
      individual_count: 1,        
    };

    //Update the state by adding the new animal object to the existing array
    setAnimals([...animals, temp]);
  };

  const handleRemoveAnimal = () => {
    const temp = [...animals]; // Create a shallow copy of the array
    temp.pop(); // Remove the last element from the copy
    setAnimals(temp); // Update the state with the modified array
  };

  // This function handles the form submission (adding image reviews)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true); 

    //ID of the image
    const imageId = images[currentImageIndex].id;  

    const speciesHistory = [{image_file_id: imageId, type: 'species'}] 
    const imageSpecies = [];

    for(const animal of animals) {
      imageSpecies.push({
        image_file_id: imageId,
        species_id: animal.selectedSpecies.value,
        individual_count: animal.individual_count
      })

    }  
    try {
      // Run the image review and image update operations in parallel using Promise.all()
        await Promise.all([
          insertImageSpecies({
            variables: { imageSpecies }
          }),
          insertIdentifyHistory({
            variables: {
              values: speciesHistory
            }
          }),
          updateImages({
            variables: { 
              imageIds: [imageId],
              values: {
                is_identified: true,                
                species_count: animals?.length,
                identified_by: user?.displayName,
                identified_at: new Date(), 
                remarks: remarks?.current?.value
              }
            }
          })
        ]);
        toast.success('Photo identified successfully', {position: 'bottom-center'});
        // Update the images array in state without refetching from the server        
        setImages((prevImages) => prevImages.filter(image => image.id !== imageId));
        
        // Update the current index, if necessary
        if (currentImageIndex === images.length - 1) {
          // If we deleted the last image, set index to the last index of the updated array
          setCurrentImageIndex(currentImageIndex - 1);  // if result is -1, modal will close      
        }
      } catch (error) {
        console.error( error);
        toast.error('An error has occurred.', {position: 'bottom-center'})        
    } 
    setIsProcessing(false);     
  };

  return (
    <>
    <Form onSubmit={handleSubmit} >      
    {animals.map((animal, index) => (
      <fieldset 
        style={{border: '1px dotted grey', position: 'relative'}} 
        key={index} className='mb-2 p-1'
      >
        <span style={{position: 'absolute',  top: '-5px', fontSize: '0.75rem', color: 'green' }}>
          {index+1}.
        </span>
        <Form.Group className="mb-2" 
          style={{...inputStyle, display: 'flex', gap: '0.5rem', alignItems: 'center'}} 
        >
          <Form.Label style={label}>Species<span style={{color: 'red'}}>*</span>:</Form.Label>
          <div style={{width: '100%'}}>
            <Select 
              // value={speciesData?.species?.find((option) => option.value === animal.species_id)}
              onChange={(selectedOption) => handleSpeciesIDChange(index, selectedOption)}
              isClearable            
              options={speciesData?.species?.map(s => (
                {value: s.id, label: s.common_name, scientificName: s.scientific_name}
                ) )}                    
              placeholder='Select species...'                    
              required           
            />
            <Form.Text style={{fontSize: '0.80rem',}}>
                {animal?.selectedSpecies?.scientificName}
              </Form.Text>
          </div>
        </Form.Group>      
        
        <Form.Group  className="mb-2" 
          style={{...inputStyle, display: 'flex', gap: '0.5rem', alignItems: 'center'}} 
        >
          <Form.Label   style={label}>Count<span style={{color: 'red'}}>*</span>: </Form.Label>          
            <Form.Control 
              type="number" placeholder='' size='sm' 
              value={animal.individual_count} 
              onChange={(event) => handleAnimalChange(index, event)} 
              name="individual_count"
              min={1}    
              required
              style={inputStyle}
            />
        </Form.Group>             
      </fieldset> 
      ))}
      <Form.Group>
        <Form.Label style={label}>Remarks:</Form.Label>
        <Form.Control 
          as='textarea' size='sm'
          ref={remarks}
          rows={1}
          style={inputStyle}
        />
      </Form.Group>
      
      <Button 
        className='mb-1 mt-3' 
        variant='success'
        style={{width: '100%'}} 
        onClick={handleAddAnimal}
        size='sm'
      >
        Add animal
      </Button>
      { animals.length > 1 &&   
        <Button 
          variant="outline-success"
          style={{width: '100%'}}
          onClick={handleRemoveAnimal}
          size='sm'
        >
          Remove animal
        </Button>
      }
      
      <div className='mt-4' style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        {/* <Button variant="outline-secondary" onClick={() => setShowI(false)} >
          Cancel
        </Button> */}
        <Button variant="primary" type="submit" size='sm'
          disabled={isProcessing}
        >
          Submit
        </Button>
      </div>
    </Form>
    </>    
  )
}

export default NewIdSpeciesOne