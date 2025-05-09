import { gql } from '@apollo/client';

// Get all projects by organization id
export const GET_PROJECTS = gql`
  query GetProjects(
    $organizationId: Int!
  ) {
    projects(
      where: {organization_id: {_eq: $organizationId}}
    ) {
      id
      end_date
      contact_email
      contact_person
      created_at
      created_by
      objectives
      p_owner_email
      project_code
      project_name
      project_owner
      short_name
      start_date
    }
  }
`

// Get project details by project id
export const GET_PROJECT_BYID = gql`
  query GetProjectByID(
    $projectId: Int!
  ) {
    projects_by_pk(id: $projectId) {
      contact_email
      contact_person
      created_at
      created_by
      end_date
      id
      objectives
      p_owner_email
      project_code
      project_name
      project_owner
      short_name
      start_date
    }
  }
`
export const ADD_PROJECTS = gql`
  mutation AddProjects (
    $projects: [projects_insert_input!]!
  ) {
    insert_projects( 
      on_conflict: {constraint: projects_code_key},
      objects: $projects,
    ) {
      returning {
        id
        project_code
        short_name
        project_name
      }
    }
  }
`

// Insert a single row in projects table and return all inserted fields
export const INSERT_PROJECT_ONE = gql`
  mutation InsertProjectOne(
    $values: projects_insert_input!
  ) {
    insert_projects_one(
      object: $values, 
      on_conflict: {
        constraint: projects_code_key
      }
    ) {
      id
      end_date
      contact_email
      contact_person
      created_at
      created_by
      objectives
      p_owner_email
      project_code
      project_name
      project_owner
      short_name
      start_date
    }
  }
`

// Update a single row in projects table based on primary key
export const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $projectId: Int!,
    $values: projects_set_input 
  ) {
    update_projects_by_pk(
      pk_columns: {id: $projectId}, 
      _set: $values
    ) {
      id
      end_date
      contact_email
      contact_person
      created_at
      created_by
      objectives
      p_owner_email
      project_code
      project_name
      project_owner
      short_name
      start_date
    }
  }
`