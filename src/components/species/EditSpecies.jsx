import { useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from '../Spinner';
import { toast } from 'react-hot-toast';
import { useMutation} from '@apollo/client';
import { UPDATE_SPECIES_BYID, GET_SPECIES } from '../../api/speciesGql';

const EditSpecies = ({data, handleClose}) => {  
  const [commonName, setCommonName] = useState(data?.common_name ?? '');
  const [speciesName, setSpeciesName] = useState(data?.species_name ?? '');
  const [category, setCategory] = useState(data?.category ?? '');
  const [className, setClassName] = useState(data?.class ?? '');
  const [remarks, setRemarks] = useState(data?.remarks ?? '');

  const isCommonNameDirty = commonName !== data?.common_name;
  const isSpeciesNameDirty = speciesName !== data?.species_name;
  const isCategoryDirty = category !== data?.category;
  const isClassNameDirty = className !== data?.class_name;
  const isRemarksDirty = remarks !== data?.remarks;

  const isSpeciesFormDirty = (isCommonNameDirty || isSpeciesNameDirty 
    || isCategoryDirty || isClassNameDirty || isRemarksDirty)

  const [updateSpecies, {loading: updatingSpecies}] = useMutation(UPDATE_SPECIES_BYID, {
    refetchQueries: [{query: GET_SPECIES}]
  });

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      await updateSpecies({
        variables: {
          speciesId: data?.id, 
          commonName, speciesName, category,
          className, remarks 
        }
      })
      toast.success('Successfully updated details')
    }catch(error) {
      console.log(error.message);
      toast.error('Unable to update species')
    }
  }

  return (
    <>
    <Form onSubmit={handleSubmit} style={{fontSize: '14px'}} >
      <Form.Group className="mb-3">
        <Form.Label>Common name:<span style={{color: 'red'}}>*</span></Form.Label>
        <Form.Control type="text" value={commonName} size='sm'
          placeholder="Enter common name"  required
          onChange={e => setCommonName(e.target.value)}
        />        
      </Form.Group>

      <Form.Group className="mb-3" >
        <Form.Label>Species name:</Form.Label>
        <Form.Control type="text" value={speciesName} size='sm'
          placeholder='Enter species name' 
          onChange={e => setSpeciesName(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3" >
        <Form.Label>Category:</Form.Label>
        <Form.Control type="text" value={category} size='sm'
          placeholder='Enter category'
          onChange={e => setCategory(e.target.value)} 
        />
      </Form.Group>   

      <Form.Group className="mb-3" >
        <Form.Label>Class name:</Form.Label>
        <Form.Control type="text" value={className} size='sm'
          placeholder='Enter class name' 
          onChange={e => setClassName(e.target.value)} 
        />
      </Form.Group>    

      <Form.Group className='mb-3'>
        <Form.Label>Remarks: </Form.Label>
        <Form.Control as='textarea' value={remarks} rows={1} size='sm'
          onChange={e => setRemarks(e.target.value)}
        />
      </Form.Group>
      
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        <Button variant="outline-secondary" onClick={handleClose} size='sm'>
          Cancel
        </Button>
        <Button variant="primary" type="submit" size='sm'
          disabled={!isSpeciesFormDirty || updatingSpecies}
        >
          Save changes {updatingSpecies ? <Spinner size='sm'/> : null}
        </Button>
      </div>
    </Form>
    </>
  )
}

export default EditSpecies