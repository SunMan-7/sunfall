/*
This component allows users to edit capture date of current image displayed on the
modal window.
*/

import { useState, useContext } from 'react';
import {Button, Form} from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { UPDATE_IMAGE_BYID } from '../../../api/identifyGql';
import { useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import Spinner from '../../Spinner';
import IdentifyContext from '../IdentifyContext';

const SingleEditDate = ({currentImageIndex, images, setShow}) => {  
  const { refetchImages } = useContext(IdentifyContext);
  const [dateTime, setDateTime] = useState(new Date(images[currentImageIndex]?.dateTaken));
 
  const [updateDateTaken, {loading, error}] = useMutation(UPDATE_IMAGE_BYID);

  const handleSubmit = async(e) => {
    e.preventDefault();

    // Update date_taken field in database based on the current image ID
    await updateDateTaken ({
      variables: {
        imageId: images[currentImageIndex]?.id,
        values: { date_taken: dateTime}
      }      
    })

    if (error) {
      toast.error("Unable to update.");
      console.log(error.message)
    }else {
      toast.success('Dates update successfully'); 
      refetchImages();  
      setShow(false);     
    };
  }    
  
  return (            
    <Form onSubmit={handleSubmit}>
      <h6 style={{fontSize: '0.85rem', color: '#008000'}}>Set date and time of current image.</h6> 
      <Form.Group  className="mb-3" style={{display: 'flex', flexDirection: 'column'}} >
        <DatePicker       
          selected={dateTime} 
          onChange={date => setDateTime(date)}                           
          closeOnScroll={true}
          dateFormat="yyyy-MM-dd hh:mm:ss aa"
          timeInputLabel='Time:'
          showTimeInput
          placeholderText='Click to select date'
          customInput={<Form.Control />} 
          isClearable
          required            
        />
        <Form.Text style={{fontSize: '0.75rem'}}>yyyy-mm-dd hh:mm:ss  </Form.Text>
      </Form.Group>
      <div className='d-flex gap-2 justify-content-end'>
        {/* <Button variant="secondary" onClick={() => setShow(false)} size='sm'>
          Cancel
        </Button> */}
        <Button variant="primary" type='submit' disabled={loading} size='sm'>
          {loading ? <Spinner size="sm" /> : 'Save Changes'}
        </Button>
      </div>
    </Form>
  )
}

export default SingleEditDate