/*
This component displays project details and users can make and save changes to the project.
*/
import { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { label, inputStyle } from '../../helpers';
import { UPDATE_PROJECT } from '../../api/projectGql';
import { useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import DatePicker from "react-datepicker";

const EditProject = () => { 
  const project = JSON.parse(localStorage.getItem('project'));  
  const [projectName, setProjectName] = useState(project?.project_name ?? '');
  const [shortName, setShortName] = useState(project?.short_name ?? '');
  const [projectCode, setProjectCode] = useState(project?.project_code ?? '');
  const [objectives, setObjectives] = useState(project?.objectives ?? '');
  const [contactPerson, setContactPerson] = useState(project?.contact_person ?? '');
  const [contactEmail, setContactEmail] = useState(project?.contact_email ?? '');
  const [projectOwner, setProjectOwner] = useState(project?.project_owner ?? '');
  const [ownerEmail, setOwnerEmail] = useState(project?.owner_email ?? '');
  const [startDate, setStartDate] = useState(project?.start_date ? new Date(project.start_date) : null);
  const [endDate, setEndDate] = useState(project?.end_date ? new Date(project.end_date) : null); 
  const [isDisabled, setIsDisabled] = useState(false);
  
  const [updateProject, {loading}] = useMutation(UPDATE_PROJECT);
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    // Disables the save changes button to prevent users from clicking the button more than once
    setIsDisabled(true); 
    const projects = {
      project_name: projectName,
      short_name: shortName,
      project_code: projectCode,
      objectives,
      contact_person: contactPerson,
      contact_email: contactEmail,
      project_owner: projectOwner,
      p_owner_email: ownerEmail,
      start_date: startDate ? new Date(startDate) : null,
      end_date: endDate ? new Date(endDate) : null,
    };

    try {
      const {data} = await updateProject({
        variables: {
          projectId: project?.id,
          values: projects
        }
      })
      toast.success('Successfully saved your changes.');  
      localStorage.setItem('project', JSON.stringify(data?.update_projects_by_pk));      
    }catch(error){
      console.log(error);
      toast.error('Unable to update!');
      setIsDisabled(false);
    }
  };

  return (
    <div style={{maxWidth: '700px', margin: '0 auto', }}>
      <h4>Edit project</h4>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Form.Group as={Col} className="mb-3" sm={8} xs={12}>
            <Form.Label style={label}>Project name*:</Form.Label>
            <Form.Control as='textarea' rows={1}
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              required
              style={inputStyle}
            />
          </Form.Group>
          <Form.Group as={Col} className="mb-3" sm={4} xs={12}>
            <Form.Label style={label}>ID:</Form.Label>
            <Form.Control rows={1}
              value={project?.id}
              disabled
              style={inputStyle}
            />
          </Form.Group>
        </Row>
        
        <Row>
          <Form.Group as={Col} className="mb-3" sm={8} xs={12} >
            <Form.Label style={label}>Short name*:</Form.Label>
            <Form.Control type="text"
              value={shortName}
              onChange={e => setShortName(e.target.value)}
              required
              style={inputStyle}
            />
          </Form.Group>
          <Form.Group as={Col} className="mb-3" sm={4} xs={12}>
            <Form.Label style={label}>Project code name*:</Form.Label>
            <Form.Control type="text"
              value={projectCode}
              onChange={e => setProjectCode(e.target.value)}
              required
              style={inputStyle}
            />
            <Form.Text style={{fontSize: '0.7rem', margins: 0}}>
              Use a short code name, no spaces
            </Form.Text>
          </Form.Group>
        </Row>
        
        <Form.Group className="mb-3" >
          <Form.Label style={label}>Objectives:</Form.Label>
          <Form.Control as='textarea' rows={1}
            value={objectives}
            onChange={e => setObjectives(e.target.value)}
            style={inputStyle}
          />
        </Form.Group>
        <Row>
          <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
            <Form.Label style={label}>Contact person:</Form.Label>
            <Form.Control type="text"
              value={contactPerson}
              onChange={e => setContactPerson(e.target.value)}
              style={inputStyle}
            />
          </Form.Group>
          <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
            <Form.Label style={label}>Contact email:</Form.Label>
            <Form.Control type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              style={inputStyle}
            />
          </Form.Group>
        </Row>
        <Row>
          <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
            <Form.Label style={label}>Project owner:</Form.Label>
            <Form.Control type="text"
              value={projectOwner}
              onChange={e => setProjectOwner(e.target.value)}
              style={inputStyle}
            />
          </Form.Group>
          <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
            <Form.Label style={label}>Project owner email:</Form.Label>
            <Form.Control type="email"
              value={ownerEmail}
              onChange={e => setOwnerEmail(e.target.value)}
              style={inputStyle}
            />
          </Form.Group>
        </Row>
        <Row >
          <Form.Group as={Col} className="mb-3" sm={6} xs={12}  >
            <div><Form.Label style={label}>Start date: </Form.Label></div>
            <div style={inputStyle}>
              <DatePicker       
                selected={startDate} 
                onChange={date => setStartDate(date)}                           
                dateFormat='yyyy-MM-dd'
                placeholderText='Click to select date'
                customInput={<Form.Control />}
                isClearable                      
              />
            </div>
          </Form.Group>
          <Form.Group as={Col} className="mb-3" sm={6} xs={12} >
            <div><Form.Label style={label}>End date:</Form.Label></div>
            <DatePicker       
              selected={endDate} 
              onChange={date => setEndDate(date)}                           
              dateFormat='yyyy-MM-dd'
              placeholderText='Click to select date'
              customInput={<Form.Control/>}
              isClearable         
            />
          </Form.Group>
        </Row>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1em', }}>
          {/* <Button variant='outline-secondary' size='sm' onClick={() => navigate(-1)}>
            Go Back
          </Button> */}
          <Button size='sm' type='submit' disabled={loading || isDisabled}>
            Save changes
          </Button>
        </div>
      </Form>
      
    </div>
  )
}

export default EditProject