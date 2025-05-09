/*
This component contains the form to add users and assign their role.
*/
import { Form, Button } from "react-bootstrap";

const AddUserForm = ({ onSubmit, roles, isDisabled, emailRef, roleRef }) => (
  <Form onSubmit={onSubmit}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ width: '60%' }}>
        <Form.Group>        
          <Form.Control type="email" 
            placeholder="Add member using their email"
            ref={emailRef}
            required 
          />        
        </Form.Group>  
      </div>  

      <div style={{ display: 'flex', gap: '1rem' }}>      
        <Form.Group >               
          <Form.Select ref={roleRef} required>
            <option value='' className='text-muted'>Select role</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))} 
          </Form.Select>
        </Form.Group> 

        <div>
          <Button type="submit" variant='outline-secondary' disabled={isDisabled}>
            Add member
          </Button>
        </div>
      </div>      
    </div>
  </Form>
);

export default AddUserForm;
