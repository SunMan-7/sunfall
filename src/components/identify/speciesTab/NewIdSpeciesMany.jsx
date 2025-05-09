/*
This component allows users to identify images in bulk. They can select multiple images
and identify species in those images.
*/
import { useRef, useState } from 'react';
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

const NewIdSpeciesMany = ({imageIds, setImages}) => {
  const { user } = useOutletContext();
  const remarks = useRef(); 
  const [isProcessing, setIsProcessing] = useState(false);

  // Store species details in array.
  const [animals, setAnimals] = useState(    
    [{
      species_id: 0,
      individual_count: 0,      
    }]
  );

  const { data: speciesData } = useQuery(GET_SPECIES)
  const [insertImageSpecies] = useMutation(INSERT_IMAGE_SPECIES);
  const [insertIdentifyHistory] = useMutation(INSERT_IDENTIFY_HISTORY_BULK);
  const [updateImages] = useMutation(UPDATE_IMAGES) 

  // Update the properties of an animal at a specific index
  const handleAnimalChange = (index, event) => { 
    const {name, value} = event.target; 
    const newAnimal = [...animals ]; // Create a copy of the animals array
    
    // Update the property of the animal at the specified index
    newAnimal[index][name] = name === 'individual_count' ? +value : value; 
    setAnimals(newAnimal);  // Update the state with the modified array 
  };

  // Update the species_id property of an animal at a specific index
  const handleSpeciesIDChange = (index, selectedOption) => {
    const newAnimal = [...animals]; // Create a copy of the animals array

    // Update the species_id property of the animal at the specified index
    newAnimal[index].species_id = selectedOption?.value;
    setAnimals(newAnimal); // Update the state with the modified array
  };

  // Add a new animal object to the animals array
  const handleAddAnimal = () => {
    // Create a new animal object with default values
    const newAnimal = {
      species_id: 0,
      individual_count: 0,      
    };

    //Update the state by adding the new animal object to the existing array
    setAnimals([...animals, newAnimal]);
  };

  const handleRemoveAnimal = () => {
    const temp = [...animals]; // Create a shallow copy of the array
    temp.pop(); // Remove the last element from the copy
    setAnimals(temp); // Update the state with the modified array
  };

  // This function handles the form submission (adding species identification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true); 
    const imageSpecies = [];
    const identifyHistory = [];

    imageIds.forEach(image_file_id => {
      identifyHistory.push({ image_file_id, type: 'species' });
      animals.forEach(animal => {
        imageSpecies.push({ ...animal, image_file_id });
      });
    });

    try {
      // Run the image review and image update operations in parallel using Promise.all()
        await Promise.all([
          insertImageSpecies({variables: { imageSpecies } }),
          insertIdentifyHistory({variables: {values: identifyHistory} }),
          updateImages({
            variables: { 
              imageIds,
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
        toast.success('Image identified successfully', {position: 'bottom-right'});
        
        const idsToRemove = new Set(imageIds);
        // Update the images array in state without refetching from the server        
        setImages((prevImages) => {
          // Filter out images whose IDs are included in the imageIds array
          const updatedImages = prevImages.filter(image => !idsToRemove.has(image.id));
          return updatedImages;
        });
      } catch (error) {
        console.error( error);
        toast.error('An error has occurred.', {position: 'bottom-right'})        
    }finally {  
      setIsProcessing(false); 
    }    
  };

  return (
    <>
    <Form onSubmit={handleSubmit} >      
    {animals.map((animal, index) => (
      <fieldset 
        style={{border: '1px dotted grey'}} 
        key={index} className='mb-2 p-1'
      >
        <Form.Group className="mb-2" style={inputStyle} >
          {/* <Form.Label style={label}>Species<span style={{color: 'red'}}>*</span>:</Form.Label> */}
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
          {/* <Form.Text style={{fontSize: '0.80rem',}}>
          </Form.Text> */}
        </Form.Group>      
        
        <Form.Group  className="mb-2" style={{display: 'flex', flexWrap: 'nowrap', gap: '0.5em'}} >
          <Form.Label   style={label}>Count<span style={{color: 'red'}}>*</span>: </Form.Label>          
            <Form.Control 
              type="number" placeholder='' size='sm' 
              value={animal.individual_count} 
              onChange={(event) => handleAnimalChange(index, event)} 
              name="individual_count"
              min={0}    
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

export default NewIdSpeciesMany