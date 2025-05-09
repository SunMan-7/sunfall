import { gql } from '@apollo/client';

export const SUBPROJECT_NAME_FIELDS = gql`
  fragment SubprojectNameFields on subprojects {
    id
    subproject_name
  }
`
export const DEPLOYMENT_NAME_FIELDS = gql`
  fragment DeploymentNameFields on deployments {
    id
    deployment_name    
  }
 
`
export const DEPLOYMENT_FIELDS = gql`
  ${DEPLOYMENT_NAME_FIELDS}
  fragment DeploymentFields on deployments {
    ...DeploymentNameFields
    start_date
    end_date    
    remarks
  }
`

export const SITE_NAME_FIELDS = gql`
  fragment SiteNameFields on sites {
    id
    site_name
  }
`
export const LOCATION_NAME_FIELDS = gql`
  fragment LocationNameFields on locations {
    id
    location_name
  }
`

export const CAMERA_NAME_FIELDS = gql`
  fragment CameraNameFields on cameras {
    id
    camera_name
  }
`

export const REVIEWED_ANIMAL_FIELDS = gql`
  fragment ReviewedAnimalFields on animals {
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
      first_event_date
      reviewed_at
      remarks
      updated_at
      user {
        displayName
      }
      image_reviews(order_by: {image: {date_taken: desc}}, limit: 1) {
        image {
          deployment_camera {
            deployment {
              deployment_name
              start_date
              end_date
              location {
                location_name                
                x
                y
              }
              subproject {
                subproject_name
              }
            }
            camera {
              camera_name
            }
            position
            trap_days
            num_of_photos
            final_capture_date
          }
          url
          date_taken
        }
      }
    }
    species {
      common_name
    }    
  }
`


// get animals query template
// query GetAnimalsBySurvey{
//   animals {
//   animal_count
//   animal_side
//   id
//   num_of_adults
//   num_of_females
//   num_of_juveniles
//   num_of_males
//   review {
//     id
//     num_of_photos
//     reviewed_at
//     remarks
//     updated_at
//     user {
//       displayName
//     }
//     image_reviews(distinct_on: review_id) {
//       image {
//         deployment_camera {
//           deployment {
//             deployment_name
//             start_date
//             end_date
//             location {
//               location_name
//               region
//               site {
//                 short_name
//               }
//               latitude
//               longitude
//             }
//             survey {
//               survey_name
//             }
//           }
//           camera {
//             camera_name
//           }
//           position
//           trap_days
//           num_of_photos
//           final_capture_date
//         }
//         url
//         date_taken
//       }
//     }
//   }
//   species {
//     common_name
//   }
// }
// }
