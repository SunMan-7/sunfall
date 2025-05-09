import { useRef, useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { ADD_ORGANIZATION_ONE, GET_ORGANIZATIONS_PROJECTS } from '../../api/organizationGql';
import { useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { label, inputStyle } from '../../helpers';

const NewOrganization = ({show, handleClose}) => {
  const [addOrganization, {loading}] = useMutation(ADD_ORGANIZATION_ONE, {
    refetchQueries: [GET_ORGANIZATIONS_PROJECTS]
  });

  const [addAnother, setAddAnother] = useState(false)

  const organizationName = useRef();
  const shortName = useRef();
  const codeName = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Insert required data into "organizations" table
      await addOrganization({
        variables: {
          values: {
            organization_name: organizationName.current.value,
            short_name: shortName.current.value,
            code_name: codeName.current.value.trim()
          }
        }
      })
      toast.success('Data successfully added',);
      setAddAnother(true);
    }catch(error) {
      console.error(error.message);
      toast.error('Unable to update!',);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Organization</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
        <Modal.Body>        
          <Form.Group className="mb-3" >
            <Form.Label style={label}>
              Organization name<span style={{color: 'red'}}>*</span>
            </Form.Label>
            <Form.Control 
              type="text"
              ref={organizationName} 
              required 
              style={inputStyle}
            />
          </Form.Group>
          <Row>
            <Form.Group as={Col} className="mb-3" xs>
              <Form.Label style={label}>
                Short name<span style={{color: 'red'}}>*</span>
              </Form.Label>
              <Form.Control 
                type="text"
                ref={shortName}
                required 
                style={inputStyle}
              />
            </Form.Group>
            <Form.Group as={Col} className="mb-3" xs>
              <Form.Label style={label}>
                Code name<span style={{color: 'red'}}>*</span>:
              </Form.Label>
              <Form.Control 
                type="text"
                ref={codeName}
                required 
              />
              
              <Form.Text>
                Must be unique and short
              </Form.Text>
            </Form.Group>
          </Row>
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" type='submit' disabled={loading}>
            {addAnother ? 'Create Another' : 'Create'}
          </Button>
        </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default NewOrganization