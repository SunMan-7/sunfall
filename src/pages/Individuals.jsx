/*
This code displays a table populated with data from the "individual" table. The table is 
interactive, allowing users to click buttons and access additional information, such as 
detailed profiles or related records.
*/
import { useState, useMemo, useCallback, useEffect} from 'react';
import { Button, Modal} from 'react-bootstrap';
import TableWrapper from '../components/TableWrapper';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import Spinner from '../components/Spinner';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_INDIVIDUALS, GET_IMAGES_BY_INDIVIDUAL } from '../api/individualsGql';
import AddIndividuals from '../components/individuals/AddIndividuals';
import EditIndividuals from '../components/individuals/EditIndividuals';
import CustomSlider from '../components/CustomSlider';

// Extract properities of images and organize it into an array of objects.
const getImages = async (images, nhost) => {
  const results = await Promise.all(images.map(async (i) => ({
    id: i.file_id,
    name: i.file_name,
    src: await nhost.storage.getPublicUrl({ fileId: i.file_id }),
  })));
  return results;
};

const Individuals = ({nhost}) => {
  const [show, setShow] = useState(false); // Show modal where new individual can be added
  const [showEdit, setShowEdit] = useState(false); // Show modal where data can be changed
  const [showImages, setShowImages] = useState(false); // Show modal where images can be displayed
  const [rowData, setRowData] = useState(); // Store row data
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  const [showRosette, setShowRosette] = useState(false); // Show modal where rosette image can be viewed
  const [images, setImages] = useState([]);

  const {loading, error, data } = useQuery(GET_INDIVIDUALS);
  const [fetchImages, {data: imageList}] = useLazyQuery(GET_IMAGES_BY_INDIVIDUAL)

  const handleClose = () => setShow(false); // Close the modal that displays form that adds new individual
  const handleShow = () => setShow(true); // Show modal where the user can add new individual
  const handleCloseEdit = () => setShowEdit(false); // Close the modal where the user can edit individual

  const handleCloseImage = () => {
    setShowImages(false); // Close the modal that display images
    setCurrentImageIndex(0);
  }

  const handleCloseRosette = () => {
    setShowRosette(false); // Close the modal that display rosettes
    setCurrentImageIndex(0);
  }

  // opens modal to view higlighted images of selected individual
  const handleImageBtn = useCallback(async(prop) => {
    setRowData(prop); // Store the row data
    await fetchImages({variables: {individualId: prop.id}}); // Fetch images based on individual id
    setShowImages(true); // Show modal that displays image carousel
  },[fetchImages])

  
  const handleEditBtn = (props) => {
    setRowData(props); // Store the row data
    setShowEdit(true); // Show the Edit modal
  }

  // View the rosette/markings/patterns of animal
  const handleViewBtn = useCallback( (rosettes, props) => {
    const urls = rosettes.map( r => {
      return {
        id: r.file_id,
        name: props.individual_name,
        side: r.side,
        src: nhost.storage.getPublicUrl({fileId: r.file_id})
      }
    })
    setRowData(urls); // Store the row data
    setShowRosette(true); // Show modal that displays rosette image    
  }, [nhost?.storage])

  // Declare table headers and configure cell properties
  const columns = useMemo(
    () =>  [   
      {
        accessorKey: 'id',
        header: "ID"
      }, 
      {
        accessorKey: "rosettes",
        header: "Rosette",
        cell: ({row, getValue}) => {
          return (
            <>
            <Button 
              variant='outline-success'
              size='sm'
              disabled={getValue()?.length === 0} 
              onClick={() => handleViewBtn(getValue(), row.original)}
            >
              View Rosette
            </Button>
            </>
          )
        }
      }, 
      {
        accessorKey: "code_name",
        header: "Code name",
      }, 
      {
        id: "commonName",
        accessorFn: (row) => row.species.common_name,
        header: "Species",
      },
      {
        accessorKey: "age",
        header: "Age",
      },   
      {
        accessorKey: "sex",
        header: "Sex",
      },  
      {
        accessorKey: "year_discovered",
        header: "Year discovered",
      },  
      {
        // id: 'count',
        // accessorFn: row => row?.image_individuals_aggregate?.aggregate?.count,
        header: "Highlighted image(s)",
        cell: (prop) => {
          return (
            <Button 
              variant='outline-success'
              style={{width: '100%'}} 
              // disabled={prop?.getValue() === 0}
              onClick={() => handleImageBtn(prop?.row?.original)} size='sm'
            >
              View image(s)
            </Button>
          )
        }
      },    
      {                
        header: "Actions",
        cell: (prop) => {
          return (
            <div style={{
              display: 'flex', gap: '7%', color: 'green', 
              justifyContent: 'center'
            }}>
              <button>
                <PencilSquareIcon 
                  style={{ width: '20px', height: '20px' }} 
                  onClick={() => handleEditBtn(prop.row.original)}
                />                    
              </button>
            </div>
          )
        },            
      },        
    ],      
    [handleImageBtn, handleViewBtn]    
  );  

  // Process images containing specific individual
  useEffect(() => {
    if (imageList?.images.length > 0) {
      const fetchImages = async () => {
        const results = await getImages(imageList.images, nhost);
        setImages(results);
      };

      fetchImages();
    }
  }, [imageList, nhost]);

  // Show spinner animation while data is loading.
  if(loading){
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Spinner/>
      </div>
    )
  }

  // Show error message if data is fetched unsuccessfully.
  if(error) {
    console.log(error)
    return <div>Something went wrong! Try refreshing the page</div>
  } 

  return (
    <div style={{paddingLeft: '1em'}}>
    <div>Individuals</div>
    {data?.individuals.length > 0 
    ?
    <TableWrapper 
      data={data?.individuals} 
      columns={columns} 
      page={handleShow} 
      insertBtnType="modal" 
    />
    :
    <Button variant="primary" onClick={handleShow}>
        Add New Individuals
    </Button>
    }
    <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Add new individuals</Modal.Title>
      </Modal.Header>
      <Modal.Body> {show && <AddIndividuals handleClose={handleClose}/>} </Modal.Body>        
    </Modal>

    <Modal show={showEdit} onHide={handleCloseEdit} backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Edit individual (id: {rowData?.id})</Modal.Title>
      </Modal.Header>
      <Modal.Body> {showEdit && <EditIndividuals data={rowData} handleClose={handleCloseEdit}/>} </Modal.Body>        
    </Modal>

    { showImages &&
      <Modal show={showImages} onHide={handleCloseImage} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{rowData?.individual_name} (ID: {rowData?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {images.length > 0 
          ?  <>
            <div>Image {currentImageIndex+1}/{rowData?.image_individuals_aggregate?.aggregate?.count}</div>
            <div>
              <CustomSlider
                images={images}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
              />              
            </div>
            </>
          : "No highlighted images found"
          } 
        </Modal.Body>        
      </Modal>
    }

    <Modal show={showRosette} onHide={handleCloseRosette} size="lg">
      <Modal.Header closeButton>
        <Modal.Title> 
          {showRosette && rowData[currentImageIndex]?.name} ({showRosette && rowData[currentImageIndex]?.side})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {showRosette &&
        <CustomSlider
          images={rowData}
          currentIndex={currentImageIndex}
          setCurrentIndex={setCurrentImageIndex}
        />
      }
      </Modal.Body>
    </Modal>
    </div>
  )
}

export default Individuals