/*
The data in this component can be viewed by all but can only be modified by
admin users. The component displays information about individual species, mostly
jaguar species.
*/
import { useState } from 'react';
import {Button, Form, Row, Col} from 'react-bootstrap';
import Spinner from '../Spinner';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation} from '@apollo/client';
import { UPDATE_INDIVIDUAL_BYID, GET_INDIVIDUALS } from '../../api/individualsGql';
import { GET_SPECIES } from '../../api/speciesGql';
import { label, inputStyle, ages, sexes} from '../../helpers';

const EditIndividuals = ({handleClose, data }) => {
  const speciesValue = {
    value: data?.species?.id, 
    label: data?.species?.common_name, 
    scientificName: data?.species?.scientific_name
  };
  const {loading: loadingSpecies, data: speciesData } = useQuery(GET_SPECIES);

  const [codeName, setCodeName] = useState(data?.code_name ?? '');
  const [age, setAge] = useState(data?.age ?? '');
  const [sex, setSex] = useState(data?.sex ?? '');
  const [remarks, setRemarks] = useState(data?.remarks ?? '');
  const [species, setSpecies] = useState(speciesValue ?? '');
  const [yearDiscovered, setYearDiscovered] = useState(data?.year_discovered ?? '');

  const isCodeNameDirty = codeName !== data?.code_name;
  const isAgeDirty = age !== data?.age;
  const isSexDirty = sex !== data?.sex;
  const isRemarksDirty = remarks !== data?.remarks;
  const isSpeciesDirty = species !== speciesValue;
  const isYearDiscovered = yearDiscovered !== data?.year_discovered;

  const isFormDirty = (isCodeNameDirty || isAgeDirty || isSexDirty
    || isRemarksDirty || isSpeciesDirty || isYearDiscovered);

  const [updateIndividual, {loading: updatingIndividual}] = useMutation(UPDATE_INDIVIDUAL_BYID, {
    refetchQueries: [{query: GET_INDIVIDUALS}]
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      // update a row in "individuals" table
      await updateIndividual({
        variables: {
          individualId: data?.id,
          values: {
            code_name: codeName,
            age: age, sex: sex, 
            remarks, 
            species_id: species?.value,
            year_discovered: yearDiscovered
          }
          
        }
      })      
      toast.success('Data updated successfully')
      handleClose(); // closes off the modal
    }catch(error){
      console.error(error.message)
      toast.error('Unable to update data.')
    }
  }
  
  return (
    <>
    <Form onSubmit={handleSubmit}>
      <Row>
        <Form.Group as={Col} className="mb-3" xs>
          <Form.Label style={label}>
            Code name:<span style={{color: 'red'}}>*</span>
          </Form.Label>
          <Form.Control type="text" 
            value={codeName} 
            onChange={e => setCodeName(e.target.value)}
            placeholder="Enter code name"  
            required
            style={inputStyle}
          />
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
        <Form.Label style={label}>
          Species<span style={{color: 'red'}}>*</span>
        </Form.Label>
        <Select 
          value={species}
          onChange={(selected) => setSpecies(selected)}
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
          {species?.scientificName}
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
            {ages?.map(age => (
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
            {sexes.map(sex => (
              <option value={sex.value} key={sex.value}>{sex.value}</option>
            ))}
          </Form.Select>        
        </Form.Group>  
      </Row> 

      {/* <Form.Group className='mb-3'>
        <Form.Label>Markings/Rosettes: </Form.Label>
        <Form.Control as='textarea' rows={1} value={markings}
          onChange={e => setMarkings(e.target.value)}
        />
      </Form.Group>  */}

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
        <Button variant="primary" type="submit" disabled={!isFormDirty || updatingIndividual } >
          Save changes {updatingIndividual && <Spinner size='sm'/> }
        </Button>
      </div>
    </Form>
    
    </>
  )
}

export default EditIndividuals