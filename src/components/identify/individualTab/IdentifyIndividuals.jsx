/* 
This code enables users to filter data from the database after selecting a survey, 
a deployment, and a species. The resulting images are displayed in ascending order 
based on their date of capture. Additionally, users can identify individual 
subjects within the images.
*/
import styles from '../../../styles/components/Identify.module.css'
import { useState, } from 'react';
import { Gallery } from 'react-grid-gallery';
// import { ThumbnailImageProps } from "react-grid-gallery";
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import {Row, Col, Modal, Button }from 'react-bootstrap';
import ImageDetails from '../speciesTab/ImageDetails';
import IdIndividualForm from './IdIndividualForm';
import FilterOptions from '../FilterOptions';
import ImageSlider from '../../ImageSlider';

const IdentifyIndividuals = ({data, nhost}) => {
  const [images, setImages] = useState([]); // Store images
  const [showI, setShowI] = useState(false); // Display modal for identification
  const [showV, setShowV] = useState(false);  // Diplay modal for image viewing 
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  // const [species, setSpecies] = useState(); // Store species selected
  const [selectedImages, setSelectedImages] = useState(); // Store selected images

  // Close modal where images are examined for individual identification
  const handleCloseIdentifyModal = () => setShowI(false);

  // Checks if any images in array have the isSelected property set to true.
  const hasSelected = images.some(image => image.isSelected); 

  const handleSelect = (index) => {  
    // Update isSelected property for the selected image   
    const nextImages = images.map((image, i) =>
      i === index ? { ...image, isSelected: !image.isSelected } : image
    );
    setImages(nextImages);

    // Filter all images that are selected and add to selectedImages 
    const temp = nextImages.filter(image => image.isSelected)
    setSelectedImages(temp);
  };

  const handleClick = (index) => {
    // Check if the image clicked is part of the selected images
    const inSelection = images[index].isSelected;

    // If atleast one image is selected, only the image selected can 
    if(hasSelected && !inSelection) {
      return null
    };

    if (inSelection){
      const imageId = images[index].id;
      const newIndex = selectedImages.findIndex(image => image.id === imageId)
      // Set the current index and show the view
      setCurrentImageIndex(newIndex);      
    }else{
      setCurrentImageIndex(index);
    }
    // setShowV(true)
    setShowI(true);
  };  

  const handleClearSelection = () => {
    const nextImages = images.map((image) => ({
      ...image,
      isSelected: !hasSelected,
    }));
    setImages(nextImages);
  };

  const hideView = () => {
    setShowV(false);
    setCurrentImageIndex(0);
  }
  
  // if (loading) return <Spinner />;
  // if (error) return <div>Something went wrong. Trying refreshing the page. ({error})</div>;  

  return (
    <>
    <FilterOptions data={data} setImages={setImages} nhost={nhost}/>  
    {images?.length > 0 
    ?  
    <Gallery 
      images={images} 
      onSelect={handleSelect}  
      onClick={handleClick } 
      // thumbnailImageComponent={ImageComponent}
    />   
    :
    <h6 className='mt-3'> No images displayed! Choose filter(s).</h6>
    } 

    {hasSelected &&
    <div className={styles['floating-menu']}>
      <div className={styles['floating-menu__left']}>
        <div><XMarkIcon className={styles['close-icon']}  onClick={handleClearSelection} /></div>
        <div>{images.filter(i => i.isSelected).length} image(s) selected</div>
      </div>
      <div className={styles['floating-menu__right']}>
        <div>
          <Button 
            variant='outline-light' size='sm' 
            onClick={() => setShowV(!showV)}
          >
            View
          </Button>  
        </div>
        <div>    
          <Button 
            variant='light' className='me-1' 
            size='sm' onClick={() => setShowI(!showI)}
          >
            Identify
          </Button>
        </div> 
        <div>
          <TrashIcon className={styles['delete-icon']}/>
        </div>        
      </div>
    </div>
    }     
        
    <Modal show={showV} onHide={hideView} centered size='xl' >
      <Modal.Header closeButton>
        <Modal.Title>          
          {hasSelected ? 'Viewing selected photos' : "Viewing all photos" }             
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{display: 'flex'}}> 
      {hasSelected
        ?           
          <div >
            <ImageSlider 
              images={selectedImages} 
              currentImageIndex={currentImageIndex}  
              setCurrentImageIndex={setCurrentImageIndex}
            /> 
          </div>
        :
        <>
        <Row>
          <Col xxl='9' lg='8' md='7' sm='12'>
            <ImageSlider 
              images={images} 
              currentImageIndex={currentImageIndex}  
              setCurrentImageIndex={setCurrentImageIndex} 
              // setShow={setShowV}
            /> 
          </Col>
          <Col xxl='3' lg='4' md='5' sm='12'>
            <ImageDetails               
              currentImageIndex={currentImageIndex}
              images={images}
              setImages={setImages} 
              // surveyName={survey?.label}
            />
          </Col>         
        </Row>            
            </> 
        }            
      </Modal.Body>        
    </Modal>    

    <Modal show={showI} onHide={handleCloseIdentifyModal} fullscreen>
        <Modal.Header closeButton>
          <Modal.Title>Identify individuals</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col  xs='6'>
              <div className='px-3'>
                <h6>Selected Images</h6>
                <div>{currentImageIndex+1}/{selectedImages?.length}</div>
                <ImageSlider 
                  images={images} 
                  currentImageIndex={currentImageIndex}  
                  setCurrentImageIndex={setCurrentImageIndex} 
                  // setShow={setShowV}
                /> 
                {/* <CustomSlider 
                  // images={images.filter(image => image.isSelected)} 
                  images={selectedImages}
                  currentImageIndex={currentImageIndex}  
                  setCurrentImageIndex={setCurrentImageIndex}              
                />           */}
              </div>
            </Col>

            <Col xs='6' >
              <div className='px-3'>
              <IdIndividualForm 
                // speciesId={species?.value}
                imageIds={images.filter(i => i.isSelected ).map(i => i.id)} 
                cancel={handleCloseIdentifyModal} 
              />
              </div>
            </Col>
          </Row>
          
        </Modal.Body>        
      </Modal>
    </>
    
  )
}

export default IdentifyIndividuals