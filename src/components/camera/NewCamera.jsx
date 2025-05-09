import { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DatePicker from "react-datepicker";
import { toast } from 'react-hot-toast';
import { useMutation } from '@apollo/client';
import { INSERT_CAMERA_ONE, GET_CAMERAS, GET_CAMERA_NAMES } from '../../api/cameraGql';
import { label } from '../../helpers';


const asterisk = {
  color: 'red'
}
const NewCamera = () => {
  const [purchaseDate, setPurchaseDate] = useState(null);  
  const [insertCamera, {loading}] = useMutation(INSERT_CAMERA_ONE, {
    refetchQueries: [GET_CAMERAS, GET_CAMERA_NAMES]
  });
  const [isInserAgain, setIsInsertAgain] = useState(false);

  const cameraName = useRef(null);
  const make = useRef(null);
  const model = useRef(null);
  const serialNumber = useRef(null);  
  const purchasePrice = useRef(null);
  const productUrl = useRef(null);
  const noOfBatteries = useRef();
  const remarks = useRef(null);
  const status = useRef(null);

  // const organizationId = user?.default_organization?.organization_id;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let numBatteries; 
    let price;   
    if(noOfBatteries?.current?.value === ''){      
      numBatteries = null;      
    }
    if(purchasePrice?.current?.value === ''){      
      price = null;      
    }
    const camera = {
      camera_name: cameraName?.current?.value, 
      make: make?.current?.value,
      model: model?.current?.value, 
      serial_number: serialNumber?.current?.value,
      purchase_price: (price ? purchasePrice.current.value : null), 
      purchase_date: purchaseDate ? new Date(purchaseDate) : null,
      product_url: productUrl?.current?.value, 
      num_of_batteries: (numBatteries ? noOfBatteries.current.value : null) ,
      status: status?.current?.value, 
      remarks: remarks?.current?.value,
    }

    try {
      await insertCamera({
        variables: {camera }
      })
      toast.success('Data successfully added', {duration: 3000});
      setIsInsertAgain(true);
    }catch(error) {
      console.log(error);
      toast.error('Unable to update!', {duration: 3000});
    }

  }
  return (
    <>
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Camera name:<span style={asterisk}>*</span></Form.Label>
        <Form.Control type="text" ref={cameraName} placeholder="Enter camera name"  required/>
        {/* <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text> */}
      </Form.Group>

      <Form.Group className="mb-3" >
        <Form.Label>Make:</Form.Label>
        <Form.Control type="text" ref={make} placeholder='Enter make of camera' />
      </Form.Group>

      <Row>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>Model:</Form.Label>
          <Form.Control type="text" ref={model} placeholder="Enter model" />
        </Form.Group>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>Serial number:</Form.Label>
          <Form.Control type="text" ref={serialNumber} placeholder="Enter serial number" />
        </Form.Group>        
      </Row>
      <Row>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>Purchase date:</Form.Label>
          <DatePicker       
            selected={purchaseDate} 
            onChange={date => setPurchaseDate(date)}                           
            dateFormat='d-MMM-yyyy'            
            placeholderText='Click to select date'
            customInput={<Form.Control />}                         
          />
        </Form.Group>
        <Form.Group as={Col} className="mb-3" xs={6}>
          <Form.Label>Purchase price:</Form.Label>
          <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" step={0.01} min={0} 
              ref={purchasePrice} placeholder="0.00" />
          </InputGroup>          
        </Form.Group>        
      </Row>

      <Form.Group className='mb-3'>
        <Form.Label>Product URL: </Form.Label>
        <Form.Control type="url" ref={productUrl} />
      </Form.Group>

      <Row>
        <Form.Group as={Col} className='mb-3' xs={6}>
          <Form.Label>Number of Batteries: </Form.Label>
          <Form.Control type="number" ref={noOfBatteries} min={0} />
        </Form.Group>
        <Form.Group as={Col} className='mb-3' xs={6}>
          <Form.Label>Status:<span style={asterisk}>*</span> </Form.Label>
          <Form.Select ref={status} defaultValue='Available' required>
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
        <Form.Control as='textarea' ref={remarks} />
      </Form.Group>
      
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
        {/* <Button variant="outline-secondary" onClick={handleClose} >
          Cancel
        </Button> */}
        <Button variant="primary" type="submit" disabled={loading} >
          {isInserAgain ? 'Create another': 'Create'} 
        </Button>
      </div>
    </Form>
    
    </>
  )
}

export default NewCamera;