/*
This component parses data from a csv file and stores results(dataset) in an
array.
*/
import Papa from 'papaparse';
import { Button } from 'react-bootstrap';

function ImportToCSV({setImportData, label= 'Import CSV'}) {

  const handleFileChange = (event) => {    
    const file = event.target.files[0];    

    // convert CSV file to JSON format
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        setImportData(result.data);
      },
    });
  };

  const openFileInput = () => {
    // Trigger the click event of the file input
    document.getElementById('fileInput').click();
  };

  return (
    < >
    <Button 
      id="uploadButton" 
      variant='outline-success' 
      onClick={openFileInput} 
      size='sm'
    >
      {label}
    </Button>

      {/* Hidden file input */}
      <input
        id="fileInput"
        type="file"        
        onChange={handleFileChange}
        accept=".csv"
        style={{ display: 'none' }}
      />
    </>
  );
}

export default ImportToCSV;