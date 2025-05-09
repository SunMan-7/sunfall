/* 
This component allows users to create a new camera check by filling out the form fields.
*/

import { useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DatePicker from "react-datepicker";
import Select from 'react-select';
import Spinner from '../../Spinner';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CAMERA_NAMES, } from '../../../api/cameraGql';
import { GET_PROJECT_LOCATIONS } from '../../../api/locationGql';
import { GET_DEPLOYMENTS_BY_PROID, INSERT_DEPLOYMENT } from '../../../api/deploymentGql';
import { GET_SUBPROJECTS } from '../../../api/subprojectGql';
import { GET_DEPLOYMENT_CAMERA_NAMES } from "../../../api/uploadGql";

import "react-datepicker/dist/react-datepicker.css";
import { label, inputStyle, failureTypes, getCustomDateFormat } from '../../../helpers';

const asterisk = {
  color: 'red'
}

const NewDeployment = ({handleClose}) => {
  const {id: organizationId} = JSON.parse(localStorage.getItem('organization'));
  const {id: projectId } = JSON.parse(localStorage.getItem('project'));
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [location, setLocation] = useState(null);
  const [camera, setCamera] = useState(null);
  const [placement, setPlacement] = useState(1);
  const [checkNumber, setCheckNumber] = useState(1);
  const [failureType, setFailureType] = useState();
  const [setupPerson, setSetupPerson] = useState();
  const [pickupPerson, setPickupPerson] = useState();  
  const [subproject, setSubproject] = useState();  
  const [remarks, setRemarks] = useState('');

  const [insertDeployment, {loading}] = useMutation(INSERT_DEPLOYMENT, {
    refetchQueries: [GET_DEPLOYMENTS_BY_PROID, GET_DEPLOYMENT_CAMERA_NAMES]
  });
  
  const {data: subprojectNames } = useQuery(GET_SUBPROJECTS, {
    variables: {projectId}, skip: !projectId
  });
  const {data } = useQuery(GET_CAMERA_NAMES, {
    variables: {organizationId}, skip: !organizationId
  });
  const {data: locationNames } = useQuery(GET_PROJECT_LOCATIONS, {
    variables: {projectId}, skip: !projectId
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const deploymentName = camera.label + '_' + getCustomDateFormat(startDate);   
    const deployment = {
      deployment_name: deploymentName,
      start_date: startDate,
      end_date: endDate ? endDate : null,
      location_id: location?.value,
      camera_id: camera?.value,
      camera_placement: placement,
      check_number: checkNumber ? checkNumber : null,
      failure_type: failureType?.value,
      setup_person: setupPerson,
      pickup_person: pickupPerson,
      subproject_id: subproject?.value,
      project_id: projectId,
      remarks
    }

    try {
      // Add the deployment details to the database
      await insertDeployment({
        variables: { deployment}
      })
      
      toast.success('Successfully inserted data!',);      
    }catch(error){
      console.log(error);
      toast.error('Unable to insert data!',);
    }
  };

  return (
    <>
    <Form onSubmit={handleSubmit} >
      <Form.Group className="mb-3">
        <Form.Label style={label}>Camera deployment name: <span style={asterisk}>*</span></Form.Label>
        <Form.Control type="text" style={inputStyle} 
          value={(camera ? camera?.label + '_' : '') + (startDate ? getCustomDateFormat(startDate) : '') }
          readOnly
          disabled 
          required
        />
        {/* <Form.Text className="text-muted" style={inputStyle}>
          locationPlacementCheck_start-date
        </Form.Text> */}
      </Form.Group>

      <Row>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label style={label}>Start date:<span style={asterisk}>*</span></Form.Label>
          <DatePicker     
            selected={startDate} 
            onChange={date => {setStartDate(date)}}                           
            dateFormat='dd-MMM-yyyy h:mm aa'
            timeInputLabel='Time:'
            showTimeInput
            placeholderText='Click to select date'
            customInput={<Form.Control style={inputStyle} />} 
            isClearable
            required            
          />
        </Form.Group>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label style={label}> End date:<span style={asterisk}>*</span></Form.Label>
          <DatePicker       
            selected={endDate} 
            onChange={date => setEndDate(date)}                           
            dateFormat='dd-MMM-yyyy h:mm aa'
            timeInputLabel='Time:'
            showTimeInput
            placeholderText='Click to select date'
            customInput={<Form.Control style={inputStyle}/>}
            isClearable    
            required         
          />
        </Form.Group>        
      </Row>

      <Row>
      <Form.Group style={inputStyle} as={Col} className="mb-3" sm={6} xs={12}>
        <Form.Label style={label}>Location: <span style={asterisk}>*</span></Form.Label>
        <Select 
          value={location}          
          // defaultValue={{value: 8, label: 'Name'}}          
          onChange={(prop) => {setLocation(prop)}}
          isClearable            
          options={locationNames?.locations?.map(l => (
            {value: l.id, label: l.location_name}
            ) )}           
          placeholder='Select location name...'                    
          required
          size='sm'
        /> 
      </Form.Group>
      <Form.Group style={inputStyle} as={Col} className="mb-3" sm={6} xs={12}>
        <Form.Label style={label}>Camera:<span style={asterisk}>*</span></Form.Label>
        <Select 
          value={camera}
          onChange={(prop) => setCamera(prop)}
          isClearable            
          options={data?.cameras.map(c => (
            {value: c.id, label: c.camera_name}
            ) )}           
          placeholder='Select camera name...'                    
          required
          size='sm'
        /> 
      </Form.Group>
      </Row>
      <Form.Group style={inputStyle} className='mb-3'>
        <Form.Label style={label}>Failure type<span style={asterisk}>*</span>: </Form.Label>
        <Select 
          value={failureType}                    
          onChange={(prop) => setFailureType(prop)}
          isClearable            
          options={failureTypes?.map(f => (
            {value: f.value, label: f.label}
            ) )}           
          placeholder='Select failure type...'                    
          required
          size='sm'
        /> 
      </Form.Group>
      <Row>
        <Form.Group as={Col} className="mb-3" sm={6} xs={12} >
          <Form.Label style={label}>Camera placement:</Form.Label>
          <Form.Select value={placement} required 
            onChange={e => {setPlacement(e.target.value)}}
            >
            <option value={1}>1 / Left</option>
            <option value={2}>2 / Right</option>
          </Form.Select>
        </Form.Group> 
        <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
          <Form.Label style={label} >Check #:</Form.Label>
          <Form.Control type='number' min={1} style={inputStyle}
            value={checkNumber} 
            onChange={e => {setCheckNumber(e.target.value)}} 
          /> 
        </Form.Group>       
      </Row>
      <Row>
        <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
          <Form.Label style={label}>Setup person:</Form.Label>
          <Form.Control type='text' style={inputStyle}
            value={setupPerson} 
            onChange={e => setSetupPerson(e.target.value)}
          /> 
        </Form.Group> 
        <Form.Group as={Col} className="mb-3" sm={6} xs={12}>
          <Form.Label style={label}>Pickup person:</Form.Label>
          <Form.Control type='text' style={inputStyle}
            value={pickupPerson} 
            onChange={e => setPickupPerson(e.target.value)}
          /> 
        </Form.Group>       
      </Row>          

      <Form.Group style={inputStyle} className="mb-3" >
        <Form.Label style={label}>Subproject: </Form.Label>
        <Select 
          value={subproject}         
          onChange={(prop) => setSubproject(prop)}
          isClearable            
          options={subprojectNames?.subprojects?.map(s => (
            {value: s.id, label: s.subproject_name}
            ) )}           
          placeholder='Select subproject name...' 
          size='sm'
        /> 
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label style={label}>Remarks: </Form.Label>
        <Form.Control as='textarea' style={inputStyle} rows={1}
          value={remarks} 
          onChange={e => setRemarks(e.target.value)} 
        />
      </Form.Group>
      
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        <Button variant="outline-secondary" onClick={handleClose} >
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading }>
          Create {loading && <Spinner size='sm'/>}
        </Button>
      </div>
    </Form>
    </>
  )
}

export default NewDeployment