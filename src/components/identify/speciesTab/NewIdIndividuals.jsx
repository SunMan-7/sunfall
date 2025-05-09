/*
This component is where users identify specific characteristics (sex, age, etc.) of
each individual species in an image.
*/
import { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import {Form, Button, } from 'react-bootstrap';
import Select from 'react-select';
import { useLazyQuery, useMutation } from '@apollo/client';
import { INSERT_IDENTIFY_HISTORY_BULK, INSERT_IMAGE_INDIVIDUALS_MANY, UPDATE_IMAGES
} from '../../../api/identifyGql';
import { toast } from 'react-hot-toast';
import { label, inputStyle, ages, sexes, animalSides } from '../../../helpers';
import { GET_INDIVIDUAL_BY_SPECIES } from '../../../api/individualsGql';
import IdentifyContext from '../IdentifyContext';

const NewIdIndividuals = ({images, currentImageIndex}) => {
  const { refetchImages} = useContext(IdentifyContext);
  const { user } = useOutletContext();
  const [individuals, setIndividuals] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [getIndividuals, { data: individualList, loading}] = useLazyQuery(GET_INDIVIDUAL_BY_SPECIES);
  const [insertImageIndividuals,] = useMutation(INSERT_IMAGE_INDIVIDUALS_MANY)
  const [insertHistory] = useMutation(INSERT_IDENTIFY_HISTORY_BULK);
  const [updateImages] = useMutation(UPDATE_IMAGES) 

  // Update the species_id property of an animal at a specific index
  const handleChange = (index, selectedOption, name) => {
    const temp = [...individuals]; // Create a copy of the animals array

    // Update specific property of the individual at the specified index and name of object
    temp[index][name] = selectedOption;
    if(name === 'selectedSpecies' && selectedOption ){
      getIndividuals({variables: {speciesId: selectedOption.value}})
    }
    setIndividuals(temp); // Update the state with the modified array
  };

  // Add a new individual to the individuals array
  const handleAddIndividual = () => {
    // Create a new animal object with default values
    const temp = {
      selectedSpecies: null,
      selectedAge: null,
      selectedSex: null,
      selectedSide: null,
      selectedIndividual: null,      
    };

    //Update the state by adding the new animal object to the existing array
    setIndividuals([...individuals, temp]);
  };

  const handleRemoveIndividual = () => {
    const temp = [...individuals]; // Create a shallow copy of the array
    temp.pop(); // Remove the last element from the copy
    setIndividuals(temp); // Update the state with the modified array
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setIsProcessing(true); // disables the submit button
    const values = [];
    const history = [{image_file_id: images[currentImageIndex].id, type: 'individuals'}]
    for (const individual of individuals) {
      values.push({
        image_species_id: individual.selectedSpecies.imageSpeciesId,
        age: individual.selectedAge.value,
        sex: individual.selectedSex.value,
        side: individual.selectedSide?.value ?? null,
        individual_id: individual.selectedIndividual?.value ?? null,
      })
    }

    try{
      await insertImageIndividuals({
        variables: {values}
      })
      await insertHistory({
        variables: {values: history}
      })
      updateImages({
        variables: { 
          imageIds: [images[currentImageIndex].id],
          values: {
            is_profiled: true,
            profiled_by: user.displayName,
            profiled_at: new Date(),
          }
        }
      })
      toast.success('Data saved successfully.')
      refetchImages();
    }catch(error){
      console.log(error.message);
      toast.error('Unable to insert data!',)
    }

    setIsProcessing(false); // enables the submit button
  }

  useEffect(() => {
    setIndividuals([])
  }, [currentImageIndex])

  return (
    <>
    <Form onSubmit={handleSubmit}>
      <div style={{maxHeight: '35em', overflowX: 'hidden', overflowY: 'auto'}}>
      {individuals?.map((individual, index) => (
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
                value={individual.selectedSpecies}
                onChange={(selectedOption) => handleChange(index, selectedOption, 'selectedSpecies')}
                isClearable            
                options={images[currentImageIndex]?.imageSpecies?.map(s => (
                  {value: s.species.id, label: s.species.common_name, 
                    scientificName: s.species.scientific_name, imageSpeciesId: s.id
                  }
                  ) )}                    
                placeholder='Select species...'                    
                required           
              />
            {/* <Form.Text style={{fontSize: '0.80rem',}}>
            </Form.Text> */}
            </div>
          </Form.Group> 
          <Form.Group className="mb-2" 
            style={{...inputStyle, display: 'flex', gap: '0.5rem', alignItems: 'center'}} 
          >
            <Form.Label style={label}>Age<span style={{color: 'red'}}>*</span>:</Form.Label>
            <div style={{width: '100%'}}>
            <Select 
              // value={individual.selectedAge}
              onChange={(selectedOption) => handleChange(index, selectedOption, 'selectedAge')}
              isClearable            
              options={ages}                    
              placeholder='Select age...'                    
              required           
            />
            </div>
          </Form.Group> 
          <Form.Group className="mb-2" 
            style={{...inputStyle, display: 'flex', gap: '0.5rem', alignItems: 'center'}} 
          >
            <Form.Label style={label}>Sex<span style={{color: 'red'}}>*</span>:</Form.Label>
            <div style={{width: '100%'}}>
            <Select 
              // value={individual.selectedSex}
              onChange={(selectedOption) => handleChange(index, selectedOption, 'selectedSex')}
              isClearable            
              options={sexes}                    
              placeholder='Select sex...'                    
              required           
            />
            </div>
          </Form.Group>

          <Form.Group className="mb-2" 
            style={{...inputStyle, display: 'flex', gap: '0.5rem', alignItems: 'center'}} 
          >
            <Form.Label style={label}>Side:</Form.Label>
            <div style={{width: '100%'}}>
              <Select 
                // value={individual.selectedSide}
                onChange={(selectedOption) => handleChange(index, selectedOption, 'selectedSide')}
                isClearable            
                options={animalSides}                    
                placeholder='Select animal side...'            
              />
            </div>
          </Form.Group>
          <Form.Group className="mb-2" 
            style={{...inputStyle, display: 'flex', gap: '0.5rem', alignItems: 'center'}} 
          >
            <Form.Label style={label}>Individual:</Form.Label>
            <div style={{width: '100%'}}>
              <Select 
                // value={individual?.selectedIndividual}
                isLoading={loading}
                isDisabled={loading}
                onChange={(selectedOption) => handleChange(index, selectedOption, 'selectedIndividual')}
                isClearable            
                options={individualList?.individuals?.map(i => ({value: i.id, label: i.code_name}))}                    
                placeholder='Select individual...'           
              />
            </div>
          </Form.Group>
        </fieldset>
      ))}
      </div>

      <Button 
        className='mb-1 mt-3' 
        variant='success'
        style={{width: '100%'}} 
        onClick={handleAddIndividual}
        size='sm'
        disabled={images[currentImageIndex]?.totalIndividuals === individuals.length}
      >
        Add individual
      </Button>
      { individuals.length > 0 &&   
        <Button 
          variant="outline-success"
          style={{width: '100%'}}
          onClick={handleRemoveIndividual}
          size='sm'
        >
          Remove individual
        </Button>
      }
      
      <div className='mt-4' style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        {/* <Button variant="outline-secondary" onClick={() => setShowI(false)} >
          Cancel
        </Button> */}
        <Button variant="primary" type="submit" size='sm'
          disabled={individuals?.length === 0 || isProcessing}
        >
          Submit
        </Button>
      </div>
    </Form>
    </>
  )
}

export default NewIdIndividuals