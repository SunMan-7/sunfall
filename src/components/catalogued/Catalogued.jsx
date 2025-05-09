/*
This component displays image details after species are identified in each image. 
It also allows users to download the dataset by exporting to csv file.
*/
import { useState, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { processDataToCSV, getDateTime24Hr  } from '../../helpers';
import TableWrapper2 from '../TableWrapper2';
import ExportToCSV from '../csvOptions/ExportToCSV';
import ImportToCSV from '../csvOptions/ImportCSV';
import Spinner from '../Spinner';
import { useMutation, useLazyQuery } from '@apollo/client';
import { INSERT_IMAGE_SPECIES, UPDATE_IMAGES_MANY } from '../../api/identifyGql';
import { GET_UNIDENTIFIED_IMAGES_COMPARE } from '../../api/cataloguedGql';
import { toast } from 'react-hot-toast';
import { EyeIcon } from '@heroicons/react/24/outline';
import ViewMore from './ViewMore';
import { imagesCSVTemplate } from '../../helpers';

// Error messages
function errorMessage(count, imageNameMismatch, identifiedImages, projectCodeMismatch, deploymentNameMismatch){
  let message = `Errors found in ${count} row(s)\n\n`;

  if (imageNameMismatch) {
      message += `${imageNameMismatch} row(s) contains image name mismatch/not found\n`;
  }
  if (identifiedImages) {
      message += `${identifiedImages} row(s) is already catalogued.\n`;
  }
  if (projectCodeMismatch) {
      message += `${projectCodeMismatch} row(s) contains incorrect project code\n`;
  }
  if (deploymentNameMismatch) {
      message += `${deploymentNameMismatch} row(s) contains camera check name mismatch.\n`;
  }
  return message;  
}

const Catalogued = ({data, nhost}) => {
  const project = JSON.parse(localStorage.getItem('project')); 
  const [importData, setImportData] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [showView, setShowView] = useState(false); // opens or closes modal
  const [rowData, setRowData] = useState(); // store row data where users clicked
  
  const [updateImagesMany, {loading: updatingImages}] = useMutation(UPDATE_IMAGES_MANY);
  const [insertImageSpecies, {loading: insertingImageSpecies}] = useMutation(INSERT_IMAGE_SPECIES);
  const [getUndentifiedImages] = useLazyQuery(GET_UNIDENTIFIED_IMAGES_COMPARE, {
    variables: {projectId: project?.id}
  })

  const columns = useMemo(
    () =>  [        
      {
        header: "Camera Checks",
        columns: [
          {
            id: 'subprojectName',
            accessorFn: (data) => data?.deployment?.subproject?.subproject_name,
            header: () => "Subproject name",            
          },
          {
            id: 'locationName',
            accessorFn: (data) => data?.deployment?.location?.location_name,
            header: () => "Location name",            
          },
          {
            id: 'cameraName',
            accessorFn: (data) => data?.deployment?.camera?.camera_name,
            header: () => "Camera name",            
          },
          {
            id: 'cameraCheckName',
            accessorFn: (data) => data?.deployment?.deployment_name,
            header: () => "Check name",            
          },              
          {
            id: 'startDate',
            accessorFn: (data) => data?.deployment?.start_date,
            header: () => "Start date",
            cell: info => getDateTime24Hr(info.getValue()),
          }, 
          {
            id: 'placement',
            accessorFn: (data) => data?.deployment?.camera_placement,
            header: () => "Camera placement",
            
          },
          {
            id: 'checkNumber',
            accessorFn: (data) => data?.deployment?.check_number,
            header: () => "Check #",                
          },
        ]
      },           
      {
        header: "Image Details",
        columns: [
          {
            accessorKey: "file_name",
            header: () => "Image name",            
          },
          {
            accessorKey: "date_taken",
            header: () => "Date taken",
            cell: info => getDateTime24Hr(info.getValue()),
          }, 
          {
            accessorKey: "species_count",
            header: () => "# of species",
          }, 
          {
            id: 'individualCount',
            accessorFn: (data) => data?.image_species_aggregate.aggregate.sum.individual_count,
            header: () => "# of individuals",
          }, 
        ]
      },
      {                
        header: "Actions",
        cell: (prop) => {
          return (
            <div style={{
              display: 'flex', gap: '7%', color: 'green', 
              justifyContent: 'center'}}
            >
              <button>
                <EyeIcon 
                  style={{ width: '20px', height: '20px' }}
                  onClick={() => {
                    setRowData(prop.row.original);
                    setShowView(true);
                  }}
                />
              </button>
            </div>
          )
        },
      },     
    ], []    
    )  

  // This function is called when the user is importing a csv file with data that identifies 
  // images in bulk.
  const handleSubmit = async() => {
    setProcessing(true);
    const processingData = toast.loading(`Please wait...`); 

    const {data: imageList, error } = await getUndentifiedImages();
    if (error) toast.error("Unable to find unidentified images in the database");

    const idValues = []; // store values that will be inserted in images_species table
    const updateValues = []; // store values that will be updated in images table; added semicolon
    let count = 0; // keeps track of the number of images not inserted

   // Initialize counters (The number of rows containing errors)
    let image_name_mismatch = 0;
    let image_identified = 0;
    let project_code_mismatch = 0;
    let deployment_name_mismatch = 0;

    for (const item of importData) { 
      // const image = data.find(image => 
      //   image.file_name === item?.image_name?.trim() && (!image.is_identified && 
      //     (image.project.project_code === item?.project_code?.trim() && image.deployment.deployment_name === item?.camera_check_name?.trim()))
      // );
      let imageNameFound = false; // false means item name was not found
      let projectCodeMatched = false; // false means there is a project code mismatch
      let deploymentNameMatched = false; // false means there is a deployment name mismatch
      // let identified = false; // false means the item is not yet identified/catalogued.
      let image = undefined;

      for (const img of imageList?.images) {
        const isImageNameMatch = img.file_name === item?.image_name?.trim();
        const isProjectCodeMatch = img.project.project_code === item?.project_code?.trim();
        const isDeploymentNameMatch = img.deployment.deployment_name === item?.camera_check_name?.trim();
        // const isIdentified = img.is_identified;
      
        // These conditions tracks if the item metadata is found or if the item is already catalogued.
        if (isImageNameMatch) imageNameFound = true; // item image name is found
        if (isProjectCodeMatch) projectCodeMatched= true; // item project code is correct
        if (isDeploymentNameMatch) deploymentNameMatched = true; // item deployment name(camera check name) matches
        // if (isIdentified) identified = true; // item is already catalogued

        if (isImageNameMatch && isProjectCodeMatch && isDeploymentNameMatch) {
          // store the found image that has correct image name, project code and deployment name and is not identified
          image = img; 
          break; // Break out of the loop if all conditions are met
        }
      } // end of inner for loop;

      // if image is undefined, number of specific errors per row will be need to be tracked
      if (!image) {
        count++;
        // the item name is not found in array data
        if (imageNameFound === false) {
          image_name_mismatch++; 
        }

        // the item/row is already catalogued
        // if (identified) {
        //   image_identified++;
        // }

        // The item/row project code is incorrect
        if (!projectCodeMatched) {
          project_code_mismatch++;
        }
        if (!deploymentNameMatched) {
          deployment_name_mismatch++;
          // console.log('depMatch', item?.camera_check_name, isDeploymentNameMatch)
        }
        continue; // skip iteration and go to the next item
      }

      let is_profiled = false;

      // This is not only finding if image_file_id and species_id exist, but both properties cannot be duplicates.
      // There can be duplicates of image_file_id but different species_id or vice versa.
      const existingIndex = idValues.findIndex(el => el.image_file_id === image?.file_id && el.species_id === item.species_id);
      
      // If the image_file_id & species_id property doesn't exist in the idValues, create a new object
      if (existingIndex === -1) { 

        // If age, sex, animal side, individual id data exist in the importData array, then
        // image_individuals.data property will also be created, otherwise, empty object will be created
        const individualData = item?.age || item?.sex || item?.animal_side || item?.individual_id 
          ? {image_individuals: {
            data: [{age: item?.age, sex: item?.sex, side: item?.animal_side ?? null, individual_id: item?.individual_id ?? null}]
            }} 
          : {};
        
        idValues.push({
          image_file_id: image?.file_id, 
          species_id: item.species_id, 
          individual_count: item.individual_count,
          ...individualData
        });        
        // Check if individualData has any keys to determine if it's "empty", false = "empty"
        is_profiled = Object.keys(individualData).length > 0;
      } else {  // If the image_file_id/image_name already exists, update the image_individuals property 

        // Check if there is a image_individuals.data property, the results should be an array.
        const temp = idValues[existingIndex].image_individuals?.data;

        // If age, sex, animal side, individual id data exist in the importData array, then
        // image_individuals.data property will be created or updated
        if (item?.age || item?.sex || item?.animal_side || item?.individual_id) { 
          // If the image_individuals.data property already has array of data in 
          // idValues array, then update with new data 
          if (temp?.length > 0) { 
            idValues[existingIndex].image_individuals?.data.push({
              age: item?.age, 
              sex: item?.sex, 
              side: item?.animal_side ?? null, 
              individual_id: item?.individual_id ?? null
            });
            
          } else { 
            // If the required image_individuals.data property does not exist in idValues array,
            // then simply create a new property image_individuals.data at existing index of idValues array
            idValues[existingIndex].push({
              image_individuals: {
                data: [{age: item.age, sex: item.sex, side: item?.animal_side ?? null, individual_id: item?.individual_id ?? null}]
              }
            })
          }
          is_profiled = true; // individuals in image are profiled.           
        } // end of inner if 
      }
      
      updateValues.push({
        where: {file_id: {_eq: image.file_id}}, 
        _set: {
          date_taken: item?.date_taken ? new Date(item.date_taken) : null, 
          identified_by: item?.identified_by ?? null, 
          is_highlighted: item?.is_highlighted ?? false, 
          is_identified: true, 
          is_profiled, 
          remarks: item?.remarks ?? null, 
          species_count: item?.species_count ?? 0
        }
      });
    } // End of for loop

    try{
      if(idValues.length !== 0 && updateValues.length !== 0){
        // Inserting into image_species & image_individuals tables
        await insertImageSpecies({
          variables: {
            imageSpecies: idValues
          }
        })

        // Updating images table
        await updateImagesMany({
          variables: {
            values: updateValues
          }
        })
        toast.dismiss(processingData);
        if(count === 0){
          toast.success('Successfully inserted all row(s) from CSV file');
        }else{
          toast.success(`Successfully inserted ${importData.length - count} row(s) from CSV file`);
        }
      }      
    }catch(error){
      toast.dismiss(processingData); // closes the toast
      console.error(error.message); 
      toast.error('Unable to insert datasets.')
    }

    if(count !== 0){
      alert(errorMessage(count, image_name_mismatch, image_identified, project_code_mismatch, deployment_name_mismatch))
    }
    toast.dismiss(processingData); // closes the toast
    setImportData([]); // Empty out the data uploaded from CSV
    setProcessing(false);
  };

  const memoizedCSVData = useMemo(() => {
    // Check if data is available and not empty
    if (!data || data.length === 0) {
      return []; // Return an empty array or some other default value
    }
  
    // Process the data if it's available
    return processDataToCSV(data);
  }, [data]);

  // useEffect is used for side effects, like setting state
  // useEffect(() => {   
  //   if (data?.length) {
  //     // Set the identified images
  //     setIdentifiedImages(data.filter(image => image.is_identified));

  //     // Update the CSV data state
  //     setCsvData(memoizedCSVData);
  //   }    
  // }, [data, memoizedCSVData]); // Depend on data and memoizedCSVData

  return (
    <>
    <div className='mb-3' style={{display: 'flex', gap: '1rem'}}>
      {data?.length > 0 && <ExportToCSV csvData={memoizedCSVData} fileName={project?.short_name} /> }
      {data?.length > 0 && <ExportToCSV csvData={imagesCSVTemplate} fileName={'images_template'} label='Download CSV Template'/> }
      <div style={{display: 'flex', flexWrap: 'nowrap'}}>
        <ImportToCSV setImportData={setImportData} />
        {importData.length > 0 &&
          <Button 
            onClick={handleSubmit} 
            variant='link' size='sm' 
            disabled={processing || (insertingImageSpecies | updatingImages)}>
            {processing || (insertingImageSpecies || updatingImages) ? <Spinner size='sm' /> : "Submit imported data"}
          </Button> 
        }
      </div>
    </div>

    {data?.length
    ? <TableWrapper2 data={data} columns={columns} fontSize='10px' />      
    : 'No data! Upload catalogued data or identify images in the ID Species tab.'
    }
    
    {showView &&
    <ViewMore data={rowData} show={showView} setShow={setShowView} nhost={nhost} />
    }
    </>    
  )
}

export default Catalogued