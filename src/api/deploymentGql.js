import { gql } from '@apollo/client';
import { DEPLOYMENT_NAME_FIELDS, CAMERA_NAME_FIELDS  } from './fragmentGql';

//fetches deployment details from the database
export const GET_DEPLOYMENTS_BY_PROID = gql`
  query GetDeploymentsByProId($projectId: Int!) {
    deployments(where: {project_id: {_eq: $projectId}}, order_by: {start_date: desc}) {
      id
      deployment_name
      has_media
      failure_type
      end_date
      check_number
      camera_placement
      is_upload_complete
      pickup_person
      remarks
      setup_person
      start_date
      location {
        id
        location_name
      }
      camera {
        id
        camera_name
      }
      subproject {
        id
        subproject_name
      }
      project {
        id
        project_code
      }
    }
  }
`


// Used in DeploymentTab.js
// Will need to be deleted. Used in DeploymentTab.js
export const GET_DEPLOYMENT_CAMERAS_BY_DEP_ID = gql `
  ${CAMERA_NAME_FIELDS}
  query GetDeploymentCamerasByDeploymentId(
    $deploymentId: Int!
  ) {
    deployment_cameras(
      where: {deployment_id: {_eq: $deploymentId}}, 
      order_by: {id: asc}
    ) {
      id
      battery_status_end
      battery_status_start
      camera {
        ...CameraNameFields
      }
      is_checked
      num_of_photos
      position
      trap_days
      final_capture_date
      card_number
    }
  }
`

//get deploymnent(camera check) names by project ID
export const GET_DEPLOYMENT_NAMES_BY_PROID = gql`
  ${DEPLOYMENT_NAME_FIELDS}
  query GetDeploymentNamesByProjectId (
    $projectId: Int!
  ) {
    deployments(
      order_by: {id: asc}, 
      where: {
        project_id: {_eq: $projectId}, 
        _and: {is_upload_complete: {_eq: false}}
      }
    ) {
      ...DeploymentNameFields  
      camera {
        camera_name
      }
      check_number     
    }
  }
`

// Get deployment names by location id
export const GET_DEPLOYMENT_NAMES_BY_LOC_ID = gql `
  ${DEPLOYMENT_NAME_FIELDS}
  query GetDeploymentNamesByLocationId(
   $locationId: Int!
  ) {
    deployments(
      order_by: {id: asc}, 
      where: {
        location_id: {_eq: $locationId}
      }
    ) {
      ...DeploymentNameFields 
      camera {
        camera_name
      }
      check_number
      camera_placement
    }
  }
`

export const GET_DEPLOYMENT_NAMES_SID = gql`
  ${DEPLOYMENT_NAME_FIELDS}
  query GetDeploymentNamesBySurveyId (
    $surveyId: Int!
  ) {
    deployments(order_by: {id: asc}, where: {survey_id: {_eq: $surveyId}}) {
      ...DeploymentNameFields       
    }
  }
`

// Insert a single row of data in deployments table
export const INSERT_DEPLOYMENT = gql`
  mutation InsertDeployment (
    $deployment: deployments_insert_input!  
  ) {
    insert_deployments_one(
      object: $deployment
    ) {
      id
    }
  }
`

// Insert multiple rows of data in deployments table
export const INSERT_DEPLOYMENTS_MANY = gql`
  mutation InsertDeploymentsMany(
    $values: [deployments_insert_input!]!
  ) {
    insert_deployments(
      objects: $values, 
      on_conflict: {
        constraint: deployments_deployment_name_key, 
        update_columns: [start_date, end_date]
      }
    ) {
      returning {
        id
        deployment_name
      }
    }
  }
`

//adds one deployment details to the database
// Will be deleted
// export const ADD_DEPLOYMENT = gql `
//   mutation AddDeployment(
//     $deploymentName: String!, $startDate: timestamptz!,
//     $endDate: timestamptz!, $locationId: Int!,
//     $remarks: String, $surveyId: Int, $cameras: [deployment_cameras_insert_input!]!  
//   ) {
//     insert_deployments_one(
//       object: {
//         deployment_name: $deploymentName, start_date: $startDate, 
//         end_date: $endDate, location_id: $locationId, remarks: $remarks, 
//         survey_id: $surveyId, 
//         deployment_cameras: {
//           data: $cameras
//         }
//       }
//     ) {
//       id
//     }
//   }
// `

// Updates a single row in deployments table using primary key
export const UPDATE_DEPLOYMENT_BYID = gql`
  mutation UpdateDeploymentById(
    $deploymentId: Int!,
    $deploymentInput: deployments_set_input
  ) {
    update_deployments_by_pk(
      pk_columns: {id: $deploymentId}, 
      _set: $deploymentInput
    ) {
      id
    }
  }
`


// Update fields in deployment_cameras table
// Will be deleted
// export const UPDATE_DEPCAMERA_BYID = gql`
//   mutation UpdateDepCameraById(
//     $depCamId: Int!, $depCamInputs: deployment_cameras_set_input
//   ) {
//     update_deployment_cameras_by_pk(
//       pk_columns: {id: $depCamId}, 
//       _set: $depCamInputs
//     ) {
//       is_checked
//       camera_id
//     }
//   }
// `

// Add additional camera to deployment_cameras table
// Will be deleted. Used in DeploymentTab.js
export const ADD_DEPLOYMENT_CAMERA = gql`
  mutation AddDeploymentCamera(
    $cameraId: Int!, $deploymentId: Int!,
    $position: bpchar
  ) {
    insert_deployment_cameras_one(
      object: {
        camera_id: $cameraId, 
        deployment_id: $deploymentId, 
        position: $position
      }
    ) {
      id
    }
  }
`