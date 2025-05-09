import { gql } from '@apollo/client';
import { CAMERA_NAME_FIELDS } from './fragmentGql';

//queries a list of cameras from the database
export const GET_CAMERAS = gql`
  ${CAMERA_NAME_FIELDS}
  query GetCameras(
    $organizationId: Int!
  ) {
    cameras(
      order_by: {id: asc},
      where: {organization_id: {_eq: $organizationId}}
    ) {
      ...CameraNameFields
      make
      model
      num_of_batteries
      purchase_date
      purchase_price
      product_url
      remarks
      serial_number
      status
    }
    cameras_aggregate {
      aggregate {
        count(columns: camera_name)
      }
    }
  }
`

//insert one row of data in cameras table
export const INSERT_CAMERA_ONE = gql`
  mutation InsertCameraOne(
    $camera: cameras_insert_input!
  ) {
    insert_cameras_one(
      on_conflict: {constraint: cameras_camera_name_key}, 
      object: $camera
    ) {
      id
    }
  }
`

//insert one row of data in cameras table
export const INSERT_CAMERAS_MANY = gql`
mutation InsertCamerasMany(
  $values: [cameras_insert_input!]!
) {
  insert_cameras(
    objects: $values, 
    on_conflict: {
      constraint: cameras_camera_name_key, 
      update_columns: [purchase_date, status, remarks] 
    }
  ) {
    returning {
      id
    }
  }
}
`

//fetch the list of available camera names from the database
export const GET_CAMERA_NAMES = gql `
  ${CAMERA_NAME_FIELDS}
  query GetCameraNames (
    $organizationId: Int!
  ) {
    cameras(
      order_by: {id: asc},
      where: {organization_id: {_eq: $organizationId}}
    ) {
      ...CameraNameFields,
      status
    }
  }
`

//adds camera details to the database
export const UPDATE_CAMERA_BYID = gql`
  mutation UpdateCamera(
    $cameraId: Int!, $camera: cameras_set_input
  ) {
    update_cameras_by_pk(
      pk_columns: {id: $cameraId}, 
      _set: $camera
    ) {
      id
      camera_name
      make
      model
      num_of_batteries
      purchase_date
      purchase_price
      product_url
      remarks
      serial_number
      status
    }
  }
`

//update the status of a specific camera
export const UPDATE_CAMERA_STATUS = gql `
  mutation UpdateCameraStatus(
    $id: Int!, $status: String!
    ) {
    update_cameras_by_pk(
      pk_columns: {id: $id}, 
      _set: {status: $status}
    ) {
      id
      camera_name
    }
  }
`

//update the status of two cameras
export const UPDATE_TWO_CAMERAS_STATUS = gql `
  mutation UpdateCamerasStatus(
    $id1: Int!, $status1: String!,
    $id2: Int!, $status2: String!
  ) {
    update_cameras_many(updates: 
      [{where: {id: {_eq: $id1}}, _set: {status: $status1}},
      {where: {id: {_eq: $id2}}, _set: {status: $status2}}
      ]   
    ) {
      affected_rows
    }
  }
`

export const UPDATE_CAMERA_STATUSES = gql`
  mutation UpdateCameraStatuses(
    $cameraIds: [Int!]!, $status: String!
  ) {
    update_cameras(
      _set: {status: $status}, 
      where: {id: {_in: $cameraIds}}
    ) {
      affected_rows
    }
  }
`
