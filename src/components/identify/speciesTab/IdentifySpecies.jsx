/*
This is the component that is rendered by default under "Identify Species" tab. 
It displays the filter options, and the list of images uploaded. This is where users
can identify images or make changes to identify images by clicking or selecting the images.
*/

import { useState, useEffect} from 'react';
import { Gallery } from 'react-grid-gallery';
import { Modal, Row, Col }from 'react-bootstrap';
import ImageDetails from './ImageDetails';
import FilterOptions from '../FilterOptions';
import FloatingMenu from '../FloatingMenu';
import ImageSlider from '../../ImageSlider';
import { useMutation } from '@apollo/client';
import { UPDATE_IMAGE_BYID } from '../../../api/identifyGql';
import ActionButtons from '../ActionButtons';
import toast from 'react-hot-toast';

const ImageComponent = ({imageProps}) => {
  const [show, setShow] = useState(false); 
  return show ? (
    <img {...imageProps} />
  ) : (
    <div style={{ ...imageProps.style, textAlign: "center" }} onMouseOver={() => setShow(true)}>
      Hover to show
    </div>
  );
};

const IdentifySpecies = ({nhost}) => {
  const [images, setImages] = useState([]); 
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(-1); // store current index of image selected or displayed  
    
  const [updateImage] = useMutation(UPDATE_IMAGE_BYID)
  // Checks if any images in array have the isSelected property set to true.
  const hasSelected = images.some(image => image.isSelected); 
  
  // Helper function to get the current image
  const getCurrentImage = () => images[currentImageIndex];

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

  // Clear the selected images
  const handleClearSelection = () => {
    // Clear the selection for all images
    const nextImages = images.map((image) => ({
      ...image,
      isSelected: !hasSelected,
    }));
    setImages(nextImages);
  };

  const handleClick = (index) => {
    // Check if the image clicked is part of the selected images, returns boolean
    const inSelection = images[index].isSelected;

    // If atleast one image is selected, but the image clicked is not in selection, do nothing 
    if(hasSelected && !inSelection) {
      return null;
    };

    // Image that is has the checkbox checked
    if (inSelection){
      const imageId = images[index].id; // Store the image id

      //Find the index of the clicked image based on the image id
      const newIndex = selectedImages.findIndex(item => item.id === imageId);
      // Set the current index and show the view
      setCurrentImageIndex(newIndex);      
    }else{ // image that is simply clicked without checking the checkbox
      setCurrentImageIndex(index);
    }
    // setShowV(true); // Opens the modal window to view image(s)    
  };  

  // Closes the modal window
  const handleClose = () => setCurrentImageIndex(-1);

  const handleHighlight = async () => {
    const image = getCurrentImage();
    const newHighlightState = !image.isHighlighted;
    try {
      await updateImage({
        variables: {
          imageId: image?.id,
          values: {
            is_highlighted: newHighlightState
          }
        }
      })
      // refetchImages();
      // Locally update the state to reflect the new highlight status
      setImages(prevImages => prevImages.map(
        img => img.id === image.id ? { ...img, isHighlighted: newHighlightState } : img));

      // Display success message based on the new state
      toast.success(newHighlightState 
        ? 'Successfully highlighted image' 
        : 'Successfully unhighlighted image', 
        { position: 'bottom-right' }
      );
        
    }catch (error) {
      console.error(error.message);
      toast.error('Unable to highlight image(s)', {position: 'bottom-right'});
    }
  };

  const handleDownload = async(e) => {
    e.preventDefault();
    const image = getCurrentImage();
    // console.log(image.id)

    try {
      // const token = await nhost.auth.getAccessToken();
      // nhost.storage.setAccessToken(token)
      const fileReference = await nhost.storage.getPresignedUrl({ fileId: image.id })
      const url = fileReference.presignedUrl.url;
      // console.log(fileReference, url)
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok.');

      const blob = await response.blob();

      // Basic sanitization example
      const safeName = image.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = safeName || 'image';
      document.body.appendChild(a);
      a.click();
      a.remove();

       // Clean up the blob URL to free up memory
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Error downloading the file:', error);
      alert('Error downloading the file. Please try again.'); // User-friendly error reporting
    }
  };

  const handleDelete = async(e) => {
    e.preventDefault();
    const imageToDelete = getCurrentImage();
    const { error } = await nhost.storage.delete({ fileId: imageToDelete?.id });
    if(error) {
      toast.error('Unable to delete image')
    }else {      
      // Update images state by filtering out the deleted image
      setImages(prevImages => prevImages.filter(image => image.id !== imageToDelete.id));

      // Update the current index, if necessary
      if (currentImageIndex === images.length - 1) {
        // If we deleted the last image, set index to the last index of the updated array
        setCurrentImageIndex(currentImageIndex - 1);  // if result is -1, modal will close      
      }
      
      toast.success('Image deleted successfully');
    }
  };

  return (
    <> 
    <FilterOptions images={images} setImages={setImages} nhost={nhost}/>  
    {images?.length > 0 
    ?  
    <Gallery 
      images={images} 
      onSelect={handleSelect}  
      onClick={handleClick } 
      thumbnailImageComponent={ImageComponent}
    />   
    :
    <h6 className='mt-3'> No images displayed! Choose filter(s).</h6>
    } 
    {/* Floating menu at the bottom of screen that contains additional functions */}
    {hasSelected &&
    <FloatingMenu 
      selectedImages={selectedImages}
      setImages={setImages}
      clearSelection={handleClearSelection}
      nhost={nhost}
    />
    } 

    {/* Modal window to view image(s) */}    
    <Modal show={currentImageIndex >= 0} onHide={handleClose} centered fullscreen >
        <Modal.Header closeButton>
          <Modal.Title>          
            {hasSelected 
              ? 'Viewing selected photos' 
              : "Viewing all photos"
            }             
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
          <Col xl='9' lg='8' md='7' sm='12'>
            <ImageSlider 
              images={images} 
              currentImageIndex={currentImageIndex}  
              setCurrentImageIndex={setCurrentImageIndex} 
              // setShow={setShowV}
            /> 
          </Col>
          <Col xl='3' lg='4' md='5' sm='12'>
            <Row>
              <ImageDetails               
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex} 
                images={images}
                setImages={setImages} 
                // surveyName={survey?.label}
              />
            </Row>
            <Row className='mt-4'>
              <ActionButtons
                onHighlight={handleHighlight}
                onDownload={handleDownload}
                onDelete={handleDelete}
                image={images[currentImageIndex]}
              />
            </Row>
          </Col>         
        </Row>            
            </> 
        }         
        </Modal.Body>        
    </Modal>    
    </>    
  )
}

export default IdentifySpecies