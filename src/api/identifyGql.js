// This contains all queries related to the Identify page on the dashboard.
import { gql } from "@apollo/client";

/* ************************** START IMAGES TABLE ********************************** */

// Query project images based on the filter parameters (used in Identify page)
export const GET_IMAGES_BY_FILTER = gql`
  query GetImagesByProjectId($condition: images_bool_exp) {
    images(
      where: $condition, 
      order_by: {date_taken: asc}) {
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
        location {
          id
          location_name
        }
      }
      file_name
      is_highlighted
      is_identified
      is_profiled
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

// update single row of the table: "images"
export const UPDATE_IMAGE_BYID = gql`
  mutation UpdateImageById(
    $imageId: uuid!, $values: images_set_input
  ) {
    update_images_by_pk(
      pk_columns: {file_id: $imageId}, 
      _set: $values) {
      file_id
      is_highlighted
    }
  }
`

// update similar values in images table
export const UPDATE_IMAGES = gql`
  mutation UpdateImages(
    $imageIds: [uuid!]!, $values: images_set_input
  ) {
    update_images(
      where: {file_id: {_in: $imageIds}}, 
      _set: $values
    ) {
      affected_rows
    }
  }
`

// Update multiple rows in images table
export const UPDATE_IMAGES_MANY = gql`
  mutation UpdateImagesMany(
    $values: [images_updates!]!
  ) {
    update_images_many(
      updates: $values
    ) {
      affected_rows
    }
  }
`


// Update a single image capture date
export const UPDATE_DATE_TAKEN = gql`
  mutation UpdateDateTaken(
    $dateTaken: timestamptz!, $fileIds: [uuid!]!
  ) {
    update_images_many(updates: {
      where: {
        file_id: {_in: $fileIds}
      }, 
      _set: {date_taken: $dateTaken}
    }) {
      affected_rows
    }
  }
`

// Update image capture date in bulk.
export const UPDATE_DATE_TAKEN_BULK = gql`
  mutation UpdateDateTakenBulk(
    $imageTimestamps: [images_updates!]!
  ) {
    update_images_many(updates: $imageTimestamps) {
      affected_rows
    }
  }
`
/* ************************** END IMAGES TABLE ********************************** */


/* ************************** START IMAGES_SPECIES TABLE ********************************** */
//insert new rows in image_species table
export const INSERT_IMAGE_SPECIES = gql`
  mutation InsertImageSpecies(
    $imageSpecies: [image_species_insert_input!]!
    ) {
    insert_image_species(objects: $imageSpecies) {
      affected_rows
    }
  }
`

// Update a single row in image_species table
export const UPDATE_IMAGE_SPECIES = gql`
  mutation UpdateImageSpeciesBulk(
    $values: [image_species_updates!]!
  ) {
    update_image_species_many(updates: $values) {
      affected_rows
    }
  }
`
/* ************************** END IMAGE_SPECIES TABLE ********************************** */


/* ************************** START IDENTIFY_HISTORY TABLE ********************************** */
// Get history based on species or individuals ID and image ID
export const GET_HISTORY_BY_TYPE_IMAGEID = gql`
  query GetHistoryByTypeImageId(
    $imageId: uuid!, $type: String!
  ) {
    identification_history(
      where: {
        image_file_id: {_eq: $imageId}, 
        _and: {type: {_eq: $type}}
      }, 
      order_by: {identify_at: asc}
    ) {
      id
      identify_at
      identify_by
      type
    }
  }
`

// Insert identification history into identify_history table
export const INSERT_IDENTIFY_HISTORY_BULK = gql`
  mutation InsertIdentifyHistoryBulk (
    $values: [identification_history_insert_input!]!
  ) {
    insert_identification_history(objects: $values) {
      affected_rows
    }
  }
`
/* ************************** END IDENTIFY_HISTORY TABLE ********************************** */


/* ************************** START IMAGE_INDIVIDUALS TABLE ********************************** */
export const INSERT_IMAGE_INDIVIDUALS_MANY = gql`
  mutation InsertImageIndividualsOne(
    $values: [image_individuals_insert_input!]!
  ) {
    insert_image_individuals(objects: $values) {
      affected_rows
    }
  }
`

export const UPDATE_IMAGE_INDIVIDUALS_MANY = gql`
  mutation UpdateImageIndividualsMany(
    $values: [image_individuals_updates!]!
  ) {
    update_image_individuals_many(
      updates: $values
    ) {
      affected_rows
    }
  }
`
/* ************************** END IMAGE_INDIVIDUALS TABLE ********************************** */


export const ADD_REVIEW = gql `
  mutation AddReview (
    $numPhotos: smallint!, $remarks: String,
    $animals: [animals_insert_input!]!
  ) {
    insert_reviews_one(object: {
      num_of_photos: $numPhotos, 
      remarks: $remarks, 
      animals: {
        data: $animals
      }
    }) {
      id
    }
  }
`

export const ADD_IMAGE_REVIEWS = gql `
  mutation AddImageReviews (
    $imageReviews: [image_reviews_insert_input!]!
  ) {
    insert_image_reviews(
      objects: $imageReviews
    ) {
      affected_rows
    }
  }
`



// "imageReviews": [{"image_file_id": "", "review_id": "" }]

export const UPDATE_IMAGE_IS_REVIEWED = gql `
  mutation UpdateImageIsReviewed (
    $fileIds: [uuid!]!
  ) {
    update_images(
      where: {
        file_id: {
          _in: $fileIds
        }
      }, 
      _set: {is_reviewed: true}
    ) {
      affected_rows
    }
  }
`

export const UPDATE_IMAGE_IS_PROFILED = gql `
  mutation UpdateImageIsProfiled (
    $fileIds: [uuid!]!
  ) {
    update_images(
      where: {
        file_id: {
          _in: $fileIds
        }
      }, 
      _set: {is_profiled: true}
    ) {
      affected_rows
    }
  }
`

export const GET_IMAGES_SID_DID_SPID = gql `
  query GetImagesBySurveyDeploymentSpeciesId(
    $surveyId: Int, $deploymentId: Int, $speciesId: Int
    ) {
    images(
      order_by: {date_taken: asc}, 
      where: {is_reviewed: {_eq: true}, 
        _and: {
          is_profiled: {_eq: false},
          _and: {
            deployment_camera: {deployment: {survey_id: {_eq: $surveyId}}}, 
            _and: {
              deployment_camera: {deployment_id: {_eq: $deploymentId}}, 
              _and: {image_review: {review: {animals: {species_id: {_eq: $speciesId}}}}}
            }
          }
        }
      }
    ) {
      file_id
      deployment_camera {
        id
        position
        camera {
          camera_name
        }
      }
      is_reviewed
      date_taken
      url
      file {
        createdAt
      }
      image_review {
        review {
          id
          reviewed_at
          remarks
          updated_at
          animals(order_by: {id: asc}) {
            animal_count
            id
            num_of_adults
            num_of_females
            num_of_juveniles
            num_of_males
            animal_side
            species {
              common_name
            }
          }
        }
      }
    }
  }
`

export const ADD_INDIVIDUAL_IMAGES = gql`
  mutation InsertIndividuals(
    $individuals: [individual_images_insert_input!]!
  ) {
    insert_individual_images(
      objects: $individuals
    ) {
      affected_rows
    }
  }
`

// "individuals": [{"image_file_id": "", "side": "", 
//     "individual_id": 1}]