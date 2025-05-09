import Modal from 'react-bootstrap/Modal';

const ViewImageModal = (props) => {
  const {showView, hideView, hasSelected, 
    images, currentIndex, editBulkDate, 
    customSliderSelected, customSliderAll, metadata} = props
  return (
    <>
    <Modal show={showView} onHide={hideView} centered size='xl' >
        <Modal.Header closeButton>
          <Modal.Title>          
            {hasSelected 
              ? `${currentIndex + 1} / ${images.filter(i => i.isSelected).length} `
              : `${currentIndex + 1}/ ${images.length}`}
             
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{display: 'flex'}}> 
        {hasSelected
        ?           
          <div style={{width: '100%', position: 'relative'}}>
          <div style={{position: 'absolute', right: 0, zIndex: 1070}}>
            {editBulkDate}
            

          </div>
            {customSliderSelected}        
          </div>
        :
        <>
        <div style={{width: '100%', position: 'relative'}}>
          <div style={{position: 'absolute', right: 0, zIndex: 1070}}>
            {metadata}
          </div>
            {customSliderAll}         
        </div>            
            </>       

        }         
        </Modal.Body>        
    </Modal>
    </>
    
  )
}

export default ViewImageModal