import { useState} from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import Spinner from '../Spinner';
import { toast } from 'react-hot-toast';
import { useMutation } from '@apollo/client';
import { UPDATE_CAMERA_BYID, GET_CAMERAS, GET_CAMERA_NAMES } from '../../api/cameraGql';

const asterisk = {
  color: 'red'
}
const EditCamera = ({data, handleClose}) => {
  const [purchaseDate, setPurchaseDate] = useState(data?.purchase_date ?? null);  
  const [cameraName, setCameraName] = useState(data?.camera_name ?? '');
  const [make, setMake] = useState(data?.make ?? '');
  const [model, setModel] = useState(data?.model ?? '');
  const [serialNumber, setSerialNumber] = useState(data?.serial_number ?? '');
  const [purchasePrice, setPurchasePrice] = useState(data?.purchase_price ?? '');
  const [productUrl, setProductUrl] = useState(data?.product_url ?? '');
  const [numBatteries, setNumBatteries] = useState(data?.num_of_batteries ?? 0);
  const [remarks, setRemarks] = useState(data?.remarks ?? '');
  const [status, setStatus] = useState(data?.status ?? '');

  const [updateCamera, {loading: updatingCamera}] = useMutation(UPDATE_CAMERA_BYID);

  const handleSubmit = async(e) => {
    e.preventDefault();
    const camera = {
      camera_name: cameraName, make, model, 
      serial_number: serialNumber,
      purchase_price:  purchasePrice, 
      purchase_date: purchaseDate ? new Date(purchaseDate) : null,
      product_url: productUrl, 
      num_of_batteries: numBatteries ? numBatteries : null, 
      status, remarks,
    }

    try {
      await updateCamera({
        variables: {
          cameraId: data?.id, 
          camera
        }
      })
      toast.success('Data successfully added', {duration: 3000});
      handleClose();
    }catch(error) {
      console.log(error.message);
      toast.error('Unable to update data', {duration: 4000});
    }

  }
  return (
    <>
    <Form onSubmit={handleSubmit} style={{fontSize: '14px'}}>
      <Form.Group className="mb-3">
        <Form.Label>Camera name:<span style={asterisk}>*</span></Form.Label>
        <Form.Control type="text" value={cameraName} 
          placeholder="Enter camera name" size='sm'
          onChange={e => setCameraName(e.target.value)} 
          required
        />
      </Form.Group>
      <Form.Group className="mb-3" >
        <Form.Label>Make:</Form.Label>
        <Form.Control type="text" value={make} 
          placeholder='Enter make of camera' size='sm'
          onChange={e => setMake(e.target.value)}
        />
      </Form.Group>

      <Row>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>Model:</Form.Label>
          <Form.Control type="text" value={model} 
            placeholder="Enter model" size='sm'
            onChange={e => setModel(e.target.value)} 
          />
        </Form.Group>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>Serial number:</Form.Label>
          <Form.Control type="text" value={serialNumber} 
            placeholder="Enter serial number" size='sm'
            onChange={e => setSerialNumber(e.target.value)}
          />
        </Form.Group>        
      </Row>
      <Row>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>Purchase date:</Form.Label>
          <DatePicker       
            selected={purchaseDate ? new Date(purchaseDate) : null} 
            onChange={date => setPurchaseDate(date)}                           
            dateFormat='yyyy-MM-dd'            
            placeholderText='Click to select date'
            customInput={<Form.Control size='sm' />}                         
          />
        </Form.Group>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>Purchase price:</Form.Label>          
          <Form.Control type="text"  
            value={purchasePrice} placeholder="$" 
            onChange={e => e.target.value === '' 
              ? setPurchasePrice(null) 
              : setPurchasePrice(e.target.value)
            }
            size='sm'
          />          
        </Form.Group>        
      </Row>

      <Form.Group className='mb-3'>
        <Form.Label>Product URL: </Form.Label>
        <Form.Control type="url" value={productUrl} 
          onChange={e => setProductUrl(e.target.value)}
          size='sm'
        />
      </Form.Group>

      <Row>
        <Form.Group as={Col} className='mb-3' xs={6}>
          <Form.Label>Number of Batteries: </Form.Label>
          <Form.Control type="number" value={numBatteries} min={0} 
            onChange={e => e.target.value === ''
              ? setNumBatteries(null) 
              : setNumBatteries(e.target.value)
            }
            size='sm'
          />
        </Form.Group>
        <Form.Group as={Col} className='mb-3' xs={6}>
          <Form.Label>Status:<span style={asterisk}>*</span> </Form.Label>
          <Form.Select value={status} size='sm'
            onChange={e => setStatus(e.target.value)}  
            required
          >
            <option value='' className='text-muted'>Choose...</option>
            <option value='Active'>Active</option>
            <option value='Available'>Available</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
            <option value="Stolen">Stolen</option>
          </Form.Select>
        </Form.Group>
      </Row>

      <Form.Group className='mb-3'>
        <Form.Label>Remarks: </Form.Label>
        <Form.Control as='textarea' rows={1} value={remarks} 
          onChange={e => setRemarks(e.target.value)}
          size='sm'
        />
      </Form.Group>
      
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        <Button variant="outline-secondary" onClick={handleClose} size='sm'>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={updatingCamera} size='sm'>
          Save changes {updatingCamera ? <Spinner size='sm' /> : null}
        </Button>
      </div>
    </Form>
    
    </>
  )
}

export default EditCamera;