import { useRef } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Spinner from '../Spinner';
import { toast } from 'react-hot-toast';
import { useMutation} from '@apollo/client';
import { INSERT_SPECIES_ONE, GET_SPECIES,} from '../../api/speciesGql';
import { label, inputStyle } from '../../helpers';

const asterisk = {
  color: 'red'
}
const NewSpecies = ({handleClose}) => {
  const [insertSpeciesOne, {loading}] = useMutation(INSERT_SPECIES_ONE, {
    refetchQueries: [GET_SPECIES]
  });

  const taxonId = useRef(undefined);
  const className = useRef(null);
  const order = useRef(null);
  const family = useRef(null);
  const genus = useRef(null);
  const species = useRef(null);
  const taxonLevel = useRef(null);
  const authority = useRef(null);
  const commonName = useRef(null);
  const taxonomyType = useRef(null);
  const taxonomySubtype = useRef(null);
  const scientificName = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taxon_id = parseInt(taxonId?.current?.value)

    try {
      await insertSpeciesOne({
        variables: {
          values: {
            taxon_id,
            class: className?.current?.value,
            order: order?.current?.value,
            family: family?.current?.value,
            genus: genus?.current?.value, 
            species: species?.current?.value,
            taxon_level: taxonLevel?.current?.value,
            authority: authority?.current?.value, 
            commonName: commonName?.current?.value,
            taxonomy_type: taxonomyType?.current?.value,
            taxonomy_subtype: taxonomySubtype?.current?.value,
            scientificName: scientificName?.current?.value
          }          
        }
      })
      toast.success('Data successfully added',);
      handleClose();
    }catch(error) {
      console.log(error.message)
      toast.error('Unable to update!', );
    }
  }
  
  return (
    <>
    <Form onSubmit={handleSubmit} style={label}>
      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Taxon id:<span style={asterisk}>*</span></Form.Label>
          <Form.Control style={inputStyle} type="number" min={0} ref={taxonId} 
            required 
          />
        </Form.Group>      
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Class:</Form.Label>
          <Form.Control style={inputStyle} type="text" ref={className} />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Order:</Form.Label>
          <Form.Control style={inputStyle} type="text" ref={order} />
        </Form.Group>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Family:</Form.Label>
          <Form.Control style={inputStyle} type="text" ref={family} />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Genus:</Form.Label>
          <Form.Control style={inputStyle} type="text" ref={genus} 
            placeholder="Enter genus" 
          />
        </Form.Group>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Species:</Form.Label>
          <Form.Control style={inputStyle} type="text" ref={species}
            placeholder="Enter species"  
          />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Taxon level:</Form.Label>
          <Form.Control style={inputStyle} type="text" ref={taxonLevel} />
        </Form.Group>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Authority:</Form.Label>
          <Form.Control style={inputStyle} type="text" ref={authority} />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Common name:<span style={asterisk}>*</span></Form.Label>
          <Form.Control style={inputStyle} type="text" ref={commonName} 
            placeholder="Enter common name"  required
          />
        </Form.Group>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Taxonomy type:</Form.Label>
          <Form.Control style={inputStyle} type="text" ref={taxonomyType} />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Taxonomy Subtype:</Form.Label>
          <Form.Control style={inputStyle} type="text" ref={taxonomySubtype}/>
        </Form.Group>

        <Form.Group as={Col} className="mb-3" >
          <Form.Label>Scientific name:<span style={asterisk}>*</span></Form.Label>
          <Form.Control style={inputStyle} type="text" ref={scientificName} 
            placeholder='Genus + species' required
          />
        </Form.Group>
      </Row>
      
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        <Button variant="outline-secondary" onClick={handleClose} >
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          Create {loading ? <Spinner size='sm'/> : null}
        </Button>
      </div>
    </Form>
    
    </>
  )
}

export default NewSpecies;