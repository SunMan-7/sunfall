/* 
When the user clicks an individual image in the identify section, 
a modal form opens and this identify EDIT form will be displayed on the 
right side of the image only if the image was previously identified
 */

import { useState, useEffect, useContext }from 'react';
import { useOutletContext } from 'react-router-dom';
import {Form, Button} from 'react-bootstrap';
import Select from 'react-select';
import { useQuery, useMutation } from '@apollo/client';
import { label, inputStyle } from '../../../helpers';
import { GET_SPECIES } from '../../../api/speciesGql';
import { INSERT_IMAGE_SPECIES, UPDATE_IMAGES, INSERT_IDENTIFY_HISTORY_BULK ,
  UPDATE_IMAGE_SPECIES
} from '../../../api/identifyGql';
import { toast } from 'react-hot-toast';
import IdentifyContext from '../IdentifyContext';

const EditIdSpecies = ({images, currentImageIndex}) => {
  const { user } = useOutletContext();
  const { refetchImages } = useContext(IdentifyContext);
  const { data: speciesData } = useQuery(GET_SPECIES)
  const [animals, setAnimals] = useState([]);
  const [newAnimals, setNewAnimals] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true); // Disables the update image button unless users make changes

  const [insertImageSpecies] = useMutation(INSERT_IMAGE_SPECIES);
  const [insertIdentifyHistory] = useMutation(INSERT_IDENTIFY_HISTORY_BULK);
  const [updateImages] = useMutation(UPDATE_IMAGES);
  const [updateImageSpecies] = useMutation(UPDATE_IMAGE_SPECIES)

  // Update the species_id property of an animal at a specific index
  const handleSpeciesIDChange = (index, selectedOption, dataType = 'existing') => {
    setIsDisabled(false)
    if (dataType === 'existing'){ // Execute if user is updating an existing data
      const temp = [...animals]
      temp[index].selectedSpecies = selectedOption;
      setAnimals(temp);
    }else{ // Execute if user is adding new data
      const temp = [...newAnimals]
      temp[index].selectedSpecies = selectedOption;
      setNewAnimals(temp);
    }
  };
  // Update the properties of an animal at a specific index
  const handleAnimalChange = (index, event, dataType = 'existing') => { 
    setIsDisabled(false);
    const {name, value} = event.target; 
    if(dataType === 'existing'){      
      const temp = [...animals ]; // Create a copy of the animals array
      
      // Update the property of the animal at the specified index
      temp[index][name] = name === 'individual_count' ? +value : value; 
      setAnimals(temp);  // Update the state with the modified array 
    }else{ 
      const temp = [...newAnimals ]; // Create a copy of the animals array
      
      // Update the property of the animal at the specified index
      temp[index][name] = name === 'individual_count' ? +value : value; 
      setNewAnimals(temp);  // Update the state with the modified array 
    }
  };

  // Add a new animal object to the animals array
  const handleAddAnimal = () => {
    setIsDisabled(false); 
    // Create a new animal object with default values
    // Since this is a 
    const temp = {
      selectedSpecies: null,
      individual_count: 0,     
    };

    //Update the state by adding the new animal object to the existing array
    setNewAnimals([...newAnimals, temp]);
  };

  const handleRemoveAnimal = () => {
    const temp = [...newAnimals]; // Create a shallow copy of the array
    temp.pop(); // Remove the last element from the copy
    setNewAnimals(temp); // Update the state with the modified array
  };

  const handleUpdate = async(e) => {
    e.preventDefault();
    setIsProcessing(true); 
    const history = [{image_file_id: images[currentImageIndex].id, type: 'species'}];    
    const updatedValues = [];
    const imageSpecies = [];

    for(const animal of animals) {
      updatedValues.push({
        where: {id: {_eq: animal.id}}, 
        _set: {
          individual_count: animal.individual_count, 
          species_id: animal.selectedSpecies.value,          
        }
      })
    }
    for(const animal of newAnimals) {
      imageSpecies.push({
        image_file_id: images[currentImageIndex].id,
        species_id: animal.selectedSpecies.value,
        individual_count: animal.individual_count
      })
    }  

    try {
      // If users entered new animals, insert new data
      if(newAnimals?.length > 0) {
        await insertImageSpecies({
          variables: { imageSpecies }
        });
      }
      // save changes to image identification operations in parallel using Promise.all()
        await Promise.all([
          updateImageSpecies({
            variables: { values: updatedValues}
          }),          
          insertIdentifyHistory({
            variables: {
              values: history
            }
          }),
          updateImages({
            variables: { 
              imageIds: [images[currentImageIndex].id],
              values: {
                species_count: animals?.length + newAnimals?.length,
                identified_at: new Date(),
                identified_by: user.displayName,
                remarks
              }
            }
          })
        ]);        
        toast.success('Image identified successfully', {position: 'bottom-right'});
        refetchImages();
      } catch (error) {
        console.error( error);
        toast.error('An error has occurred.', {position: 'bottom-right'})        
    }  

    setIsProcessing(false);
    setIsDisabled(true); 
  }  

  useEffect(() => {
    setAnimals(images[currentImageIndex]?.imageSpecies?.map(s => {
      return {
        id: s.id, 
        selectedSpecies: {
          value: s.species.id,
          label: s.species.common_name,
          scientificName: s?.species?.scientific_name
        }, 
        individual_count: s.individual_count}
    }));
    setRemarks(images[currentImageIndex]?.remarks)
    setNewAnimals([])
    setIsDisabled(true);

  }, [currentImageIndex, images,])

  return (
    <>
    
    <Form onSubmit={handleUpdate}>
    {animals.map((animal, index) => (
      <fieldset style={{border: '1px dotted grey', position: 'relative'}} 
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
              value={animal.selectedSpecies}
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
          </div>
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
    {newAnimals.map((animal, index) => (
      <fieldset 
        style={{border: '1px dotted grey'}} 
        key={index} className='mb-2 p-1'
      >
        <Form.Group className="mb-2" style={inputStyle} >
          {/* <Form.Label style={label}>Species<span style={{color: 'red'}}>*</span>:</Form.Label> */}
          <Select 
            // value={speciesData?.species?.find((option) => option.value === animal.species_id)}
            onChange={(selectedOption) => handleSpeciesIDChange(index, selectedOption, 'new')}
            // isClearable            
            options={speciesData?.species?.map(s => (
              {value: s.id, label: s.common_name, scientificName: s.scientific_name}
              ) )}                    
            placeholder='Select species...'                    
            required           
          />
          {/* <Form.Text style={{fontSize: '0.80rem',}}>
          </Form.Text> */}
        </Form.Group>      
        
        <Form.Group  className="mb-2" 
          style={{...inputStyle, display: 'flex', gap: '0.5rem', alignItems: 'center', width: '50%'}}  
        >
          <Form.Label style={label}>Count<span style={{color: 'red'}}>*</span>: </Form.Label>          
          <Form.Control 
            type="number" placeholder='' size='sm' 
            value={animal.individual_count} 
            onChange={(event) => handleAnimalChange(index, event, 'new')} 
            name="individual_count"
            min={0}    
            required            
          />
        </Form.Group>             
      </fieldset> 
      ))}
    <Form.Group>
        <Form.Label style={label}>Remarks:</Form.Label>
        <Form.Control 
          as='textarea' size='sm'
          value={remarks}
          onChange={(e) => {
            setRemarks(e.target.value)
            setIsDisabled(false);
          }}
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
      { newAnimals.length > 0 &&   
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
          disabled={isDisabled || isProcessing}
        >
          Update image
        </Button>
      </div>
    </Form>   
    </>
  )
}

export default EditIdSpecies