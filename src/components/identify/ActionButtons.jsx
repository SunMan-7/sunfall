/*
This component displays the highlight and delete action buttons used to highlight 
or delete an image displayed on the modal window.
*/
import { StarIcon as StarIconSolid, } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/solid';

function ActionButtons({ image, onHighlight, onDelete, }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <div >
        <div onClick={onHighlight} style={{ cursor: 'pointer', textAlign: 'center' }}>
          {image?.isHighlighted ? (
            <StarIconSolid 
              style={{ width: '25px', color: 'green', }} 
            />
          ) : (
            <StarIconOutline style={{ width: '25px', color: 'green'}} />
          )}
          <div style={{ marginLeft: '5px', color: 'green' }}>Highlight</div>
        </div>
        
      </div>

      {/* Download action */}
      {/* <div >
        <div onClick={onDownload} style={{ cursor: 'pointer', textAlign: 'center' }}>
          <CloudArrowDownIcon style={{ width: '25px', color: 'green'}} />
        </div>
        <div style={{ marginLeft: '5px', color: 'green' }}>Download</div>
      </div> */}

      {/* Delete Action */}
      <div >
        <div onClick={onDelete} style={{ cursor: 'pointer', textAlign: 'center' }}>
          <TrashIcon style={{ width: '25px', color: 'green' }} />
          <div style={{ marginLeft: '5px', color: 'green' }}>Delete</div>        
        </div>        
      </div>
    </div>
  );
}

export default ActionButtons;
