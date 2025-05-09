import { gql } from '@apollo/client';
import { DEPLOYMENT_NAME_FIELDS, CAMERA_NAME_FIELDS } from './fragmentGql';

// Insert multiple rows of additional image metadata in images table
export const INSERT_IMAGE_DATA = gql`
  mutation insertImageData(
    $imageData: [images_insert_input!]!
  ) {
    insert_images(
      objects: $imageData, 
      on_conflict: {constraint: images_file_name_unique}
    ) {
      affected_rows
    }
  }
`
// Insert one row of additional image metadata in images table 
export const INSERT_IMAGE_DATA_ONE = gql`
  mutation insertImageDataOne(
    $imageData: images_insert_input!
  ) {
    insert_images_one(
      object: $imageData, 
      on_conflict: {constraint: images_file_name_unique}
    ) {
      file_id
    }
  }
`

// insert data in upload_details table
export const INSERT_UPLOAD_DETAILS = gql`
mutation InsertUploadDetails(
  $values: upload_details_insert_input!
) {
  insert_upload_details_one(object: $values) {
    id
  }
}

`

//Get names that are not marked checked from deployment_cameras table 
// Will not longer be used, should be removed
export const GET_DEPLOYMENT_CAMERA_NAMES = gql`
  ${DEPLOYMENT_NAME_FIELDS}, ${CAMERA_NAME_FIELDS}
  query GetDeploymentCameraNames {
    deployment_cameras(
      where: {is_checked: {_eq: false}}
    ) {
      id
      deployment {
        ...DeploymentNameFields
      }
      camera {
        ...CameraNameFields
      }
    }
  }
`