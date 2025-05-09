/*
This component allows users to enter new subproject details and store it in 
subprojects table
*/
import { useRef } from "react"
import { Form, Button } from "react-bootstrap"
import { useMutation } from '@apollo/client';
import { INSERT_SUBPROJECT_ONE, GET_SUBPROJECTS } from "../../../api/subprojectGql";
import Spinner from '../../Spinner';
import { toast } from 'react-hot-toast';
import { label, inputStyle } from "../../../helpers";

const NewSubproject = ({handleClose}) => {
  const {id: projectId} = JSON.parse(localStorage.getItem('project'));
  const subprojectName = useRef();
  const description = useRef();

  const [insertSubproject, {loading}] = useMutation(INSERT_SUBPROJECT_ONE, {
    refetchQueries: [GET_SUBPROJECTS]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Add subproject details to the database
    try{
      await insertSubproject({
        variables: {
          values: {
            subproject_name: subprojectName?.current?.value,
            description: description?.current?.value,
            project_id: projectId
          }          
        }
      })
      toast.success('Successfully inserted data!', );
      handleClose();
    }catch(error){
      console.log(error.message)
      toast.error('Unable to insert data!');
    };
  }

  return (
    <Form onSubmit={handleSubmit} style={label}>
      <Form.Group>
        <Form.Label>Subproject:<span style={{color: 'red'}}>*</span></Form.Label>
        <Form.Control
          className="mb-3"
          style={inputStyle}
          type="text"
          placeholder="Enter subproject name"
          ref={subprojectName}
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Description:</Form.Label>
        <Form.Control
          className="mb-3"
          style={inputStyle}
          type="text"
          placeholder="Enter subproject name"
          ref={description}          
        />
      </Form.Group>
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        <Button variant="outline-secondary" onClick={handleClose} >
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          Create {loading  && <Spinner size='sm'/>}
        </Button>
      </div>
    </Form>
  )
}

export default NewSubproject