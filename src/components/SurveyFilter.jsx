import { Form, Col, Row, Button } from "react-bootstrap";
import Select from 'react-select';

const SurveyFilter = ({onSubmit, survey, setSurvey, isDisabled, isLoading, data}) => {
  return (
    <Form onSubmit={onSubmit}>
      <Row>
        <Form.Group className='mb-2' as={Col} md='3' xs>
          <Select
            value={survey}
            onChange={prop => setSurvey(prop)}             
            isDisabled={isDisabled}
            isLoading={isLoading}
            isClearable            
            options={data?.map(s => (
              {value: s.id, label: s.survey_name}
              ) )}           
            placeholder='Select survey name...'                    
            required
            size='sm'
            style={{fontSize: '10px'}}
          />
        </Form.Group>           
        
        <Col md='3' xs='12' >
          <Button type='submit'disabled={!survey}>Filter</Button>
        </Col>        
      </Row>
    </Form> 
  )
}

export default SurveyFilter