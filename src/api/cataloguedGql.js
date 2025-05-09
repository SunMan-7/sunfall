import { gql } from '@apollo/client';

// Get identified images by project ID (used in Catalogued component);
export const GET_IDENTIFIED_IMAGES_BY_PROJECT = gql`
  query GetImagesByProjectId($projectId: Int!) {
    images(
      where: {project_id: {_eq: $projectId}, is_identified: {_eq: true}}, 
      order_by: {date_taken: asc}
    ) {
      date_taken
      deployment {
        id
        deployment_name
        camera {
          id
          camera_name
        }
        camera_placement
        check_number
        start_date
        end_date
        location {
          id
          location_name
          x
          y
        }
        subproject {
          id
          subproject_name
        }
      }
      file_name
      species_count
      is_highlighted
      is_identified
      is_profiled
      is_approved 
      identified_at
      identified_by
      profiled_at
      profiled_by 
      uploaded_by    
      remarks
      file_id
      file {
        createdAt
      }
      project {
        id
        project_code
        short_name
      }
      image_species {
        id
        species_id
        species {
          id
          common_name
          scientific_name
        }
        individual_count
        image_individuals {
          age
          id
          sex
          side
          image_species_id
          individual {
            id
            code_name
          }
        }        
      }
      image_species_aggregate {
        aggregate {
          sum {
            individual_count
          }
        }
      }
    }
  }
`

export const GET_CATALOGUED_BY_FILTER = gql`
  query GetImagesByProjectId($condition: images_bool_exp) {
    images(
      where: $condition, 
      order_by: {identified_at: asc}
    ) {
      date_taken
      deployment {
        id
        deployment_name
        camera {
          id
          camera_name
        }
        camera_placement
        check_number
        start_date
        end_date
        location {
          id
          location_name
          x
          y
        }
        subproject {
          id
          subproject_name
        }
      }
      file_name
      species_count
      is_highlighted
      is_identified
      is_profiled
      is_approved 
      identified_at
      identified_by
      profiled_at
      profiled_by 
      uploaded_by    
      remarks
      file_id
      file {
        createdAt
      }
      project {
        id
        project_code
        short_name
      }
      image_species {
        id
        species_id
        species {
          id
          common_name
          scientific_name
        }
        individual_count
        image_individuals {
          age
          id
          sex
          side
          image_species_id
          individual {
            id
            code_name
          }
        }        
      }
      image_species_aggregate {
        aggregate {
          sum {
            individual_count
          }
        }
      }
    }
  }
`

export const GET_UNIDENTIFIED_IMAGES_COMPARE = gql`
  query GetUnidentifiedImagesCompare($projectId: Int!) {
    images(
      where: {project_id: {_eq: $projectId}, is_identified: {_eq: false}}      
    ) {
      deployment {
        deployment_name
      }
      file_id
      file_name 
      project {
        project_code
      }           
    }
  }
`