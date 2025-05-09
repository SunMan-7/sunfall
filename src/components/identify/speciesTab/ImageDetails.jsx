// When the user clicks on an image in the identify section, a modal form
// opens and this component will be displayed on the right side next to the
// image. It will have two tabs, Identify and Metadata.

import {Tab, Tabs,} from 'react-bootstrap';
import NewIdSpeciesOne from './NewIdSpeciesOne';
import EditIdSpecies from './EditIdSpecies';
import Metadata from '../Metadata';
import NewIdIndividuals from './NewIdIndividuals';
import EditIdIndividuals from './EditIdIndividuals';

const ImageDetails = ({currentImageIndex, setCurrentImageIndex, images, setImages}) => {  
  return (
    <>   
      <Tabs
        defaultActiveKey="identify"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="identify" title="Identify">
          {images[currentImageIndex]?.isIdentified 
          ? <EditIdSpecies images={images} currentImageIndex={currentImageIndex} />
          : <NewIdSpeciesOne 
              images={images} setImages={setImages} 
              currentImageIndex={currentImageIndex} 
              setCurrentImageIndex={setCurrentImageIndex}
            />
          }
        </Tab>
        <Tab eventKey="metadata" title="Metadata">
          <Metadata  
            currentImageIndex={currentImageIndex} 
            images={images} 
            setImages={setImages}
          />          
        </Tab>
        <Tab eventKey="idIndividual" title="Individuals">
          {images[currentImageIndex]?.isProfiled
          ? <EditIdIndividuals images={images} currentImageIndex={currentImageIndex} />
          : <NewIdIndividuals images={images} currentImageIndex={currentImageIndex} /> 
          }
        </Tab>
      </Tabs>   
    </>
  )
}

export default ImageDetails