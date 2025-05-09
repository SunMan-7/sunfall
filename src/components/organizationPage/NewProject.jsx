/*
This component allows users to create a new project and redirects them to the dashboard
after a successfully creating a project. 
*/
import {useNavigate, } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { label } from '../../helpers';
import { INSERT_PROJECT_ONE, GET_PROJECTS } from '../../api/projectGql';
import { useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import DatePicker from "react-datepicker";
import ImportToCSV from '../csvOptions/ImportCSV';

const NewProject = () => { 
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [shortName, setShortName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [objectives, setObjectives] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [projectOwner, setProjectOwner] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [importData, setImportData] = useState([]);
  
  const [insertProject, {loading}] = useMutation(INSERT_PROJECT_ONE, {
    refetchQueries: [GET_PROJECTS]
  });
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    const project = {
      project_name: projectName,
      short_name: shortName.trim(),
      project_code: projectCode.trim(),
      objectives,
      contact_person: contactPerson,
      contact_email: contactEmail,
      project_owner: projectOwner,
      p_owner_email: ownerEmail,
      start_date: startDate ? new Date(startDate) : null,
      end_date: endDate ? new Date(endDate) : null
    };

    try {
      // insert data in the projects table
      const {data} = await insertProject({
        variables: {values: project}
      })
      toast.success('Successfully added project');   

      // Save the new project details in local storage.
      localStorage.setItem('project', JSON.stringify(data?.insert_projects_one));
      navigate('/organization/project', ) // Redirect user to the dashboard.
    }catch(error){
      console.log(error);
      toast.error('Unable to update!');
    }
  };

  useEffect(() => {
    if(importData.length){
      const start_date = importData[0]?.start_date ? new Date(importData[0]?.start_date) : null;
      const end_date = importData[0]?.end_date ? new Date(importData[0]?.end_date) : null;
      setProjectName(importData[0]?.project_name);
      setShortName(importData[0]?.short_name);
      setProjectCode(importData[0]?.project_code);
      setObjectives(importData[0]?.objectives);
      setContactPerson(importData[0]?.contact_person);
      setContactEmail(importData[0]?.contact_email);
      setProjectOwner(importData[0]?.project_owner);
      setOwnerEmail(importData[0]?.owner_email);
      setStartDate(start_date);
      setEndDate(end_date);
    }
  },[importData])

  return (
    <div style={{maxWidth: '700px', margin: '0 auto', }}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <h4>New project</h4>
        <ImportToCSV setImportData={setImportData} label='Import data' />
      </div>
      
      <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" >
          <Form.Label style={label}>Project name*:</Form.Label>
          <Form.Control as='textarea' rows={1}
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            required
          />
        </Form.Group>
        
        <Row>
          <Form.Group as={Col} className="mb-3" sm={8} xs={12}>
            <Form.Label style={label}>Short name*:</Form.Label>
            <Form.Control type="text"
              value={shortName}
              onChange={e => setShortName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group as={Col} className="mb-3" sm={4} xs={12}>
            <Form.Label style={label}>Project code*:</Form.Label>
            <Form.Control type="text"
              value={projectCode}
              onChange={e => setProjectCode(e.target.value)}
              required
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
          />
        </Form.Group>
        <Row>
          <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
            <Form.Label style={label}>Contact person:</Form.Label>
            <Form.Control type="text"
              value={contactPerson}
              onChange={e => setContactPerson(e.target.value)}
            />
          </Form.Group>
          <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
            <Form.Label style={label}>Contact email:</Form.Label>
            <Form.Control type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
            />
          </Form.Group>
        </Row>
        <Row>
          <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
            <Form.Label style={label}>Project owner/admin:</Form.Label>
            <Form.Control type="text"
              value={projectOwner}
              onChange={e => setProjectOwner(e.target.value)}
            />
          </Form.Group>
          <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
            <Form.Label style={label}>Project owner/admin email:</Form.Label>
            <Form.Control type="email"
              value={ownerEmail}
              onChange={e => setOwnerEmail(e.target.value)}
            />
          </Form.Group>
        </Row>
        <Row >
          <Form.Group as={Col} className="mb-3" sm={6} xs={12} >
            <div><Form.Label style={label}>Start date: </Form.Label></div>
            <DatePicker       
              selected={startDate} 
              onChange={date => setStartDate(date)}                           
              dateFormat='yyyy-MMM-dd'
              placeholderText='Click to select date'
              customInput={<Form.Control />}
              isClearable          
            />
          </Form.Group>
          <Form.Group as={Col} className="mb-3" sm={6} xs={12} >
            <div><Form.Label style={label}>End date:</Form.Label></div>
            <DatePicker       
              selected={endDate} 
              onChange={date => setEndDate(date)}                           
              dateFormat='yyyy-MMM-dd'
              placeholderText='Click to select date'
              customInput={<Form.Control/>}
              isClearable         
            />
          </Form.Group>
        </Row>
        <div className='mb-3' style={{display: 'flex', justifyContent: 'space-between', marginTop: '1em'}}>
          <Button variant='outline-secondary' size='sm' onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button size='sm' type='submit' disabled={loading}>
            Create Project
          </Button>
        </div>
      </Form>
      
    </div>
  )
}

export default NewProject