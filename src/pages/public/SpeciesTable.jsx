/*
This component is a public display of the species table. It can be directly accessed 
without sign in.
*/
import { useState, useMemo } from 'react';
import Modal from 'react-bootstrap/Modal';
import TableWrapper from '../../components/TableWrapper';
import { EyeIcon} from '@heroicons/react/24/outline';
import Spinner from '../../components/Spinner';
import { useQuery, } from '@apollo/client';
import { GET_SPECIES,} from '../../api/speciesGql';
// import EditSpecies from '../components/species/EditSpecies';
import ViewSpecies from '../../components/species/ViewSpecies';

const SpeciesTable = () => {
  const [showView, setShowView] = useState(false);
  const [rowData, setRowData] = useState();

  const {loading, error, data } = useQuery(GET_SPECIES);
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
    <div className='px-3 mt-3'>
      <h4>Wild Eyes </h4>
      <p>
        Search species by typing in the search box. 
        Click on the eye icon to view more row details.
      </p>
    {data?.species?.length &&
    <TableWrapper 
      data={data?.species} 
      columns={columns} 
      // page={handleShow} 
      // insertBtnType="modal" 
    />
    }

    <Modal show={showView} onHide={handleCloseView} backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>View species</Modal.Title>
      </Modal.Header>
      <Modal.Body> {showView && <ViewSpecies data={rowData} handleClose={handleCloseView}/>} </Modal.Body>        
    </Modal>
    </div>    
  )
}

export default SpeciesTable