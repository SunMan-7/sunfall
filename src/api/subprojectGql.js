import { gql } from '@apollo/client';
import { DEPLOYMENT_FIELDS } from './fragmentGql';


// Get Subprojects along with total number of deployments linked to it.
export const GET_SUBPROJECTS = gql`
  query GetSubprojects(
    $projectId: Int!
  ) {
    subprojects(
      order_by: {id: asc}, 
      where: {project_id: {_eq: $projectId}}
    ) {
      id
      subproject_name
      description
      deployments_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

// Get a few fields from deployments table by subproject ID
export const GET_DEPLOYMENTS_BY_SUBPROJECT = gql `
  ${DEPLOYMENT_FIELDS}
  query GetDeploymentsBySubproject(
    $subprojectId: Int!
  ){
    deployments (
      where: {subproject_id: {_eq: $subprojectId}}, 
      order_by: {start_date: asc}
      ) {
      ...DeploymentFields
      location {
        location_name
      }
    }
  }
`

// Insert a single row into the table: "subprojects"
export const INSERT_SUBPROJECT_ONE = gql`
  mutation InsertSubprojectOne(
    $values: subprojects_insert_input!
  ) {
    insert_subprojects_one(
      object: $values, 
      on_conflict: {
        constraint: subprojects_subproject_name_project_id_key,
        update_columns: [subproject_name]
      }
    ) {
      id
    }
  }
`

// Upsert multiple rows into the table: "subprojects. Ideal for
// uploading data parsed from a CSV file.
export const UPSERT_SUBPROJECTS_MANY = gql`
  mutation UpsertSubprojectsMany(
    $values: [subprojects_insert_input!]!
  ) {
    insert_subprojects(
      objects: $values, 
      on_conflict: {
        constraint: subprojects_subproject_name_project_id_key, 
        update_columns: [description]
      }
    ) {
      affected_rows
    }
  }
`

// update single row of the table: "subprojects"
export const UPDATE_SUBPROJECT_BYID = gql`
  mutation UpdateSubprojectById(
    $subprojectId: Int!
    $values: subprojects_set_input
  ) {
    update_subprojects_by_pk(
      pk_columns: {id: $subprojectId}, 
      _set: $values
    ) {
      id
    }
  }
`



