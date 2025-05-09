/*
This component allows users to open a modal and view species and individual details identified
in an image. Users can click on the image name and view the image in a new tab
*/
import { Modal, Table } from 'react-bootstrap';

const ViewMore = (props) => {
  const {data, show, setShow, nhost} = props;
  const handleClose = () => setShow(false);
  return (
    <Modal show={show} onHide={handleClose} >
        <Modal.Header closeButton>
          <Modal.Title>Species & individuals</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{fontSize: '0.8rem'}}>
          <div style={{display: 'flex', gap: '1rem'}}>
            <div><strong>Total # of species:</strong> {data?.species_count},</div>
            <div><strong>Total # of individuals: </strong> 
              {data?.image_species_aggregate.aggregate.sum.individual_count}
            </div>
          </div>
          <div>
            <strong>Click image name to view: </strong>
            <a href={nhost.storage.getPublicUrl({fileId: data?.file_id})} target="_blank" rel="noopener noreferrer">
              {data?.file_name}
            </a>
          </div>
          <hr style={{marginTop: 0}}/>
          {data.image_species?.map(is => (
            <div key={is.id}>
            <div  style={{display: 'flex', gap: '1rem'}}>
              <div><strong>Identifier:</strong> {is.id},</div>
              <div><strong>Species:</strong> {is?.species?.common_name}</div>
            </div>
            {is?.image_individuals?.length > 0 &&
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Age</th>
                  <th>Sex</th>
                  <th>Side</th>
                  <th>Individual</th>
                </tr>
              </thead>
              <tbody>
              {is?.image_individuals?.map(ii => (
                <tr key={ii.id}>
                  <td>{ii?.id}</td>
                  <td>{ii?.age}</td>
                  <td>{ii?.sex}</td>
                  <td>{ii?.side}</td>
                  <td>{ii?.individual?.code_name}</td>
                </tr>
              ))}
              
              </tbody>
            </Table>
            }
            <hr />
            </div>
          ))}
          
        </Modal.Body>
        
      </Modal>
  )
}

export default ViewMore