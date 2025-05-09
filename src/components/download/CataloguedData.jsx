/*
This component allows users to download full catalogued data from the database. Catalogued data
are a list of species indentified in each individual images. The data will be downloaded as a
CSV file, which can be used for analysis purposes.
*/
import { useState } from 'react'
import DatePicker from "react-datepicker";
import { Form, Button} from 'react-bootstrap';
import { label, inputStyle, processAllCataloguedToCSV } from '../../helpers';
import { useLazyQuery } from '@apollo/client';
import {GET_CATALOGUED_DATA_COMPLETE} from '../../api/catalogued/ByDateGql';
import Spinner from '../Spinner';
import Papa from 'papaparse';

import "react-datepicker/dist/react-datepicker.css";

const convertAndDownloadCSV = (csvData) => {
  const csv = Papa.unparse(csvData);

  // Create a Blob object representing the data as a CSV file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  // Create a download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', 'catalogued-data');

  // Append the link to the body
  document.body.appendChild(link);

  // Trigger the click event to start the download
  link.click();

  // Remove the link from the DOM
  document.body.removeChild(link);
};

const CataloguedData = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [processing, setProcessing] = useState(false);

  const [getCatalogued, {loading, error}] = useLazyQuery(GET_CATALOGUED_DATA_COMPLETE,)

  const handleSubmit = async (e) =>{
    setProcessing(true);
    e.preventDefault();
    const { data } = await getCatalogued({variables: {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    }})
    console.log(data)
    const csvData = processAllCataloguedToCSV(data?.images);

    convertAndDownloadCSV(csvData);    
    setProcessing(false);
  }

  if(error){
    console.error('Error fetching data: ', error.message);
  }


  return (
    <>
    <h6>Download catalogued data from all projects by selecting date range</h6>
    <Form onSubmit={handleSubmit} 
      style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end'}}
    >      
      <Form.Group className="mb-3" >
        <div><Form.Label style={label}>From: </Form.Label></div>
        <div style={inputStyle}>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat='dd-MMM-yyyy'
            // selectsStart
            startDate={startDate}
            // endDate={endDate}
            maxDate={new Date()}
            customInput={<Form.Control />}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            isClearable
            required
          />
        </div>
      </Form.Group>
      <Form.Group className="mb-3" >
        <div><Form.Label style={label}>To: </Form.Label></div>
        <div style={inputStyle}>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat='dd-MMM-yyyy'
            // selectsEnd
            startDate={startDate}
            // endDate={endDate}
            // minDate={startDate}
            maxDate={new Date()}
            customInput={<Form.Control />}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            isClearable
            required
          />
        </div>
      </Form.Group>
      <Form.Group className="mb-3" >
        <div><Form.Label style={label}>Click button to generate CSV File: </Form.Label></div>
        <div style={inputStyle}>
          <Button type='submit' disabled={loading || processing}>
            {loading || processing ? <Spinner size='sm' /> : 'Generate'}
          </Button>
        </div>
      </Form.Group>
    </Form>
    
  </>
  )
}

export default CataloguedData