/*
This component allows admin users to insert new data into "individuals" table.
*/
import { useState } from 'react';
import {Button, Form, Row, Col} from 'react-bootstrap';
import Spinner from '../Spinner';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation} from '@apollo/client';
import { INSERT_INDIVIDUAL_ONE, GET_INDIVIDUALS } from '../../api/individualsGql';
import { GET_SPECIES } from '../../api/speciesGql';
import { label, inputStyle, ages, sexes } from '../../helpers';

const AddIndividuals = ({handleClose}) => {
  const [codeName, setCodeName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [yearDiscovered, setYearDiscovered] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  const [insertIndividual, {loading: insertingIndividual}] = useMutation(INSERT_INDIVIDUAL_ONE, {
    refetchQueries: [{query: GET_INDIVIDUALS}]
  });
  const {loading: loadingSpecies, data: speciesData } = useQuery(GET_SPECIES)

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(individualName, age, sex, remarks, speciesId, markings)
    try{
      await insertIndividual({
        variables: {
          values: {
            code_name: codeName.trim(),
            age, sex, remarks,
            year_discovered: yearDiscovered,
            species_id: selectedSpecies.value
          }          
        }
      })      
      toast.success('Successfully inserted data.')
      handleClose();
    }catch(error){
      console.error(error.message)
      toast.error('Unable to insert data!')
    }
  }
  
  return (
    <>
    <Form onSubmit={handleSubmit}>
      <Row>
        <Form.Group as={Col} className="mb-3" xs>
          <Form.Label style={label}>Code name:<span style={{color: 'red'}}>*</span></Form.Label>
          <Form.Control type="text" 
            value={codeName} 
            onChange={e => setCodeName(e.target.value)}
            placeholder="Enter code name"  
            required
            style={inputStyle}
          />
          <Form.Text style={{fontSize: '0.8rem'}}>
            Short and unique
          </Form.Text>
        </Form.Group>

        <Form.Group as={Col} className="mb-3" xs>
          <Form.Label style={label}>Year discovered: </Form.Label>
          <Form.Control value={yearDiscovered}
            onChange={e => setYearDiscovered(e.target.value)}
            style={inputStyle}
          />
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" style={inputStyle}>
        <Form.Label style={label}>Species<span style={{color: 'red'}}>*</span></Form.Label>
        <Select 
          // value={speciesData?.species?.find((option) => option.value === animal.species_id)}
          onChange={(selected) => setSelectedSpecies(selected)}
          isClearable
          isLoading={loadingSpecies} 
          isDisabled={loadingSpecies}           
          options={speciesData?.species?.map(s => (
            {value: s.id, label: s.common_name, scientificName: s.scientific_name}
            ) )}                    
          placeholder='Select species...'                    
          required
          size='sm'
        />
        <Form.Text style={{fontSize: '0.8rem'}}>
          {selectedSpecies?.scientificName}
        </Form.Text>
      </Form.Group>
      <Row>
        <Form.Group as={Col} className="mb-3" xs>
          <Form.Label style={label}>Age:</Form.Label>
          <Form.Select value={age} 
            onChange={e => setAge(e.target.value)}
            style={inputStyle}
          >
            <option value='' className='text-muted'>Choose...</option>
            {ages.map(age => (
              <option value={age.value} key={age.value}>{age.label}</option>
            ))}
          </Form.Select>        
        </Form.Group>   
        
        
        <Form.Group as={Col} className="mb-3" xs>
          <Form.Label style={label}>Sex:</Form.Label>
          <Form.Select value={sex} 
            onChange={e => setSex(e.target.value)}
            style={inputStyle}
          >
            <option value='' className='text-muted'>Choose...</option>
            {sexes.map(sex =>(
              <option value={sex.value} key={sex.value}>{sex.label}</option>
            ))}
          </Form.Select>        
        </Form.Group>  
      </Row> 

      <Form.Group className='mb-3'>
        <Form.Label style={label}>Remarks: </Form.Label>
        <Form.Control as='textarea' rows={1} value={remarks}
          onChange={e => setRemarks(e.target.value)}
          style={inputStyle}
        />
      </Form.Group>
      
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        <Button variant="outline-secondary" onClick={handleClose} >
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={insertingIndividual}>
          Create {insertingIndividual && <Spinner size='sm'/> }
        </Button>
      </div>
    </Form>
    
    </>
  )
}

export default AddIndividuals