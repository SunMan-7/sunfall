import { useState } from 'react';
import { Form, Row, Col, Button} from 'react-bootstrap';
import Spinner from '../Spinner';
import { toast } from 'react-hot-toast';
import {useQuery, useMutation } from '@apollo/client';
import { GET_SITE_NAMES } from '../../api/sitesGql';
import { GET_LOCATIONS, UPDATE_LOCATION_BYID } from '../../api/locationGql';

const EditLocation = ({data, handleCloseEdit}) => {
  const [locationName, setLocationName] = useState(data?.location_name ?? '');
  const [x, setX] = useState(data?.x ?? '');
  const [y, setY] = useState(data?.y ?? '');
  const [siteId, setSiteId] = useState(data?.site?.id ?? '');
  const [remarks, setRemarks] = useState(data?.remarks ?? '');

  const [updateLocation, {loading: updatingLocation}] = useMutation(UPDATE_LOCATION_BYID, {
    refetchQueries: [GET_LOCATIONS]
  });

  const {data: siteNames } = useQuery(GET_SITE_NAMES);

  const isLocationNameDirty = locationName !== data?.location_name;
  const isXDirty = x !== data?.x;
  const isYDirty = y !== data?.y;
  const isSiteIdDirty = siteId !== data?.site?.id;
  const isRemarksDirty = remarks !== data?.remarks
  const isLocationFormDirty = (isLocationNameDirty || isXDirty 
    || isYDirty || isSiteIdDirty || isRemarksDirty)
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const location = {
      location_name: locationName,
      x,
      y,
      site_id: siteId,
      remarks,
    }
    try{
      updateLocation({
        variables: {
          locationId: data?.id,
          location,
        }
      })
      toast.success('Location updated successfully.');
      handleCloseEdit();
    }catch(error) {
      console.log(error);
      toast.error('Error updating.')
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Location name: <span style={{color: 'red'}}>*</span></Form.Label>
        <Form.Control type="text" 
          value={locationName} 
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Enter location name" 
          required 
        />        
      </Form.Group>

      <Form.Group className="mb-3" >
        <Form.Label>Site name: </Form.Label>
        <Form.Select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          <option value=''>Select site name...</option>
          {siteNames?.sites?.map(site => (
            <option value={site.id} key={site.id}>{site.site_name}</option>          
          ))}
        </Form.Select>
      </Form.Group>

      <Row>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>X: <span style={{color: 'red'}}>*</span></Form.Label>
          <Form.Control type="number"  
            value={x} 
            onChange={e => setX(e.target.value)}
            required 
          />
        </Form.Group>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>Y: <span style={{color: 'red'}}>*</span></Form.Label>
          <Form.Control type="number"  
            value={y} 
            onChange={e => setY(e.target.value)}
            required 
          />
        </Form.Group>        
        {/* <Form.Group as={Col} className="mb-3" xs={4}>
          <Form.Label>Region: </Form.Label>
          <Form.Control type="text" 
            value={region}
            onChange={e => setRegion(e.target.value)} 
            placeholder="Enter area " 
          />
        </Form.Group> */}
      </Row>

      <Form.Group className='mb-3'>
        <Form.Label>Remarks: </Form.Label>
        <Form.Control type="text" value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </Form.Group>
      
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        <Button variant="outline-secondary" onClick={handleCloseEdit}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit" 
          disabled={!isLocationFormDirty || updatingLocation}
        >
          Save changes {updatingLocation && <Spinner size='sm' />}
        </Button>
      </div>
    </Form>
  )
}

export default EditLocation