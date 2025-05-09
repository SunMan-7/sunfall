/*
This component lets users change capture date of one or more images.
*/
import {Modal, Tab, Tabs } from 'react-bootstrap';
import BatchEditDate from './BatchEditDate';
import SingleEditDate from './SingleEditDate';

const EditImageDate = ({currentImageIndex, images, show, setShow}) => {   
  return (
    <Modal 
      show={show} onHide={() => setShow(false)} 
      centered size='sm' style={{zIndex: 1075}}
      backdrop='static' keyboard={false}
    >   
      <Modal.Header closeButton>
        <Modal.Title>Edit Date</Modal.Title>
      </Modal.Header>

      <Modal.Body>          
        <Tabs className='mb-2'>
          <Tab eventKey='single' title="Single Edit">
            <SingleEditDate 
              currentImageIndex={currentImageIndex}
              images={images}
              setShow={setShow}
            />            
          </Tab>
          <Tab eventKey='batch' title="Batch Edit">
            <BatchEditDate
              currentImageIndex={currentImageIndex}
              images={images}
              setShow={setShow}
            />
          </Tab>          
        </Tabs>                       
      </Modal.Body>           
    </Modal>
  )
}

export default EditImageDate