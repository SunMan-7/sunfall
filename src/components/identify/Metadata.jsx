/*
Displays data such as image name, id, data taken, etc in the metadata tab of image 
details component.
*/
import { useState } from 'react';
import EditImageDate from './speciesTab/EditImageDate';
import styles from '../../styles/components/Identify.module.css'

const Metadata = ({currentImageIndex, images, setImages}) => {
  const [showEditDate, setShowEditDate] = useState(false); 
  // console.log(image.deployment.id)

  return (
    <div >
    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '12px'}}>
        <div><strong> Date taken:</strong> </div> 
        <div>{images[currentImageIndex]?.dateTaken}</div>
      </div>
      <div >
        <button className={styles['metadata-edit-btn']} onClick={() => setShowEditDate(true)} >
          Edit date
        </button>
      </div>
    </div>                 
      
    <div className='mt-3' style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '12px'}}>
      <div><strong>Upload date:</strong> </div> 
      <div >{images[currentImageIndex]?.uploadedAt}</div>
    </div>

    <div className='mt-3' style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '12px'}}>
      <div><strong>Upload by:</strong> </div> 
      <div >{images[currentImageIndex]?.uploadedBy}</div>
    </div>

    <div className='mt-3' style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '12px'}}>
      <div><strong>Photo name:</strong> </div> 
      <div>{images[currentImageIndex]?.name}</div>
    </div>
    <div className='mt-3' style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '12px'}}>
      <div ><strong>Image ID:</strong> </div> 
      <div>{images[currentImageIndex]?.id}</div>
    </div>
    {images[currentImageIndex]?.isIdentified &&
    <>
    <div className='mt-3' style={{display: 'flex', gap: '0.5rem', fontSize: '12px'}}>
      <div><strong>Species identified by:</strong> </div> 
      <div>{images[currentImageIndex]?.identifiedBy}</div>
    </div>
    <div className='mt-3' style={{display: 'flex', gap: '0.5rem', fontSize: '12px'}}>
      <div><strong>Species identified at:</strong> </div> 
      <div>{images[currentImageIndex]?.identifiedAt}</div>
    </div>
    </>
    }
    {images[currentImageIndex]?.isProfiled &&
    <>
    <div className='mt-3' style={{display: 'flex', gap: '0.5rem', fontSize: '12px'}}>
      <div><strong>Individuals identified by:</strong> </div> 
      <div>{images[currentImageIndex]?.profiledBy}</div>
    </div>
    <div className='mt-3' style={{display: 'flex', gap: '0.5rem', fontSize: '12px'}}>
      <div><strong>Individuals identified at:</strong> </div> 
      <div>{images[currentImageIndex]?.profiledAt}</div>
    </div>
    </>
    }
    {showEditDate &&
      <EditImageDate
        currentImageIndex={currentImageIndex}
        images={images} 
        setImages={setImages}
        show={showEditDate}
        setShow={setShowEditDate}
      />
    }
    </div>
  )
}

export default Metadata