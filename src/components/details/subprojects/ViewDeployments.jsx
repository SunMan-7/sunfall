/*
This component displays the deployment details when users click on a subproject name
*/
import { useMemo, } from "react";
import { Modal } from "react-bootstrap";
import TableWrapper from "../../TableWrapper";
import { dateTimePickerSpan } from '../../../helpers';
import Spinner from '../../Spinner';
import { useQuery } from '@apollo/client';
import { GET_DEPLOYMENTS_BY_SUBPROJECT } from "../../../api/subprojectGql";


const ViewDeployments = ({show, setShow, rowData}) => { 
  // Fetch deployments by subproject id 
  const {loading, error, data } = useQuery(GET_DEPLOYMENTS_BY_SUBPROJECT,{
    variables: {subprojectId: rowData?.id},
    skip: !rowData?.id
  });

  const columns = useMemo(
    () =>  [ 
      {
        accessorKey: 'id',
        header: () => 'ID'
      }, 
      {
        accessorKey: "deployment_name",
        header: () => "Name",
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
    <>
    <Modal show={show} onHide={() => setShow(false)} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>{rowData?.subproject_name}</Modal.Title>
      </Modal.Header>
      <Modal.Body> 
      {data?.deployments?.length > 0 
        ? <TableWrapper 
            data={data.deployments} 
            columns={columns}                     
          />
        :  <h6> No Data</h6>
      } 
      </Modal.Body>        
    </Modal>
    </>
  )
}

export default ViewDeployments