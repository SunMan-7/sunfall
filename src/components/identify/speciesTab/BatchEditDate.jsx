/*
This component allows users to edit capture date of images within the same 
camera check.
*/
import { useState, useContext } from 'react';
import {Button, Form} from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { UPDATE_DATE_TAKEN_BULK } from '../../../api/identifyGql';
import { useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import Spinner from '../../Spinner';
import IdentifyContext from '../IdentifyContext';

const BatchEditDate = ({currentImageIndex, images, setShow}) => {  
  const { refetchImages } = useContext(IdentifyContext);
  const [dateTime, setDateTime] = useState(new Date());
  const deployment_id = images[currentImageIndex].deployment.id;
 
  const [updateDateTakenBulk, {loading, error}] = useMutation(UPDATE_DATE_TAKEN_BULK);

  const handleSubmit = async(e) => {
    e.preventDefault();
   
    const startingTimestamp = new Date(dateTime); // correct timestamp from input
    const currentImageTimestamp = new Date(images[currentImageIndex].dateTaken); // date taken timestamp of current image
    const timeDifference = startingTimestamp.getTime() - currentImageTimestamp.getTime(); // timeshift in milliseconds

    const imageTimestamps = images.filter(i => i.deployment.id === deployment_id).map(i => {
      let currentDateTaken = new Date(i.dateTaken)

      // add the the time difference to the date in the images array
      const correctedDate = new Date(currentDateTaken.getTime() + timeDifference);
      return {
        _set: {date_taken: correctedDate}, 
        where: {file_id: {_eq: i.id}}
      };      
    })

    // Update date_taken field in database based on the indiviual image ID
    await updateDateTakenBulk ({
      variables: {imageTimestamps}      
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
      <h6 style={{fontSize: '0.85rem', color: '#008000'}}>Batch edit camera check date and time</h6> 
      <p style={{fontSize: '0.75rem'}} className='text-muted'>Edit the date and time for all images 
        within the same camera check. Set the date and time of the current image. The date and time 
        for all images in the same camera check will be shifted proportionally.
      </p> 
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

export default BatchEditDate