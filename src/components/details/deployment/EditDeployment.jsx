/*
This component allows users to edit a selected row of camera check data(deployment).
*/
import { useMutation } from '@apollo/client';
import { useState, } from 'react';
import {Button, Form, Row, Col } from 'react-bootstrap/';
import DatePicker from "react-datepicker";
import Select from 'react-select';
// import Spinner from '../../Spinner';
import { toast } from 'react-hot-toast';
import { UPDATE_DEPLOYMENT_BYID, GET_DEPLOYMENTS_BY_PROID, } from "../../../api/deploymentGql";
import { label, inputStyle, failureTypes, } from '../../../helpers';

const asterisk = {color: 'red'};

const EditDeployment = ({data, handleClose, locationData, cameraData, subprojectData}) => {
  const [startDate, setStartDate] = useState(new Date(data?.start_date) ?? null);
  const [endDate, setEndDate] = useState(new Date(data?.end_date) ?? null);
  const [deploymentName, setDeploymentName] = useState(data?.deployment_name ?? '');
  const [location, setLocation] = useState({value: data?.location?.id, 
    label: data?.location?.location_name});
  const [camera, setCamera] = useState({value: data?.camera?.id, 
    label: data?.camera?.camera_name});
  const [placement, setPlacement] = useState(data?.camera_placement ?? undefined);
  const [checkNumber, setCheckNumber] = useState(data?.check_number ?? undefined);
  const [failureType, setFailureType] = useState(failureTypes.find(obj => obj.value === data?.failure_type));
  const [setupPerson, setSetupPerson] = useState(data?.setup_person ?? '');
  const [pickupPerson, setPickupPerson] = useState(data?.pickup_person ?? '');  
  const [subproject, setSubproject] = useState({value: data?.subproject?.id, 
    label: data?.subproject?.subproject_name});
  const [remarks, setRemarks] = useState(data?.remarks ?? '');

  const [updateDeployment, {loading: updatingDeployment}] = useMutation(UPDATE_DEPLOYMENT_BYID, {
    refetchQueries: [GET_DEPLOYMENTS_BY_PROID]
  });

  // Function to handle the submission of deployment details
  const handleSubmit = async(e) => {
    e.preventDefault(); // Prevent form from refreshing
    const deploymentInput = {
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
      remarks     
    }
    try {
      // Update deployment with the provided variables
      await updateDeployment({
        variables: {deploymentId: data?.id, deploymentInput }
      })
      // Show success message
      toast.success('Successfully updated camera check');
      // handleClose();
    }catch(error) {
      // Show error message
      toast.error('Unable to update camera check details');
      console.log(error.message);
    };
  };

  return (
    <>      
    <Form onSubmit={handleSubmit} >
      <Row>
      <Form.Group as={Col} className="mb-3" xs={9}>
        <Form.Label style={label}>Camera check name: <span style={asterisk}>*</span></Form.Label>
        <Form.Control type="text" style={inputStyle} 
          value={deploymentName}    
          onChange={e => setDeploymentName(e.target.value)}      
          required
        />
        {/* <Form.Text className="text-muted" style={inputStyle}>
          locationPlacementCheck_start-date
        </Form.Text> */}
      </Form.Group>
      <Form.Group as={Col} className="mb-3" xs={3}>
        <Form.Label style={label}>ID #: <span style={asterisk}>*</span></Form.Label>
        <Form.Control type="text" style={inputStyle} 
          value={data?.id}        
          readOnly
          disabled
        />
      </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} className="mb-3" xs={6} style={{display: 'flex', flexDirection: 'column'}}>
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
        <Form.Group as={Col} className="mb-3" xs={6} style={{display: 'flex', flexDirection: 'column'}}>
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
          // isLoading={loadingLocations}
          isClearable            
          options={locationData?.locations?.map(l => (
            {value: l.id, label: l.location_name}
            ) )}           
          placeholder='Select location name...'   
          tabIndex={2}                 
          required
          size='sm'
        /> 
      </Form.Group>
      <Form.Group style={inputStyle} as={Col} className="mb-3" sm={6} xs={12}>
        <Form.Label style={label}>Camera:<span style={asterisk}>*</span></Form.Label>
        <Select 
          value={camera}
          onChange={(prop) => setCamera(prop)}
          // isLoading={loadingCameras}
          isClearable            
          options={cameraData?.cameras?.map(c => (
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
          // isLoading={loadingSubprojects}
          isClearable            
          options={subprojectData?.subprojects?.map(s => (
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
        <Button variant="primary" type="submit" disabled={updatingDeployment}>
          Save changes
        </Button>
      </div>
    </Form>   
    </>
  )
}

export default EditDeployment