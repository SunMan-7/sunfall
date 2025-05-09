import { useState } from 'react';
import { Form, Button } from "react-bootstrap"
import { useMutation } from '@apollo/client';
import Spinner from '../../Spinner';
import { toast } from 'react-hot-toast';
import {UPDATE_SUBPROJECT_BYID, GET_SUBPROJECTS } from '../../../api/subprojectGql';
import { label, inputStyle } from '../../../helpers';

const EditSubproject = ({rowData, handleCloseEdit}) => {  
  const [subprojectName, setSubprojectName] = useState(rowData?.subproject_name ?? '');
  const [description, setDescription] = useState(rowData?.description ?? '');

  const [updateSubproject, {loading}] = useMutation(UPDATE_SUBPROJECT_BYID, {refetchQueries: [GET_SUBPROJECTS]} );

  const isSubprojectNameDirty = subprojectName !== rowData?.subproject_name;
  const isDescriptionDirty = description !== rowData?.description;

  // Enables the save changes button when the default field values are changed.
  const isSubprojectFormDirty = isSubprojectNameDirty || isDescriptionDirty;

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      await updateSubproject({
        variables: {
          subprojectId: rowData?.id,
          values: {
            subproject_name: subprojectName,
            description
          }
        }
      })
      toast.success('Successfully saved your changes!', );
    }catch(error){
      console.error(error.message)
      toast.error('Unable to save changes!');
    };

  }
  return (
    <Form onSubmit={handleSubmit} >
      <Form.Group>
        <Form.Label style={label}>Subproject name:<span style={{color: 'red'}}>*</span></Form.Label>
        <Form.Control
          className="mb-3"
          type="text"
          placeholder="Enter subproject name"
          value={subprojectName}
          onChange={(e)=>setSubprojectName(e.target.value)}
          required
          style={inputStyle}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label style={label}>Description:</Form.Label>
        <Form.Control
          className="mb-3"
          as='textarea'
          placeholder="Enter survey name"
          value={description}
          onChange={(e)=>setDescription(e.target.value)} 
          style={inputStyle}         
        />
      </Form.Group>
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        <Button variant="outline-secondary" onClick={handleCloseEdit} >
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={!isSubprojectFormDirty || loading}>
          Save changes {loading  && <Spinner size='sm'/>}
        </Button>
      </div>
    </Form>
  )
}

export default EditSubproject