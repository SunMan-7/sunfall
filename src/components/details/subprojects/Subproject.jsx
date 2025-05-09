/*
This component displays the subprojects table and the option to upload csv file with subproject
data.
*/
import { useState, useMemo, } from 'react';
import {Button, Modal} from 'react-bootstrap';
import TableWrapper from '../../TableWrapper';
import { PencilSquareIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import Spinner from '../../Spinner';
import { useQuery, useMutation } from '@apollo/client';
import {GET_SUBPROJECTS, UPSERT_SUBPROJECTS_MANY } from '../../../api/subprojectGql';
import NewSubproject from './NewSubproject';
import ViewDeployments from './ViewDeployments';
import EditSubproject from './EditSubproject';
// import { Link, } from 'react-router-dom';
import ExportToCSV from '../../csvOptions/ExportToCSV';
import ImportToCSV from '../../csvOptions/ImportCSV';
import toast from 'react-hot-toast';

const subprojectCSVTemplate = [{
  project_code: null,
  subproject_name: null,
  description: null,  
}]

const Subproject = () => {
  const {id: projectId, project_code} = JSON.parse(localStorage.getItem('project'));
  const [show, setShow] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [rowData, setRowData] = useState();  
  const [importData, setImportData] = useState([]);
  const [processing, setProcessing] = useState(false);
  
  const {loading, error, data } = useQuery(GET_SUBPROJECTS, {
    variables: {projectId},
    skip: !projectId
  });

  const [upsertSubprojects, {loading: updating}] = useMutation(UPSERT_SUBPROJECTS_MANY, {
    refetchQueries: [GET_SUBPROJECTS]
  })
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleCloseEdit = () => setShowEdit(false);
  // const handleShowEdit = () => setShowEdit(true);

  // const handleViewBtn = (prop) => {    
  //   setRowData(prop);
  //   setShowView(true);
  // };

  const handleEditBtn = (data) => {
    setRowData(data);
    setShowEdit(true);
  }

  const handleClick = (data) => {
    setRowData(data);
    setShowView(true);
  }
  const columns = useMemo(
    () =>  [  
      {
        accessorKey: "id",
        header: () => "ID",
      },
      {
        accessorKey: "subproject_name",
        header: () => "Subproject name",
        cell: prop => {
          return (<span onClick={() => handleClick(prop.row.original)}>{prop.getValue()}</span>)
        }
      },
      {
        id: '# of deployments',
        accessorFn: data => data?.deployments_aggregate?.aggregate.count,
        header: () => "Number of deployments",
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
                  style={{ width: '24px', height: '24px' }} 
                  onClick={() => handleEditBtn(prop.row.original)}
                />                    
              </button>
              {/* <Link to='/details/deployments' state={prop.row.original}>
                <ForwardIcon style={{ width: '24px', height: '24px', color: 'green' }} />
              </Link> */}
            </div>)
        },
        // footer: props => props.column.id
      },          
        
    ], [] );

  const handleSubmit = async() => {
    setProcessing(true);
    const inserting = toast.loading("Please wait... " +  <Spinner size='sm' />);

    const values = [];
    for(const item of importData){

      // make sure the file is uploaded to the current project dashboard
      if(item.project_code !== project_code) {
        setImportData([]); // Clear importData on error
        setProcessing(false);
        return toast.error("File contains invalid project code!", {id: inserting})
      }
      
      values.push({
        subproject_name: item.subproject_name,
        description: item.description,
        project_id: projectId,
      })
    }

    try{
      await upsertSubprojects({
        variables: {values}
      })
      toast.success('Successfully inserted datasets', {id: inserting})

    }catch(error){
      console.error(error.message);
      toast.error('Unable to insert datasets!', {id: inserting})
    }
    setImportData([]);
    setProcessing(false);
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
    <>
    <div className='mb-3' style={{display: 'flex', gap: '1rem'}}>
      {data?.subprojects.length === 0 &&
        <Button variant="primary" onClick={handleShow}
          style={{display: 'flex', gap: '0.25rem', alignItems: 'center'}}
        >
          <PlusCircleIcon style={{height: '20px'}}/> <span>New Subproject</span>
        </Button>
      }
      {data?.subprojects.length > 0 &&
        <ExportToCSV 
          csvData={data.subprojects.map( s => ({
            id: s.id,
            subproject_name: s?.subproject_name,
            description: s?.description,
            num_of_deployments: s?.deployments_aggregate?.aggregate?.count
          }))} 
          fileName='subprojects' 
        />
      }
      <ExportToCSV 
        csvData={subprojectCSVTemplate} 
        fileName={'subprojects_template'} label='Download CSV Template'
      /> 
      <div style={{display: 'flex', flexWrap: 'nowrap'}}>
        <ImportToCSV setImportData={setImportData} />
        {importData.length > 0 &&
          <Button onClick={handleSubmit} variant='link' size='sm' disabled={processing || updating}>
            {processing || updating ? <Spinner size='sm' /> : "Submit imported data"}
          </Button> 
        }
      </div>              
    </div>
    {data?.subprojects?.length > 0 &&
    <TableWrapper 
      data={data?.subprojects} 
      columns={columns} 
      page={handleShow} 
      insertBtnType="modal" 
    />
    }

    {show &&
    <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Subproject</Modal.Title>
      </Modal.Header>
      <Modal.Body> <NewSubproject handleClose={handleClose}/> </Modal.Body>        
    </Modal>
    }

    {showView &&
    <ViewDeployments 
      show={showView} 
      setShow={setShowView} 
      rowData={rowData}
    />
    }

    {showEdit &&
    <Modal show={showEdit} onHide={handleCloseEdit} backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{rowData?.subproject_name}</Modal.Title>
      </Modal.Header>
      <Modal.Body> 
        {rowData && <EditSubproject rowData={rowData} handleCloseEdit={handleCloseEdit} />} 
      </Modal.Body>        
    </Modal>
    }
    </>
  )
}

export default Subproject