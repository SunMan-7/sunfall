import Papa from 'papaparse';

function CSVParser({setCsvData, label=''}) {

  const handleFileUpload = (event) => {    
    const file = event.target.files[0];    

    // convert CSV file to JSON format
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCsvData(result.data);
      },
    });
  };

  return (
    < >
      <label htmlFor="fileInput"
        style={{display: 'flex', flexDirection: 'column'}}
      >
        <p style={{marginBottom: "2px"}}>{label}</p>
        
        <input 
          id="fileInput"
          type="file" 
          onChange={handleFileUpload} 
          accept=".csv" 
        />
      </label>
    </>
  );
}

export default CSVParser;