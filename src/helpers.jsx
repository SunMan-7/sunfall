import {forwardRef, useRef} from "react";
import DatePicker from "react-datepicker";

// import "react-datepicker/dist/react-datepicker.css";

export const cameraStatus = [
  {value: 'Available', label: 'Available for use'}, 
  {value: 'Active', label: 'Active in field'}, 
  {value: 'Lost', label: 'Lost'}, 
  {value: 'Stolen', label: 'Stolen'}, 
  {value: 'Retired', label: 'Retired'}
];

export function datePickerSpan (date) {
  const Span = forwardRef(({ value }, ref) => (
    <span ref={ref}>{value}</span>
  ));                        
  return (                          
    <DatePicker       
      selected={date ? new Date(date) : ''}                            
      dateFormat='dd-MMM-yyyy'
      customInput={<Span />}
      readOnly
    />
  )
}

export function dateTimePickerSpan (date) {
  const Span = forwardRef(({ value }, ref) => (
    <span ref={ref}>{value}</span>
  ));                        
  return (                          
    <DatePicker       
      selected={date ? new Date(date) : ''}                            
      dateFormat='dd-MMM-yyyy hh:mm aa'
      customInput={<Span />}
      readOnly
    />
  )
}

export function datePickerYearSpan (date) {
  const Span = forwardRef(({ value }, ref) => (
    <span ref={ref}>{value}</span>
  ));                        
  return (                          
    <DatePicker       
      selected={date ? new Date(date) : ''}                            
      dateFormat='yyyy'
      customInput={<Span />}
      readOnly
    />
  )
}

const similarStyle ={
  borderRadius: '4px', 
  padding: '2px 8px',  
}

export function decorateStatus (status) {
  if (status === 'Active' ) {
    return (
      <span style={{backgroundColor: '#ccf6e4', color: '#00864e', ...similarStyle}}>
        {status}
      </span>
    )
  }else if(status === 'Available'){
    return (
      <span style={{backgroundColor: '#d5e5fa', color: '#1c4f93', ...similarStyle}}>
        {status}
      </span>
    )
  }else if(status === 'Processing'){
    return (
      <span style={{backgroundColor: '#FFBF00', color: '#1c4f93', ...similarStyle}}>
        {status}
      </span>
    )
  }else if(status === 'Suspended' || status === 'Lost' || status === 'Stolen'){
    return (
      <span style={{backgroundColor: '#fde6d8', color: '#9d5228', ...similarStyle}}>
        {status}
      </span>
    )
  } else if(status === 'Inactive' || status === 'Retired'){
    return (
      <span style={{backgroundColor: '#e3e6ea', color: '#7d899b', ...similarStyle}}>
        {status}
      </span>
    )
  }
  return <span>{status}</span>

}

// returns time in am/pm format
export const getTimeOnly = (timestamp) => {
  timestamp = new Date(timestamp);
  const hours = timestamp?.getHours();
  const minutes = timestamp?.getMinutes();
  const amOrPm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;

  return `${formattedHours}:${minutes} ${amOrPm}`  
}

//returns time in 24 hour format
export const get24HrTimeFormat = (timestamp) => {
  timestamp = new Date(timestamp);
  let hours = timestamp?.getHours();
  let minutes = timestamp?.getMinutes();
  let seconds = timestamp?.getSeconds();
  hours <=9 && (hours = `0${hours}`); // Add a leading zero for single-digit
  minutes <=9 && (minutes = `0${minutes}`); // Add a leading zero for single-digit
  seconds <=9 && (seconds = `0${seconds}`); // Add a leading zero for single-digit


  return `${hours}:${minutes}:${seconds}`
}

export const getDateOnly = (timestamp) => {
  timestamp = new Date(timestamp);
  const options = {day: '2-digit', month: 'short', year: 'numeric'};
  const formattedDate = timestamp.toLocaleDateString('en-US', options);
  return formattedDate;
}

// const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getCustomDateFormat = (date, separator='-') => {
  date = new Date(date);
  const year = date.getFullYear();
  let month = date.getMonth() + 1; // add 1 because counting starts from 0
  let day = date.getDate();  
  day <= 9 && (day = `0${day}`); // Add a leading zero for single-digit days.
  month <=9 && (month = `0${month}`); // Add a leading zero for single-digit months.
  
  return `${year}${separator}${month}${separator}${day}`;
}

export const getDateTime24Hr = (date, separator='-') => {
  date = new Date(date);
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();  
  day <= 9 && (day = `0${day}`); // Add a leading zero for single-digit days.
  month <=9 && (month = `0${month}`); // Add a leading zero for single-digit months.
  const time = get24HrTimeFormat(date?.getTime());
  
  return `${year}${separator}${month}${separator}${day} ${time}`;
}

export function daysBetweenDates(date1, date2) {
  const oneDay = 86400000; // Number of milliseconds in a day (24 * 60 * 60 * 1000)
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);

  // Calculate the difference in days
  const diffInDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
  return diffInDays;
}

export const animalHeadersCSV = [
  {label: 'Review id', key: 'review_id'},  
  {label: 'Survey', key: 'survey_name'},
  {label: 'Site', key: 'site'},
  {label: 'Deployment name', key: 'deployment_name'},
  {label: 'Start date', key: 'start_date'},
  {label: 'End date', key: 'end_date'},
  {label: 'Station', key: 'location_name'},
  {label: 'Latitude', key: 'latitude'},
  {label: 'Longitude', key: 'longitude'},
  {label: 'Camera name', key: 'camera_name'},
  {label: 'Position', key: 'camera_position'},
  {label: 'Trap days', key: 'trap_days'},
  {label: '1st image date', key: 'first_image_date'},
  {label: '1st image time', key: 'first_image_time'},
  {label: 'Last image time', key: 'last_image_time'},
  {label: 'Species', key: 'species'},
  {label: 'Animal count', key: 'animal_count'},
  {label: '# of photos', key: 'num_of_photos'},
  {label: '# of adults', key: 'num_of_adults'},
  {label: '# of juveniles', key: 'num_of_juveniles'},
  {label: '# of males', key: 'num_of_males'},
  {label: '# of females', key: 'num_of_females'},
  {label: 'Side', key: 'animal_side'},

]

export function formatAnimalDataCSV(data){
  return data?.map(a => ({
    review_id: a?.review?.id,
    survey_name: a?.review?.image_reviews[0]?.image?.deployment_camera?.deployment?.survey?.survey_name,
    site: a?.review?.image_reviews[0]?.image?.deployment_camera?.deployment?.location?.site?.short_name,
    deployment_name: a?.review?.image_reviews[0]?.image?.deployment_camera?.deployment?.deployment_name,
    start_date: getDateOnly(a?.review?.image_reviews[0]?.image?.deployment_camera?.deployment?.start_date),
    end_date: getDateOnly(a?.review?.image_reviews[0]?.image?.deployment_camera?.deployment?.end_date),
    location_name: a?.review?.image_reviews[0]?.image?.deployment_camera?.deployment?.location?.location_name,
    latitude: a?.review?.image_reviews[0]?.image?.deployment_camera?.deployment?.location?.latitude,
    longitude: a?.review?.image_reviews[0]?.image?.deployment_camera?.deployment?.location?.longitude,
    camera_name: a?.review?.image_reviews[0]?.image?.deployment_camera?.camera?.camera_name,
    camera_position: a?.review?.image_reviews[0]?.image?.deployment_camera?.position,
    trap_days: a?.review?.image_reviews[0]?.image?.deployment_camera?.trap_days,
    first_image_date: getDateOnly(a?.review?.first_event_date),
    first_image_time: getTimeOnly(a?.review?.first_event_date),
    last_image_time: getTimeOnly(a?.review?.image_reviews[0]?.image?.date_taken),
    species: a?.species?.common_name,
    animal_count: a?.animal_count,
    num_of_photos: a?.review?.num_of_photos,
    num_of_adults: a?.num_of_adults,
    num_of_juveniles: a?.num_of_juveniles,
    num_of_males: a?.num_of_males,
    num_of_females: a?.num_of_females,
    animal_side: a?.animal_side,
  }))
}

// Processing csv headers and rows for catalouged data
export const processDataToCSV = (data) => {
  const toCSV = [];
  for (const i of data) {
    if (!i.is_identified) continue; // if species in images is not identified, go to the next iteration

    for (const is of i?.image_species) {
      const commonFields = {
        project_code: i.project.project_code,
        subproject_name: i.deployment.subproject?.subproject_name,
        location_name: i.deployment.location.location_name,
        x: i.deployment.location.x,
        y: i.deployment.location.y,
        camera_name: i.deployment.camera.camera_name,
        camera_placement: i.deployment.camera_placement,
        check_number: i.deployment.check_number,
        camera_check_name: i.deployment.deployment_name,
        start_date: getDateTime24Hr(i.deployment?.start_date),
        end_date: getDateTime24Hr(i.deployment?.end_date),
        image_name: i.file_name,
        date_taken: getDateTime24Hr(i.date_taken),
        is_highlighted: i.is_highlighted,
        identified_by: i.identified_by,
        species_count: i.species_count,
        species_id: is.species_id,
        common_name: is.species?.common_name,
        individual_count: is.individual_count,        
      };

      if (i.is_profiled) {
        for (const ii of is?.image_individuals) {
          toCSV.push({
            ...commonFields,
            age: ii?.age,
            sex: ii?.sex,
            animal_side: ii?.side,
            individual_id: ii?.individual?.id,
            individual_code_name: ii?.individual?.code_name,
            remarks: i.remarks,
          });
        }
      } else {        
        toCSV.push({
          ...commonFields,
          age: '',
          sex: '',
          animal_side: '',
          individual_id: '',
          individual_code_name: '',
          remarks: i.remarks,
        });
      }
      
    } // end of inner for loop
  } // end of main for loop
  // console.log('csv', toCSV)
  
  return toCSV;
};

// Processing csv headers and rows for FULL CATALOUGED DATA
export const processAllCataloguedToCSV = (data) => {
  const toCSV = [];

  for (const i of data) {
    for (const is of i?.image_species) {
      const commonFields = {
        organization_code_name: i.project?.organization.code_name,
        organization_name: i.project?.organization.organization_name,
        project_code: i.project.project_code,
        project_name: i.project.project_name,
        project_short_name: i.project.short_name,
        objectives: i.project?.objectives,
        contact_person: i.project?.contact_person,
        contact_email: i.project?.contact_email,
        project_owner: i.project?.project_owner,
        project_owner_email: i.project?.p_owner_email,
        project_start_date: getDateOnly(i.project?.start_date),
        project_end_date: getDateOnly(i.project?.end_date),
        subproject_name: i.deployment?.subproject?.subproject_name,
        location_name: i.deployment.location.location_name,
        x: i.deployment.location.x,
        y: i.deployment.location.y,
        camera_name: i.deployment.camera.camera_name,
        camera_placement: i.deployment.camera_placement,
        check_number: i.deployment.check_number,
        camera_check_name: i.deployment.deployment_name,
        start_date: getDateTime24Hr(i.deployment?.start_date),
        end_date: getDateTime24Hr(i.deployment?.end_date),
        image_name: i.file_name,
        uploaded_by: i.uploaded_by,
        date_taken: getDateTime24Hr(i.date_taken),
        is_highlighted: i.is_highlighted,
        identified_by: i.identified_by,  
        species_count: i.species_count,
        species_id: is.species_id,
        common_name: is.species?.common_name,
        individual_count: is.individual_count,        
      };

      if (i.is_profiled) {
        for (const ii of is?.image_individuals) {
          toCSV.push({
            ...commonFields,
            age: ii?.age,
            sex: ii?.sex,
            animal_side: ii?.side,
            individual_id: ii?.individual?.id,
            individual_code_name: ii?.individual?.code_name,
            year_discovered: ii?.year_discovered,
            remarks: i.remarks,
          });
        }
      } else {
        toCSV.push({
          ...commonFields,
          age: '',
          sex: '',
          animal_side: '',
          individual_id: '',
          individual_code_name: '',
          year_discovered: '',
          remarks: i.remarks,
        });
      }
    } // end of inner for loop
  } // end of main for loop
  return toCSV;
};

// CSV headers for catalogued images
export const imagesCSVTemplate = [{
  project_code: null, camera_check_name: null,
  image_name: null, date_taken: null, is_highlighted: null,
  identified_by: null, species_count: null, species_id: null, common_name: null, 
  individual_count: null, age: null, sex: null, animal_side: null, 
  individual_id: null, individual_code_name: null, 
  remarks: null
}]

export function formatToPathname(text) {
  // Use a regular expression to replace spaces with dashes globally
  return text.replace(/\s+/g, '-').toLowerCase();
}

export const label = {
  color: 'rgb(55, 65, 81)',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
}

export const inputStyle = {
  color: 'rgb(55, 65, 81)',
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
}

export function formatTimeAgo(timestamp) {
  const currentDate = new Date();
  const targetDate = new Date(timestamp);

  // Calculate the time difference in milliseconds
  const timeDifference = currentDate - targetDate;

  // Define time intervals in milliseconds
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30.44 * day; // Approximate days in a month

  if (timeDifference < minute) {
    return 'Just now';
  } else if (timeDifference < hour) {
    const minutesAgo = Math.floor(timeDifference / minute);
    return `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
  } else if (timeDifference < day) {
    const hoursAgo = Math.floor(timeDifference / hour);
    return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
  } else if (timeDifference < week) {
    const daysAgo = Math.floor(timeDifference / day);
    return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
  } else if (timeDifference < month) {
    const weeksAgo = Math.floor(timeDifference / week);
    return `${weeksAgo} week${weeksAgo !== 1 ? 's' : ''} ago`;
  } else {
    const monthsAgo = Math.floor(timeDifference / month);
    return `${monthsAgo} month${monthsAgo !== 1 ? 's' : ''} ago`;
  }
}

export const orgRoles = [  
  {id: 'o_editor', label: 'Editor'},
  {id: 'o_viewer', label: 'Viewer'},
  {id: 'o_admin', label: 'Admin'},
]

export const highLevelRoles = ['admin', 'o_editor', 'o_viewer', 'o_admin']

export const projRoles = [
  {id: 'p_admin', label: 'Admin'},
  {id: 'p_editor', label: 'Editor'},
  {id: 'p_contributor', label: 'Contributor'},
  {id: 'p_viewer', label: 'Viewer'},
  {id: 'p_tagger', label: 'Tagger'},
]


// All projects (specifically on the organization page) can be downloaded by admin, o-admin, or o-editor only
export const isOrgDataDownloadAllowed = (role) => {
  return (role === 'admin' || role === 'o_admin' || 'o_editor');
}

// o_viewer or p_viewer or p_tagger roles are not allowed to download project data.
export const isProjDataDownloadAllowed = (role) => {
  return (role !== 'o_viewer' || role !== 'p_viewer' || role !== 'p_tagger');
}

export const failureTypes = [
  {id: 1, value: 'Camera Functioning', label: 'Camera Functioning'},
  {id: 2, value: 'Camera Hardware Failure', label: 'Camera Hardware Failure'},
  {id: 3, value: 'Memory Card Failure', label: 'Memory Card Failure'},
  {id: 4, value: 'Unknown Failure', label: 'Unknown Failure'},
  {id: 5, value: 'Vandalism', label: 'Vandalism'},
  {id: 6, value: 'Theft', label: 'Theft'},
  {id: 7, value: 'Wildlife Damage', label: 'Wildlife Damage'},
]

export const ages = [
  {value: 'Adult', label: 'Adult'},
  {value: 'Juvenile', label: 'Juvenile'},
  {value: 'Infant', label: 'Infant'},
  {value: 'Unknown', label: 'Unknown'},
]

export const sexes = [
  {value: 'Male', label: 'Male'}, 
  {value: 'Female', label: 'Female'},
  {value: 'Unknown', label: 'Unknown'}
]

export const animalSides = [
  {value: 'Front', label: 'Front'}, 
  {value: 'Back', label: 'Back'},
  {value: 'Left', label: 'Left'},
  {value: 'Right', label: 'Right'}
]

export const certaintyList = ['Absolutely sure', 'Pretty sure', 'Not sure', "Don't know", 'Other']

function toDegrees(radians) {
  return radians / Math.PI * 180;
}

// Convert UTM to latitude and longitude
export function convertUtmToLatLng(easting, northing, zoneNumber, zoneLetter, locationName) {
  // const { a, eccSquared } = getEllipsoid(ellipsoidName);
  const a = 6378137; 
  const eccSquared = 0.00669438
  if(typeof easting !== 'number') {
    throw new Error('Could not find a valid easting number');
  }
  if(typeof northing !== 'number') {
    throw new Error('Could not find a valid northing number');
  }
  if(typeof northing !== 'number') {
    throw new Error('Could not find a valid zone number');
  }
  if(typeof zoneLetter !== 'string') {
    throw new Error('Could not find a zone letter');
  }

  const e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  const northernHemisphere = (['N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].indexOf(zoneLetter) !== -1) ? 1 : 0;
  const y = northernHemisphere === 0 ? northing - 10000000.0 : northing;
  const x = easting - 500000.0; //remove 500,000 meter offset for longitude
  const longitudeOrigin = (zoneNumber - 1) * 6 - 180 + 3;
  const eccPrimeSquared = (eccSquared) / (1 - eccSquared);

  const M = y / 0.9996;
  const mu = M / (a * (1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256));

  const phi1Rad = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu)
      + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu)
      + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);

  const N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  const T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  const C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  const R1 = a * (1 - eccSquared) / Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  const D = x / (N1 * 0.9996);

  let latitude = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) * D * D * D * D / 24
          + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * eccPrimeSquared - 3 * C1 * C1) * D * D * D * D * D * D / 720);
  latitude = toDegrees(latitude);

  let longitude = (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * eccPrimeSquared + 24 * T1 * T1)
          * D * D * D * D * D / 120) / Math.cos(phi1Rad);
  longitude = longitudeOrigin + toDegrees(longitude);

  return { latitude, longitude, locationName };
}

// Simple throttle function (used in imageSlider to control panning)
export function useThrottle(callback, delay) {
  const lastCallRef = useRef(0);

  const throttledCallback = (...args) => {
    const now = new Date().getTime();
    if (now - lastCallRef.current > delay) {
      callback(...args);
      lastCallRef.current = now;
    }
  };

  return throttledCallback;
}

// Allows users to dynimically fetch data (users input condtions to filter)
export const buildWhereClause = ({ projectId, locationId, subprojectId, deploymentId, isIdentified, speciesId }) => {
  const where = {
    project_id: { _eq: projectId }
  };

  // Dynamically add filters based on their presence
  if (locationId !== undefined) {
    where.deployment = { ...where.deployment, location_id: { _eq: locationId } };
  }

  if (subprojectId !== undefined) {
    where.deployment = { ...where.deployment, subproject_id: { _eq: subprojectId } };
  }

  if (deploymentId !== undefined) {
    where.deployment_id = { _eq: deploymentId };
  }

  if (isIdentified !== undefined) {
    where.is_identified = { _eq: isIdentified };
  }

  if (speciesId !== undefined) {
    where.image_species = { species_id: { _eq: speciesId } };
  }

  return where;
};

// Helper function to parse all date-related fields from an image object into JavaScript Date objects.
export const parseDateFields = image => {
  return {
    dateTaken: getDateTime24Hr(image.date_taken),
    uploadedAt: getDateTime24Hr(image.file.createdAt),
    identifiedAt: getDateTime24Hr(image.identified_at),
    profiledAt: getDateTime24Hr(image.profiled_at)
  };
};