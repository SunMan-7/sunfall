import { gql } from "@apollo/client";


export const GET_CATALOGUED_DATA_COMPLETE = gql`
  query GetCataloguedData(
    $startDate: timestamptz!,
    $endDate: timestamptz!
  ) {
    images(
      order_by: {date_taken: asc}, 
      where: {
        is_identified: {_eq: true}, 
        _and: {
          deployment: {start_date: {_gte: $startDate}, 
            _and: {end_date: {_lte: $endDate}}}
        }
      }
    ) {
      file_id
      date_taken
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
      file {
        name
        createdAt
      }
      project {
        id
        project_code
        project_name
        short_name
        objectives
        contact_person
        contact_email
        project_owner
        p_owner_email
        start_date
        end_date
        organization {
          code_name
          organization_name
        }
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
          individual {
            id
            code_name
            year_discovered
          }
        }
      }
    }
  }

`

//This data will be fetched when users clicks CSV download
export const GET_ANIMALS_BY_DATES_DOWNLOAD = gql`
  query GetAnimalsByDate($firstDate: timestamptz!, $secondDate: timestamptz!) {
    animals(order_by: {id: asc}, 
      where: {review: {image_reviews: {image: {deployment_camera: {
        deployment: {start_date: {_gte: $firstDate, _lte: $secondDate}}
      }}}}}
    ) {
      animal_count
      animal_side
      id
      num_of_adults
      num_of_females
      num_of_juveniles
      num_of_males
      review {
        id
        num_of_photos
        reviewed_at
        remarks
        updated_at
        user {
          displayName
        }
        image_reviews (distinct_on: review_id) {
          image {
            deployment_camera {
              deployment {
                deployment_name
                survey {
                  survey_name
                }
              }
            }
            file_id
          }
        }
      }
      species {
        common_name
      }
    }
  }
`
// {
//   "firstDate": "2023-03-01T07:19:48+00:00",
//   "secondDate": "2023-03-11T07:19:48+00:00"
  
// }