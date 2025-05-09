import { Form, Row, Col } from 'react-bootstrap';
import { label, inputStyle } from '../../helpers';

const asterisk = {
  color: 'red'
}

const ViewSpecies = ({data, handleClose}) => {
  
  return (
    <>
    <Form style={label}>
      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Id:<span style={asterisk}>*</span></Form.Label>
          <Form.Control style={inputStyle} type="number" disabled defaultValue={data?.id} 
            required 
          />
        </Form.Group>      
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Class:</Form.Label>
          <Form.Control style={inputStyle} type="text" disabled defaultValue={data?.class} />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Order:</Form.Label>
          <Form.Control style={inputStyle} type="text" disabled defaultValue={data?.order} />
        </Form.Group>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Family:</Form.Label>
          <Form.Control style={inputStyle} type="text" disabled defaultValue={data?.family} />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Genus:</Form.Label>
          <Form.Control style={inputStyle} type="text" disabled defaultValue={data?.genus} 
            placeholder="Enter genus" 
          />
        </Form.Group>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Species:</Form.Label>
          <Form.Control style={inputStyle} type="text" disabled defaultValue={data?.species}
            placeholder="Enter species"  
          />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Taxon level:</Form.Label>
          <Form.Control style={inputStyle} type="text" disabled defaultValue={data?.taxon_level} />
        </Form.Group>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Authority:</Form.Label>
          <Form.Control style={inputStyle} type="text" disabled defaultValue={data?.authority} />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Common name:<span style={asterisk}>*</span></Form.Label>
          <Form.Control style={inputStyle} type="text" disabled defaultValue={data?.common_name}
          />
        </Form.Group>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Taxonomy type:</Form.Label>
          <Form.Control style={inputStyle} type="text" disabled defaultValue={data?.taxonomy_type} />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Taxonomy Subtype:</Form.Label>
          <Form.Control style={inputStyle} type="text" disabled defaultValue={data?.taxonomy_subtype}/>
        </Form.Group>

        <Form.Group as={Col} className="mb-3" >
          <Form.Label>Scientific name:<span style={asterisk}>*</span></Form.Label>
          <Form.Control style={inputStyle} type="text" disabled defaultValue={data?.scientific_name} 
          />
        </Form.Group>
      </Row>
    </Form>
    
    </>
  )
}

export default ViewSpecies;