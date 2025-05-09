/*
Can add one row of camera details by clicking the insert button on the table or
add multiple rows of camera details by importing a csv file using the template provided.
Users can also download the entire dataset as a CSV file. Users can edit individual rows.
*/
import { useState, useMemo, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import NewCamera from "../components/camera/NewCamera";
import TableWrapper from '../components/TableWrapper';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import Spinner from '../components/Spinner';
import { decorateStatus, getDateOnly, datePickerSpan } from '../helpers';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CAMERAS, INSERT_CAMERAS_MANY } from '../api/cameraGql';
import EditCamera from '../components/camera/EditCamera';
import ExportToCSV from '../components/csvOptions/ExportToCSV';
import ImportToCSV from '../components/csvOptions/ImportCSV';
import { toast } from 'react-hot-toast';

const csvTemplateData = [{
  camera_name: null, make: null,
  model: null, serial_number: null,
  purchase_date: null, 
  purchase_price: null,
  product_url: null, num_of_batteries: null, 
  status: null,remarks: null
}]

const CameraPage = () => {
  const { id } = JSON.parse(localStorage.getItem('organization'));
  const [show, setShow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [rowData, setRowData] = useState();
  const [csvData, setCsvData] = useState([]);
  const [importData, setImportData] = useState([]);
  const [processing, setProcessing] = useState(false);
  // console.log(importData);
 
  const {loading, error, data } = useQuery(GET_CAMERAS, {
    variables: {organizationId: id},
  });
  const [insertCamerasMany,] = useMutation(INSERT_CAMERAS_MANY, {
    refetchQueries: [GET_CAMERAS]
  });
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleCloseEdit = () => setShowEdit(false);

  const handleEditBtn = (props) => {
    setRowData(props);
    setShowEdit(true)
  }

  const columns = useMemo(
    () =>  [      
      // {        
      //   header: " ",
      //   // colSpan: 3,
      //   // footer: props => props.column.id,
      //   columns: [
        {
          accessorKey: "id",
          header: () => "ID",
          // footer: props => props.column.id
        },
          {
            accessorKey: "camera_name",
            header: () => "Name",
            // footer: props => props.column.id
          },
          {
            accessorKey: "model",
            header: () => "Model",
            // footer: props => props.column.id
          },
          {
            accessorKey: "serial_number",
            header: () => "Serial number",
            
          },
          {
            accessorKey: "purchase_date",
            header: () => "Purchase date",
            cell: info => info?.getValue() ? datePickerSpan(info.getValue()) : null,
          },          
          
          {     
            accessorKey: "status",
            header: () => "Status", 
            cell: ({getValue}) => decorateStatus(getValue())          
          },  
          {                
            header: "Actions",
            cell: (prop) => {
              return (<div style={{
                                  display: 'flex', gap: '7%', color: 'green', 
                                  justifyContent: 'center'}}>
                  <button>
                    <PencilSquareIcon 
                      style={{ width: '24px', height: '24px' }} 
                      onClick={() => handleEditBtn(prop.row.original)}
                    />                    
                  </button>
                  {/* <button>
                    <EyeIcon 
                      style={{ width: '24px', height: '24px' }}
                      onClick={() => handleView(prop.row.original)}
                    />
                  </button> */}
                </div>)
            },
            // footer: props => props.column.id
          },          
        
        ],        
    //   },
      
    // ],
    []    
    )

    // This will upload data retrieved from a csv file to the "cameras" table.
    const handleSubmit = async() => {
      setProcessing(true)
      const values = [];      
      try {
        for(const c of importData){
          values.push({
            camera_name: c.camera_name.trim(), make: c.make,
            model: c?.model?.toString() ?? null, 
            serial_number: c?.serial_number?.toString() ?? null,
            purchase_date: c?.purchase_date ? new Date(c?.purchase_date) : null, 
            purchase_price: c.purchase_price,
            status: c.status, product_url: c.product_url,
            num_of_batteries: c.num_of_batteries, remarks: c.remarks
          })
        }
        await insertCamerasMany({
          variables: {values}
        })
        // console.log(data?.insert_cameras?.returning)
        toast.success("Successfully inserted datasets")
      }catch(error){
        console.error(error.message)
        toast.error('Unable to insert data!')

      }
      setImportData([]);
      setProcessing(false);
    }

    useEffect(()=> {
      setCsvData(data?.cameras?.map((c) => ({
        camera_id: c.id,
        camera_name: c.camera_name, make: c.make,
        model: c.model, serial_number: c.serial_number,
        purchase_date: c?.purchase_date ? getDateOnly(c?.purchase_date) : null, 
        purchase_price: c.purchase_price,
        product_url: c.product_url, num_of_batteries: c.num_of_batteries, 
        status: c.status, remarks: c.remarks
      })))
    }, [data])

  //display spinner to show that data is being processed
  if(loading){
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Spinner/>
      </div>
    )
  }

  //return error message to user
  if(error) {
    console.log(error)
    return <div>Something went wrong! Try refreshing the page</div>
  }    

  return (
    <div style={{paddingLeft: '1em'}}>

      <div className='mb-3' style={{display: 'flex', gap: '1rem'}}>
        {data?.cameras.length === 0 &&
          <Button variant="primary" onClick={handleShow} size='sm'> Add New Camera </Button>
        }
        {csvData?.length > 0 &&
          <ExportToCSV csvData={csvData} fileName='cameras' />
        }
        <ExportToCSV csvData={csvTemplateData} fileName={'cameras_template'} label='Download CSV Template'/>  
        <div style={{display: 'flex', flexWrap: 'nowrap'}}>
          <ImportToCSV setImportData={setImportData} />
          {importData.length > 0 &&
            <Button onClick={handleSubmit} variant='link' size='sm' disabled={processing}>
              {processing ? <Spinner size='sm' /> : "Submit imported data"}
            </Button> 
          }
        </div>              
      </div>

      {data?.cameras.length > 0 &&
      <TableWrapper 
        data={data?.cameras} 
        columns={columns} 
        page={handleShow} 
        insertBtnType="modal" 
      /> 
      }
   
      <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Camera</Modal.Title>
        </Modal.Header>
        <Modal.Body> {show && <NewCamera handleClose={handleClose}/>} </Modal.Body>        
      </Modal>
      
      <Modal show={showEdit} onHide={handleCloseEdit} backdrop='static' keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Camera details</Modal.Title>
        </Modal.Header>
        <Modal.Body> 
          {showEdit && <EditCamera data={rowData} handleClose={handleCloseEdit}/>} 
        </Modal.Body>        
      </Modal>
    </div>
  )
}

export default CameraPage