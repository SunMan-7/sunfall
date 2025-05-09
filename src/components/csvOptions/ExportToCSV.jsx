/*
This component unparses data and prepares it into a downloadable csv format. 
*/
import React from 'react';
import Papa from 'papaparse';
import { Button } from 'react-bootstrap';

const ExportToCSV = ({csvData, fileName, label='Export CSV'}) => {

  const convertAndDownloadCSV = () => {
    const csv = Papa.unparse(csvData);
  
    // Create a Blob object representing the data as a CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
    // Create a download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', fileName);
  
    // Append the link to the body
    document.body.appendChild(link);
  
    // Trigger the click event to start the download
    link.click();
  
    // Remove the link from the DOM
    document.body.removeChild(link);
  };

  return (
    <Button 
      variant='outline-success' 
      onClick={convertAndDownloadCSV} 
      size='sm'
    >
      {label}
    </Button>
  )
}

export default ExportToCSV