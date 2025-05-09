import { Spinner } from 'react-bootstrap';
import { Card, Row, Col, OverlayTrigger,} from 'react-bootstrap';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

const CustomCard = ({subtitle, loading, count, popover}) => {
  return (
    <Card className="shadow" style={{width: '15rem'}}>
      <Card.Body as={Row} >
        <Col sm={9}>
          <Card.Title>
            {loading && <Spinner size='sm'/>}
            {count}
          </Card.Title>
          <div>
          <Card.Subtitle className="text-muted">
            {subtitle}
          </Card.Subtitle>
          </div>
        </Col>
        <Col sm={3} style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
          <OverlayTrigger trigger="click" placement="top" overlay={popover} rootClose="true">
            <InformationCircleIcon style={{width: '20px', cursor: 'pointer', color: 'green'}} />
          </OverlayTrigger>
        </Col>
      </Card.Body>
    </Card>
  )
}

export default CustomCard