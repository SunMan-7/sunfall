/*
This component allows specific users to insert location.
*/
import { useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useMutation,} from '@apollo/client';
import { toast } from 'react-hot-toast';
import { INSERT_LOCATION, GET_PROJECT_LOCATIONS } from '../../api/locationGql';
import { label, inputStyle } from '../../helpers';

const asterisk = {
  color: 'red'
}

const NewLocation = ({handleClose}) => {
  const selectedProject = JSON.parse(localStorage.getItem('project')); 
  const [insertLocation, {loading}] = useMutation(INSERT_LOCATION, {
    refetchQueries: [GET_PROJECT_LOCATIONS]
  });
  const [insertAgain, setInsertAgain] = useState(false);  

  const locationName = useRef();
  const y = useRef();
  const x = useRef();
  const remarks = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();  
    try {
      const {data} = await insertLocation({
        variables: {location: {
          location_name: locationName?.current?.value, 
          x: x?.current?.value,
          y: y?.current?.value,
          project_id: selectedProject?.id, 
          remarks: remarks?.current?.value,
        }}
      })
      console.log(data)
      toast.success('Data successfully added', {duration: 3000});
      setInsertAgain(true);
      // handleClose();
    }catch(error) {
      console.log(error);
      toast.error("Unable to add data.", {duration: 3000});
    }
  }
  return (
    <>
    <Form onSubmit={handleSubmit} style={label}>
      <Form.Group className="mb-3">
        <Form.Label>Location name: <span style={asterisk}>*</span></Form.Label>
        <Form.Control type="text" style={inputStyle}
          ref={locationName} 
          placeholder="Enter location name" 
          required 
        />
        {/* <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text> */}
      </Form.Group>
      <Row>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>X: <span style={asterisk}>*</span></Form.Label>
          <Form.Control type="text" style={inputStyle} min={0}
            ref={x}  required 
            pattern="[0-9]*[.]?[0-9]+" 
            // title="Please enter a valid number"
          />
        </Form.Group>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>Y: <span style={asterisk}>*</span></Form.Label>
          <Form.Control type="text" style={inputStyle} min={0}
            ref={y}  required 
            pattern="[0-9]*[.]?[0-9]+" 
          />
        </Form.Group>      
      </Row>

      <Form.Group className='mb-3'>
        <Form.Label>Remarks: </Form.Label>
        <Form.Control type="text" style={inputStyle} ref={remarks}/>
      </Form.Group>
      
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        <Button variant="outline-secondary" onClick={handleClose} >
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading} style={{cursor: loading && 'not-allowed'}}>
          {insertAgain ? 'Create Another' : 'Create'}
        </Button>
      </div>
    </Form>
    </>
  )
}

export default NewLocation