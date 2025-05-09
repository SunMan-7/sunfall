/*
This component allows users to view a list of camera checks in table format. Users can 
also export the data in csv format, download the template that can be used to upload 
camera checks in batch. 
*/
import { useState, useMemo, useEffect } from 'react';
import { Button, Modal, } from 'react-bootstrap';
import NewDeployment from './NewDeployment';
import TableWrapper2 from '../../TableWrapper2';
import { dateTimePickerSpan, getDateTime24Hr } from '../../../helpers';
import { PencilSquareIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import Spinner from '../../Spinner';
import { useQuery, useMutation } from '@apollo/client';
import { GET_DEPLOYMENTS_BY_PROID, INSERT_DEPLOYMENTS_MANY } from '../../../api/deploymentGql';
import { GET_CAMERA_NAMES,} from "../../../api/cameraGql";
import { GET_LOCATIONS, GET_PROJECT_LOCATIONS } from '../../../api/locationGql';
import { GET_SUBPROJECTS } from '../../../api/subprojectGql';
// import { GET_DEPLOYMENT_CAMERA_NAMES } from "../../../api/uploadGql";
import EditDeployment from './EditDeployment';
import { toast } from 'react-hot-toast';
import ExportToCSV from '../../csvOptions/ExportToCSV';
import ImportToCSV from '../../csvOptions/ImportCSV';

const cameraCheckTemplate = [{
  project_code: null,
  camera_check_name: null, 
  start_date: null, end_date: null,
  failure_type: null, 
  location_name: null,
  camera_name: null, subproject_name: null, 
  check_number: null, camera_placement: null, 
  setup_person: null,  pickup_person: null, 
  remarks: null,   
}]

const Deployment = () => {
  const [show, setShow] = useState(false);
  const {id: projectId, project_code } = JSON.parse(localStorage.getItem('project'));
  const {id: organizationId} = JSON.parse(localStorage.getItem('organization'));
  const [showEdit, setShowEdit] = useState(false);
  const [rowData, setRowData] = useState();
  const [csvData, setCsvData] = useState([]);
  const [importData, setImportData] = useState([]);
  const [processing, setProcessing] = useState(false);
  
  // Queries to be used to fetch, add or update data.
  // const {loading: loadingCameras, data: cameraNames} = useQuery(GET_CAMERA_NAMES);
  const {loading, error, data } = useQuery(GET_DEPLOYMENTS_BY_PROID, {
    variables: {projectId},
    skip: !projectId
  });
  const {data: locationData} = useQuery(GET_PROJECT_LOCATIONS, {
    variables: {projectId},
    skip: !projectId
  });
  const {data: cameraData} = useQuery(GET_CAMERA_NAMES, {
    variables: {organizationId},
    skip: !organizationId
  });
  const {data: subprojectData} = useQuery(GET_SUBPROJECTS, {
    variables: {projectId},
    skip: !projectId
  });
  const [InsertDeployments, {loading: insertingDeployments}] = useMutation(INSERT_DEPLOYMENTS_MANY, {
    refetchQueries: [GET_DEPLOYMENTS_BY_PROID]
  });

  // console.log('getch', locations);
  const handleClose = () => setShow(false); // Close form to add new camera details
  const handleShow = () => setShow(true); // Opens form to add new camera details
  const handleCloseEdit = () => setShowEdit(false); // Close the form where user can edit details
  
  // Defines the table headers and customizes cell values
  const columns = useMemo(
    () =>  [  
      {
        accessorKey: "id",
        header: () => "Check ID",
      },
      {
        accessorKey: "deployment_name",
        header: () => "Camera check name",
      },
      {
        accessorKey: "start_date",
        header: () => "Start date",
        cell: info => dateTimePickerSpan(info.getValue())
      },
      {
        accessorKey: "end_date",
        header: () => "End date", 
        cell: info => dateTimePickerSpan(info.getValue())           
      },
      {
        accessorFn: row => row.location.location_name,
        header: 'Location name',
        // cell: info => info.getValue(),
      },
      {
        accessorKey: "check_number",
        header: () => "Check #",
      },
      {
        accessorKey: "camera_placement",
        header: () => "Placement",
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
              {/* <button>
                <CameraIcon 
                  style={{ width: '24px', height: '24px' }}
                  onClick={() => handleCameraBtn(prop.row.original)}
                />+
              </button> */}
            </div>)
        },
        // footer: props => props.column.id
      },        
    ], 
    []    
  )

  // Store row data and open modal when users click the edit icon button
  const handleEditBtn = (prop) => {
    setRowData(prop); // Store the row data
    setShowEdit(true); // Modal will be displayed
  }
  

  const handleSubmit = async () => {    
    setProcessing(true);
    const values = [];
    try {
      for (const d of importData) {
        // Make sure camera checks are placed in correct project.
        if(project_code !== d?.project_code){
          // Check this in case empty lines are still parsed even though it was 
          // supposed to skip them (issue: papa parse library or format of csv file).
          if(!d?.camera_check_name || !d?.location_name){  
            continue; // skip and go to the next line
          }else {
            throw new Error("Data contains incorrect project_code!");
          }
        }
        const location = locationData?.locations?.find(l => l?.location_name === d?.location_name);
        const camera = cameraData?.cameras.find(c => c?.camera_name === d?.camera_name);
        const subproject = subprojectData?.subprojects?.find(s => s?.subproject_name === d?.subproject_name);
        values.push({
          deployment_name: d?.camera_check_name,
          start_date: new Date(d?.start_date),
          end_date: d?.end_date ? new Date(d.end_date) : null,
          location_id: location?.id, camera_id: camera?.id, 
          subproject_id: subproject?.id ?? null,
          check_number: d?.check_number,
          camera_placement: d?.camera_placement ?? null,
          setup_person: d?.setup_person ?? null,
          pickup_person: d?.pickup_person ?? null,
          failure_type: d?.failure_type,
          remarks: d?.remarks,
          project_id: projectId,
        })
      }
      await InsertDeployments({
        variables: {values }
      })
      toast.success('Successfully inserted datasets!')
    }catch(error){
      console.error(error.message);
      toast.error(error.message)
    }
    setImportData([]);
    setProcessing(false);    
  }

  useEffect(() => {    
    // Check if data and locations are available  
    if(data?.deployments){
      const tempCsvData = [];

      // Loop through each deployments(camera checks) in the data
      for(const l of data?.deployments){
        // Push relevant data to the CSV data array
        tempCsvData.push({
          project_code,
          deployment_name: l.deployment_name, 
          start_date: getDateTime24Hr(l.start_date), end_date: l?.end_date ? getDateTime24Hr(l.end_date) : null,
          failure_type: l.failure_type,  
          location_name: l.location.location_name,
          camera_name: l.camera.camera_name, 
          subproject_name: l.subproject?.subproject_name, 
          check_number: l.check_number, camera_placement: l.camera_placement, 
          setup_person: l.setup_person,  pickup_person: l.pickup_person, 
          remarks: l.remarks, 
        });         
      }
      setCsvData(tempCsvData)     }      
  }, [data, project_code]);

  // Show spinner animation if data is currently loading
  if(loading){
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Spinner/>
      </div>
    )
  }
  
  // Show error message if there is an error fetching data.
  if(error) {
    console.log(error)
    return <div>Something went wrong! Try refreshing the page</div>
  }

  return (
    <>
    <div className='mb-3' style={{display: 'flex', gap: '1rem'}}>
      {data?.deployments?.length === 0 &&
        // <Button variant="primary" onClick={handleShow} size='sm'> Add New Location </Button>
        <Button variant="primary" onClick={handleShow} size='sm'
          style={{display: 'flex', gap: '0.25rem', alignItems: 'center'}}
        >
          <PlusCircleIcon style={{height: '20px'}}/> <span>New Camera Check</span>
        </Button>
      }
      {data?.deployments?.length > 0 &&
        <ExportToCSV csvData={csvData} fileName='camera_checks' />
      }
      <ExportToCSV csvData={cameraCheckTemplate} fileName={'cameraCheck_template'} label='Download CSV Template'/> 
      <div style={{display: 'flex', flexWrap: 'nowrap'}}>
        <ImportToCSV setImportData={setImportData} />
        {importData.length > 0 &&
          <Button onClick={handleSubmit} variant='link' size='sm' disabled={processing}>
            {processing || insertingDeployments ? <Spinner size='sm' /> : "Submit imported data"}
          </Button> 
        }
      </div>              
    </div>
    {data?.deployments?.length > 0 &&
    <TableWrapper2 
      data={data?.deployments} 
      columns={columns} 
      page={handleShow} 
      insertBtnType="modal" 
    />
    }
    <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>New Camera Check</Modal.Title>
      </Modal.Header>
      <Modal.Body> 
        {show && 
        <NewDeployment 
          handleClose={handleClose}
          locationData={locationData}
          cameraData={cameraData} 
          subprojectData={subprojectData}
        />
        } 
      </Modal.Body>        
    </Modal>

    <Modal show={showEdit} onHide={handleCloseEdit} backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Camera Check </Modal.Title>
      </Modal.Header>
      <Modal.Body> 
        {showEdit && 
        <EditDeployment 
          data={rowData} 
          handleClose={handleCloseEdit}
          locationData={locationData}
          cameraData={cameraData} 
          subprojectData={subprojectData}
        />
        }
      </Modal.Body>      
    </Modal>
   
    </>
  )
}

export default Deployment