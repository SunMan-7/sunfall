/*
This component allows users to update data of individuals identified in an image.
Users can add additional individuals depending on the number of individuals identified
in previous identification of species. The "Add new individual" button will be disabled
when it is equal to the number of individuals recorded in previous identification.
*/
import { useCallback, useEffect, useState, useContext }from 'react';
import { useOutletContext } from 'react-router-dom';
import {Form, Button,} from 'react-bootstrap';
import Select from 'react-select';
import { label, inputStyle, ages, sexes, animalSides } from '../../../helpers';
import { GET_INDIVIDUALS,} from '../../../api/individualsGql';
import { UPDATE_IMAGE_INDIVIDUALS_MANY, INSERT_IMAGE_INDIVIDUALS_MANY,
  INSERT_IDENTIFY_HISTORY_BULK, UPDATE_IMAGES
 } from '../../../api/identifyGql';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import IdentifyContext from '../IdentifyContext';

const EditIdIndividuals = ({images, currentImageIndex}) => {
  const { user } = useOutletContext();
  const { refetchImages } = useContext(IdentifyContext);
  const [individuals, setIndividuals] = useState([]);
  const [newIndividuals, setNewIndividuals] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // button will be disabled when updating image

  // const [getIndividuals, { data: individualList, loading}] = useLazyQuery(GET_INDIVIDUAL_BY_SPECIES);
  const {data: individualList, loading} = useQuery(GET_INDIVIDUALS);
  const [updateImageIndividuals] = useMutation(UPDATE_IMAGE_INDIVIDUALS_MANY);
  const [insertImageIndividuals,] = useMutation(INSERT_IMAGE_INDIVIDUALS_MANY)
  const [insertIdentifyHistory] = useMutation(INSERT_IDENTIFY_HISTORY_BULK);
  const [updateImages] = useMutation(UPDATE_IMAGES);

  // Update the species_id property of an animal at a specific index
  const handleChange = (index, selectedOption, name, dataType='old') => {
    setIsDisabled(false);
    if(dataType === 'old'){ // modify the array that contains old data that will be updated in the database
      const temp = [...individuals]; // Create a copy of the animals array

      // Update specific property of the individual at the specified index and name of object
      temp[index][name] = selectedOption;
      // if(name === 'selectedSpecies' && selectedOption ){
      //   getIndividuals({variables: {speciesId: selectedOption.value}})
      // }
      setIndividuals(temp); // Update the state with the modified array
    }else{ // modify the array that contains new data that will be inserted in the database
      const temp = [...newIndividuals]; // Create a copy of the animals array

      // Update specific property of the new individual at the specified index and name of object
      temp[index][name] = selectedOption;
      // if(name === 'selectedSpecies' && selectedOption ){
      //   getIndividuals({variables: {speciesId: selectedOption.value}})
      // }
      setNewIndividuals(temp); // Update the state with the modified array

    }
  };

  // Add a new individual to the individuals array
  const handleAddNewIndividual = () => {
    // Create a new animal object with default values
    const temp = {
      selectedSpecies: null,
      selectedAge: null,
      selectedSex: null,
      selectedSide: null,
      selectedIndividual: null,      
    };

    //Update the state by adding the new object to the existing array
    setNewIndividuals([...newIndividuals, temp]);
  };

  const handleRemoveNewIndividual = () => {
    const temp = [...newIndividuals]; // Create a shallow copy of the array
    temp.pop(); // Remove the last element from the copy
    setNewIndividuals(temp); // Update the state with the modified array
  };

  const handleSubmit = async(e) => {
    setIsProcessing(true);
    e.preventDefault();

    const updatedValues = [];
    const newValues = [];

    // Data will be inserted into indentification_history
    const history = [{image_file_id: images[currentImageIndex].id, type: 'individuals'}]

    for (const individual of individuals) { // data to be updated
      updatedValues.push({
        where: {id: {_eq: individual.imageIndividual_id}},
        _set: {
          image_species_id: individual.selectedSpecies.imageSpeciesId,
          age: individual.selectedAge?.value,
          sex: individual.selectedSex?.value,
          side: individual.selectedSide?.value ?? null,
          individual_id: individual.selectedIndividual?.value ?? null,
        }
      })
    }
    for (const individual of newIndividuals) { // new data to be inserted if any
      newValues.push({
        image_species_id: individual.selectedSpecies.imageSpeciesId,
        age: individual.selectedAge.value,
        sex: individual.selectedSex.value,
        side: individual.selectedSide?.value ?? null,
        individual_id: individual.selectedIndividual?.value ?? null,
        
      })
    }

    try{
      await updateImageIndividuals({
        variables: {
          values: updatedValues 
        }
      })
      if(newValues.length > 0){ // insert if there are new individual(s) identified
        await insertImageIndividuals({
          variables: {
            values: newValues
          }
        })
      }
      await insertIdentifyHistory({
        variables: {
          values: history
        }
      })
      await updateImages({
        variables: {
          imageIds: [images[currentImageIndex].id],
          values: {
            profiled_by: user.displayName,
            profiled_at: new Date(),
          }
        }
      })
      toast.success("Successfully saved your changes", {position: 'bottom-center'});
      refetchImages();
      setNewIndividuals([]);
    }catch(error){
      console.log(error.message);
      toast.error('Unable to update image', {position: 'bottom-center'})
    }

    setIsProcessing(false);
  }

  // Process data in a structured way to easily map it for display and track changes.
  const processIndividuals = useCallback(() => {
    const temp = [];
    for (const imageSpecies of images[currentImageIndex].imageSpecies){
      for (const imageIndividual of imageSpecies.image_individuals){
        temp.push({
          selectedSpecies: {
            value: imageSpecies.species.id, 
            label: imageSpecies.species.common_name,
            scientificName: imageSpecies.species.scientific_name,
            imageSpeciesId: imageSpecies.id
          },
          selectedAge: {value: imageIndividual?.age, label: imageIndividual?.age},
          selectedSex: {value: imageIndividual?.sex, label: imageIndividual?.sex},
          selectedSide: {value: imageIndividual?.side ?? null, label: imageIndividual?.side ?? ''},
          selectedIndividual: {
            value: imageIndividual?.individual?.id ?? null, 
            label: imageIndividual?.individual?.code_name ?? ''
          },
          imageIndividual_id: imageIndividual.id
        })
      }
    }
    // console.log(temp);
    setIndividuals(temp);

  }, [currentImageIndex, images])

  useEffect(() => {
    processIndividuals();    
  }, [processIndividuals]);

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
                defaultValue={individual.selectedSpecies}
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
                {individual.selectedSpecies.scientificName}
              </Form.Text> */}
            </div>
          </Form.Group> 

          <Form.Group className="mb-2" 
            style={{...inputStyle, display: 'flex', gap: '0.5rem', alignItems: 'center'}} 
          >
            <Form.Label style={label}>Age<span style={{color: 'red'}}>*</span>:</Form.Label>
            <div style={{width: '100%'}}>
              <Select 
                value={individual.selectedAge}
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
                value={individual.selectedSex}
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
                value={individual?.selectedSide}
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
              value={individual?.selectedIndividual}
              isLoading={loading}
              isDisabled={loading}
              onChange={(selectedOption) => handleChange(index, selectedOption, 'selectedIndividual')}
              isClearable 
              options={individualList?.individuals?.filter(i => i.species.id === individual?.selectedSpecies?.value)
                .map(i => ({value: i.id, label: i.code_name}))
              }                     
              placeholder='Select individual...'           
            />
            </div>
          </Form.Group>
        </fieldset>
      ))}

      {/* Form contains new fields for new individual data */}
      {newIndividuals?.map((individual, index) => (
        <fieldset 
          style={{border: '1px dotted grey'}} 
          key={index} className='mb-2 p-1'
        >
          <Form.Group className="mb-2" 
            style={{...inputStyle, display: 'flex', gap: '0.5rem', alignItems: 'center'}} 
          >
            <Form.Label style={label}>Species<span style={{color: 'red'}}>*</span>:</Form.Label>
            <div style={{width: '100%'}}>
              <Select 
                // value={individual.selectedSpecies}
                onChange={(selectedOption) => handleChange(index, selectedOption, 'selectedSpecies', 'new')}
                isClearable            
                options={images[currentImageIndex]?.imageSpecies?.map(s => (
                  {value: s.species.id, label: s.species.common_name, 
                    scientificName: s.species.scientific_name, imageSpeciesId: s.id
                  }
                  ) )}                    
                placeholder='Select species...'                                 
                required           
              />
              <Form.Text style={{fontSize: '0.80rem',}}>
                {individual?.selectedSpecies?.scientificName}
              </Form.Text>
            </div>
          </Form.Group> 
          
          <Form.Group className="mb-2" 
            style={{...inputStyle, display: 'flex', gap: '0.5rem', alignItems: 'center'}} 
          >
            <Form.Label style={label}>Age<span style={{color: 'red'}}>*</span>:</Form.Label>
            <div style={{width: '100%'}}>
              <Select 
                // value={individual.selectedAge}
                onChange={(selectedOption) => handleChange(index, selectedOption, 'selectedAge', 'new')}
                isClearable            
                options={ages}                    
                placeholder='Age...'                    
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
                onChange={(selectedOption) => handleChange(index, selectedOption, 'selectedSex', 'new')}
                isClearable            
                options={sexes}                    
                placeholder='Sex...'                    
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
                onChange={(selectedOption) => handleChange(index, selectedOption, 'selectedSide', 'new')}
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
                onChange={(selectedOption) => handleChange(index, selectedOption, 'selectedIndividual', 'new')}
                isClearable 
                options={individualList?.individuals?.filter(i => i.species.id === individual?.selectedSpecies?.value)
                  .map(i => ({value: i.id, label: i.code_name}))
                }                     
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
        onClick={handleAddNewIndividual}
        size='sm'
        disabled={images[currentImageIndex].totalIndividuals <= (individuals.length + newIndividuals.length)}
      >
        Add new individual
      </Button>
      { newIndividuals.length > 0 &&   
        <Button 
          variant="outline-success"
          style={{width: '100%'}}
          onClick={handleRemoveNewIndividual}
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
          disabled={isDisabled || isProcessing}
        >
          Update image
        </Button>
      </div>
    </Form>
    </>
  )
}

export default EditIdIndividuals