/*
This component will be displayed as a floating menu at the bottom center of the screen.
It gives certain users the option to identify, hightlight or delete multiple images at once.
The identify button will be disabled if atleast one image selected has already been identified.
*/
import {useState, useContext} from 'react';
import { Button, Popover, OverlayTrigger, Modal } from 'react-bootstrap';
import styles from '../../styles/components/Identify.module.css'
import { XMarkIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import NewIdSpeciesMany from './speciesTab/NewIdSpeciesMany';
import { toast } from 'react-hot-toast';
import Spinner from '../Spinner';
import { useMutation } from '@apollo/client';
import { UPDATE_IMAGES } from '../../api/identifyGql';
import IdentifyContext from './IdentifyContext';

const FloatingMenu = (props) => {
  const { refetchImages } = useContext(IdentifyContext)
  const {selectedImages, setImages, clearSelection, nhost} = props;
  const [confirmShow, setConfirmShow] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const imageIds = selectedImages.filter(i => i.isSelected ).map(i => i.id);

  const [updateImages,] = useMutation(UPDATE_IMAGES);

  // Checks if any images in array have the isSelected property set to true.
  // const hasSelected = images.some(image => image.isSelected); 
  
  // checks if selected images have atleast one identified images (is_identified = true).
  const hasIdentified = selectedImages.some(image => image.isIdentified);
  
  const popover = (
    <Popover id="popover-basic">
      {/* <Popover.Header as="h3">Popover right</Popover.Header> */}
      <Popover.Body>
        <NewIdSpeciesMany imageIds={imageIds} setImages={setImages}/>
      </Popover.Body>
    </Popover>
  );

  const confirmDeletion = () => {
    setConfirmShow(true); // Show modal for confirmation
  }

  const handleHighlight = async () => {
    try {
      await updateImages({
        variables: {
          imageIds,
          values: {
            is_highlighted: true
          }
        }
      })
      toast.success('Successfylly highlighted images')
      refetchImages();
      // const imageIdSet = new Set(imageIds);

      // // Update the local state with the new highlighted status
      // setImages(prevImages => prevImages.map(image => ({
      //   ...image,
      //   isHighlighted: imageIdSet.has(image.id) ? true : image.isHighlighted
      // })));
    }catch (error) {
      console.error(error.message);
      toast.error('Unable to highlight image(s)');
    }

  };

  const deleteImages = async () => { 
    setIsDeleting(true); // The deletion of the image(s) starts 
    const deletedImageIds = [];
    try{
      for (let i = 0; i < selectedImages.length; i++) {  
        const { error } = await nhost.storage.delete({ fileId: selectedImages[i].id });     
    
        if (error) {
          throw new Error(error);
        }else{
          deletedImageIds.push(selectedImages[i].id);

        }
      }
      toast.success("Photo(s) deleted successfully"); 

      const idsToRemove = new Set(deletedImageIds);
        // Update the images array in state without refetching from the server        
      setImages((prevImages) => {
        // Filter out images whose IDs are included in the imageIds array
        const updatedImages = prevImages.filter(image => !idsToRemove.has(image.id));
        return updatedImages;
      }); 
      // refetchImages();
    } catch(error){
      console.error(error.message);
      toast.error("Unable to delete some photo(s)");
    }  
    
    setIsDeleting(false);  // The deletion of the image(s) ends
    setConfirmShow(false); // Close the confirmation modal window
  };

  return (
    <>
    <div className={styles['floating-menu']}>
      <div className={styles['floating-menu__left']}>
        <div><XMarkIcon className={styles['close-icon']}  onClick={clearSelection} /></div>
        <div>{selectedImages.length} photo(s) selected</div>
      </div>
      <div className={styles['floating-menu__right']}>
        <OverlayTrigger trigger="click" placement="top" overlay={popover}>
          <Button variant="light" className='me-1' size='sm' disabled={hasIdentified}>Identify</Button>
        </OverlayTrigger>
        <div>
          <StarIcon
            className={styles['delete-icon']}
            onClick={handleHighlight}
          />
        </div>
        <div>
          <TrashIcon 
            className={styles['delete-icon']}
            onClick={confirmDeletion}
          />
        </div>        
      </div>
    </div>

    {/* Confirmation modal to delete image(s) */}
    <Modal
      size="sm"
      show={confirmShow}
      onHide={() => setConfirmShow(false)}
      aria-labelledby="example-modal-sizes-title-sm"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-sm">
          Confirm Deletion
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>Permanently delete selected photo(s)?</Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={() => setConfirmShow(false)} size='sm'>Cancel</Button>
        <Button variant='danger' onClick={deleteImages} disabled={isDeleting} size='sm'>
          {isDeleting ? <Spinner size='sm' /> : 'Delete'}
        </Button>
      </Modal.Footer>
    </Modal> 
    </>
  )
}

export default FloatingMenu