import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import NewSpecies from '../components/species/NewSpecies';
import TableWrapper from '../components/TableWrapper';
import { EyeIcon} from '@heroicons/react/24/outline';
import Spinner from '../components/Spinner';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SPECIES, INSERT_SPECIES_BULK } from '../api/speciesGql';
// import EditSpecies from '../components/species/EditSpecies';
import ViewSpecies from '../components/species/ViewSpecies';
import CSVParser from '../components/CSVParser';
import toast from 'react-hot-toast';


const Species = () => {
  const { user } = useOutletContext();
  const [show, setShow] = useState(false);
  const [showView, setShowView] = useState(false);
  const [rowData, setRowData] = useState();
  const [csvData, setCsvData] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {loading, error, data } = useQuery(GET_SPECIES);
  const [insertSpeciesBulk] = useMutation(INSERT_SPECIES_BULK, {
    refetchQueries: [GET_SPECIES]
  })

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleCloseView = () => setShowView(false);

  const handleView = (props) => {
    setRowData(props);
    setShowView(true);
  }

  const columns = useMemo(
    () =>  [       
      {
        accessorKey: "id",
        header: () => "ID",
      },
      {
        accessorKey: "genus",
        header: () => "Genus",
      },
      {
        accessorKey: "species",
        header: () => "Species",
      },  
      {
        accessorKey: "common_name",
        header: () => "Common name",
      }, 
      {
        accessorKey: "authority",
        header: () => "Authority",
      },        
      {                
        header: "Actions",
        cell: (prop) => {
          return (
            <div style={{
              display: 'flex', gap: '7%', color: 'green', 
              justifyContent: 'center'
            }}>
              {/* <button>
                <PencilSquareIcon 
                  style={{ width: '24px', height: '24px' }} 
                  onClick={() => handleEditBtn(prop.row.original)}
                />                    
              </button> */}
              <button>
                <EyeIcon 
                  style={{ width: '24px', height: '24px' }}
                  onClick={() => handleView(prop.row.original)}
                  />
              </button>
            </div>
          )
        },            
      },        
    ],      
    []    
  )

  const handleSubmit = async() => {
    setSubmitting(true);
    const values = []; // to store the values that will be inserted into the species table

    //Compile all data to be uploaded to the database
    for (const s of csvData) { 
      values.push({
        taxon_id: s.taxonId, class: s.class,
        order: s.order, family: s.family,
        genus: s.genus, species: s.species,
        taxon_level: s.taxonLevel,
        authority: s.authority,
        common_name: s.commonName,
        taxonomy_type: s.taxonomyType,
        taxonomy_subtype: s.taxonomySubtype,
        scientific_name: s.scientificName
      })
    }
    try{
      await insertSpeciesBulk({
        variables: {values}
      })
      setCsvData([]); // empty the array after inserting
      toast.success("Successfully inserted data.")
    }catch(error){
      console.log(error.message);
      toast.error('Unable to update!');
    }
    setSubmitting(false);
  };

  if(loading){
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Spinner/>
      </div>
    )
  }

  if(error) {
    console.log(error)
    return <div>Something went wrong! Try refreshing the page</div>
  } 

  return (
    <div className='px-3'>
    {data?.species.length > 0 
    ?
    <>
    { user?.defaultRole === 'admin' && 
      <>
        <div style={{display: 'flex', marginBottom: '1rem'}}>        
          <CSVParser setCsvData={setCsvData} label='Upload species data in bulk:'/>
          {csvData?.length > 0 && 
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Button variant='outline-secondary' onClick={handleSubmit} size='sm' disabled={submitting}>
              {submitting ? <Spinner size='sm' /> : 'Submit CSV'}
            </Button>
          </div>
          }
        </div> 
        </>     
      }
    <TableWrapper 
      data={data?.species} 
      columns={columns} 
      page={handleShow} 
      insertBtnType="modal" 
    />
    </>
    :
    <>
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <Button variant="primary" onClick={handleShow}>
          Add New Species
      </Button>
      { user?.defaultRole === 'admin' && 
        <>
        <div>Or</div>
        <CSVParser setCsvData={setCsvData}/>
        {csvData?.length > 0 && 
        <Button variant='outline-secondary' onClick={handleSubmit} size='sm'>
          {submitting ? <Spinner size='sm' /> : 'Submit CSV'}
        </Button>
        }
        </>      
      }
    </div>
    
    </>
    }
    <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Add new species</Modal.Title>
      </Modal.Header>
      <Modal.Body> {show && <NewSpecies handleClose={handleClose}/>} </Modal.Body>        
    </Modal>

    <Modal show={showView} onHide={handleCloseView} backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>View species</Modal.Title>
      </Modal.Header>
      <Modal.Body> {showView && <ViewSpecies data={rowData} handleClose={handleCloseView}/>} </Modal.Body>        
    </Modal>
    </div>    
  )
}

export default Species