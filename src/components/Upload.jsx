/*
This component allows users to upload images by camera check. They must first choose 
location name and then the camera check name.
*/
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Modal, Row, Col } from "react-bootstrap";
import styles from '../styles/components/Upload.module.css';
import { XCircleIcon } from '@heroicons/react/24/solid';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { useFileUpload } from "@nhost/react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { INSERT_IMAGE_DATA_ONE, INSERT_UPLOAD_DETAILS} from "../api/uploadGql";
import { UPDATE_IMAGES } from "../api/identifyGql";
import imageCompression from "browser-image-compression";
import exifr from "exifr";
// import Spinner from "../components/Spinner";
import Spinner from "./Spinner"
import { GET_LOCATION_NAMES, GET_PROJECT_LOCATIONS } from "../api/locationGql";
import { GET_DEPLOYMENT_NAMES_BY_LOC_ID } from "../api/deploymentGql";


// Custom progress bar that shows the image upload progress
const CustomProgressBar = ({now, count, totalImages}) => {
  return (
    <div style={{display: 'flex', alignContent: 'center', width: '100%'}}>
      <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
        <h6>{count}/{totalImages} Uploading images...</h6>
        <p style={{color: 'red', fontSize: '0.9rem'}}>Please stay on this page until upload is finished.</p>
        <ProgressBar 
          animated now={now} 
          label={`${now}%`} 
          style={{width: '100%', height: '20px'}} 
        />
      </div>
    </div>
  )
}

// Display a preview of a couple images from a list of selected images to upload
const Thumbs = ({images, handleRemove}) => {
  return (
    images.slice(0, 11).map(image => (
      <div className={styles.thumb} key={image.name}>
        <div className={styles.thumbInner}>
          <img
            src={image.preview}
            className={styles.cameraImg}
            // Revoke data uri after image is loaded
            onLoad={() => { URL.revokeObjectURL(image.preview) }}
            alt={image.name}
          />            
          <button onClick={() => handleRemove(image.path)}>
            <XCircleIcon style={{width: '20px', height: '20px', color: 'red'}}/>
          </button>
        </div>
        {/* <i style={{fontSize: '8px'}}>{file.path} - {file.size} bytes</i> */}        
      </div>
    ))
  )
}

// Options used to compress files
const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  // preserveExif: true,
}

const Upload = ({nhost}) => {
  const {id: projectId } = JSON.parse(localStorage.getItem('project'));
  const { code_name} = JSON.parse(localStorage.getItem('organization'));
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [cameraCheck, setCameraCheck] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [show, setShow] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleClose = () => setShow(false); // To close confirmation dialog

  // Opens the confirmations dialog
  const handleShow = () => {
    try{
      validateInputs(images?.length) // check that user has selected images and selected camera check
      setShow(true)
    }catch(error){
      toast.error(error.message);
    }
  };

  const [insertImageDataOne,] = useMutation(INSERT_IMAGE_DATA_ONE);
  const [insertUploadDetails, ] = useMutation(INSERT_UPLOAD_DETAILS);
  const [updateImages, ] = useMutation(UPDATE_IMAGES);

  // Fetch location names from the database based on projectId
  const { data: locationNames, loading: loadingLocations} = useQuery(GET_PROJECT_LOCATIONS, {
    variables: {projectId},
    skip: !projectId
  });
  // Fetch deployment names from the database based on the location entered 
  const [getDeploymentNames, 
    { data: depNames, loading: loadingDeployments}] = useLazyQuery(GET_DEPLOYMENT_NAMES_BY_LOC_ID); 
   
  const { upload, } = useFileUpload(); 

  // processes the images that are selected
  const {getRootProps, getInputProps} = useDropzone({    
    accept: {
      'image/*': []
    },
    onDrop: acceptedFiles => { 
      setIsSelecting(true);
      setImages(acceptedFiles.map(image => Object.assign(image, {
        preview: URL.createObjectURL(image)
      })));
      setIsSelecting(false);
    },    
  });

  // Remove images if the x icon is clicked
  const handleRemove = path => {
    setImages(images.filter(image => image.path !== path));
  };

  // Images and image metadata are uploaded to the database
  const handleUpload = async () => { 
    handleClose(); // closes the confirmation box
    setIsUploading(true); // Disables the upload button
    const totalImages = images.length;
    let count = 0;
    // const imageData = []; // stores image metadata that will be uploaded to other tables
    const imageIds = []; // will store only image ids returned from the database
    const start_time = new Date();
    try {            
      for (const image of images) {      
        const now = Math.round((++count / totalImages) * 100);
        showUploadProgress(now, count, totalImages);        
        await uploadImages(image, imageIds );
      }
      handleSuccess();      
    } catch (error) {
      handleError(error, imageIds);
    } finally {
      if(imageIds.length > 0) {
        try {
          await updateUploadDetails(totalImages, count, imageIds, start_time);
        }catch (error) {
          console.log(error.message);
        }
      }
    }  
    setIsUploading(false); // Enables the upload button
  } // end handleUpload()


  // Validates user inputs
  const validateInputs = (totalImages) => {
    // checks to ensure that image(s) are selected
    if (totalImages === 0) {
      throw new Error('Please select images');
    }

    //checks to ensure that camera check are selected
    if (!location?.value) {
      throw new Error('Please select a location');
    }

    //checks to ensure that camera check are selected
    if (!cameraCheck?.value) {
      throw new Error('Please select a camera check');
    }
  };

  const uploadImages = async (image, imageIds) => { 
    const file_name = image.name.substring(0, image.name.lastIndexOf('.'));    
    const { file, dateTaken } = await processImage(image); 
    const { id, isError, isUploaded } = await upload({ file, bucketId: code_name });

    if (isError) {        
      throw new Error('Unable to upload file');
    }
  
    if (isUploaded) {
      await insertImageDataOne({
        variables: { imageData: {
          file_id: id,
          deployment_id: cameraCheck.value,
          file_name,
          date_taken: dateTaken.DateTimeOriginal,
          project_id: projectId,
        }}
      })
      imageIds.push(id); // save the returned id of uploaded images
    }
    // Make sure to revoke the data uris to avoid memory leaks
    URL.revokeObjectURL(image.preview);
  };

  // Saves upload history to upload_details table
  const updateUploadDetails = async (totalImages, uploads, imageIds, start_time) => {      
      const { data } = await insertUploadDetails({
        variables: {
          values: {
            submits: totalImages,
            uploads,
            start_time,
            end_time: new Date(),
            status: totalImages === uploads ? 'Complete' : 'Incomplete',
            deployment_id: cameraCheck.value,
            project_id: projectId
          }
        }
      });
  
      //ensures that upload details are linked to each image
      updateImages({
        variables: {
          imageIds,
          values: {
            upload_id: data?.insert_upload_details_one?.id
          }
        }
      });    
  };

  const showUploadProgress = (now, count, totalImages) => {
    toast.loading(
      <CustomProgressBar now={now} count={count} totalImages={totalImages} />,
      { id: 'progress', style: { minWidth: '300px' } }
    )
  };

  const processImage = async (image) => {
    // console.log(image);
    // Use Promise to await the image compression
    // const file = await new Promise((resolve, reject) => {
    //   new Compressor(image, {
    //     quality: 0.8,
    //     retainExif: true,
    //     success(result) {
    //       resolve(new File([result], image.name));
    //     },
    //     error(err) {
    //       reject(err);
    //     },
    //   });
    // }); 

    let file = await imageCompression(image, options); // compress image to reduce storage space
    file = new File([file], image.name); // convert image to file type instead of blob

    const dateTaken = await exifr.parse(image, ['DateTimeOriginal']); // extract date taken of image
    return { file, dateTaken };
  };  
  
  const handleSuccess = (totalImages, count) => {
    if (totalImages === count) {
      toast.success('All images uploaded', { id: 'progress' });
      setImages([]);
    }
  };

  // if there are errors, the uploaded images will be deleted
  const handleError =  async(error, imageIds) => {
    console.error(error.message);
    toast.error(error.message, { id: 'progress' });
    if(imageIds?.length > 0){      
      for(const id of imageIds){
        nhost.storage.delete({ fileId: id })
      }
    }
  };

  return (
    <>
    <Card className="shadow" style={{maxWidth: '800px'}}>
    <section  className="p-3" style={{background: 'grey', borderRadius: '5px 5px 0 0'}} >
      {isSelecting && <Spinner />}
      {images.length > 0 && (
      <>
      <div className="mb-2" style={{color: 'white'}}>
        {images.length} file(s) selected
      </div>
      <aside className={styles.thumbsContainer}>
        <Thumbs images={images} handleRemove={handleRemove} />
        {images.length >= 12 && 
        <div className={styles.thumb}>
          <div className={styles.thumbInner} style={{border: '1px solid #eaeaea'}}>
            <span>+{images.length-11}</span>
          </div>        
        </div>  
        }
      </aside>
      </>
      )}
      
      <div          
        style={{width: '100%', height: '100%', marginTop: '1rem'}}
        {...getRootProps({className: 'dropzone'})} 
      >
        <input  {...getInputProps()}  />
        <p className={styles.dropzoneContent}>
          Drop some images here, or click to select images to upload
        </p>
      </div>
      
    </section>
    <Form className="p-3">
      <Row> 
      <Form.Group className='mb-2' as={Col} md='6' xs='12' >
          {/* <Form.Label>Deployment</Form.Label> */}
          <Select                 
            onChange={prop => {
              setLocation(prop)
              setCameraCheck(null)
              getDeploymentNames({ variables: {
                locationId: prop?.value
              }})
            }}    
            isDisabled={loadingLocations}
            isLoading={loadingLocations}
            isClearable                      
            options={locationNames?.locations?.map(l => (
              {value: l.id, label: l.location_name}
              ) )}                       
            placeholder='Select location...' 
            size='sm'
          />          
        </Form.Group> 

        <Form.Group className='mb-3' as={Col} md='6' xs='12' >
          {/* <Form.Label>Deployment</Form.Label> */}
          <Select  
            value={cameraCheck}               
            onChange={prop => {setCameraCheck(prop)}}    
            isDisabled={!location || loadingDeployments}
            isLoading={loadingDeployments}
            isClearable         
            options={depNames?.deployments?.map(d => (
              {value: d?.id, label: `${d?.deployment_name} [C${d?.check_number}, P${d?.camera_placement}]`,
              cameraName: d?.camera?.camera_name, checkNumber: d?.check_number,
              placement: d?.camera_placement
              }
              ) )}           
            placeholder='Select camera check...'     
          />
          <Form.Text style={{fontSize: '0.80rem',}}>
            {cameraCheck &&
              `camera: ${cameraCheck.cameraName}, check #: ${cameraCheck.checkNumber}, 
              placement: ${cameraCheck.placement}`
            }
          </Form.Text>
        </Form.Group>  
      </Row> 
      <div className={styles.buttons}> 
        {/* <Button variant="outline-secondary" onClick={handleCancel}>Cancel</Button>  */}
        <Button onClick={handleShow} 
          disabled={isUploading }
        >
          Upload
        </Button>  
      </div>        
    </Form>
    </Card>
    <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Confirm upload</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <h6>Do you confirm? </h6>
        <div style={{fontSize: '0.90rem'}}> 
        <p style={{marginBottom: 0, }} >
          Selected images will be uploaded to this camera check:
        </p>
        <p style={{marginBottom: 0}}>
          Check name:{' '} 
          <span style={{color: 'green'}}>{cameraCheck?.label}</span>
        </p> 
        {cameraCheck?.checkNumber && 
          <p style={{marginBottom: 0, }}>Check #: {' '}
            <span style={{color: 'green',}}>{cameraCheck?.checkNumber}</span>
          </p>
        } 
        <p style={{marginBottom: 0}}>
          Camera name: <span style={{color: 'green'}}>{cameraCheck?.cameraName}</span>
        </p>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>
        Cancel 
      </Button>
      <Button variant="primary" onClick={handleUpload}>
        Confirm
      </Button>
    </Modal.Footer>
  </Modal>
</>
  )
}

export default Upload