import { gql } from '@apollo/client';


export const ADD_ORGANIZATION_ONE = gql `
  mutation AddOrganizationOne(
    $values: organizations_insert_input!
  ) {
    insert_organizations_one(
      object: $values
    ) {
      id
    }
  }
`

//get organization details with one recent project
export const GET_ORGANIZATIONS_PROJECTS = gql`
  query GetOrganizationsProjects {
    organizations(order_by: {organization_name: asc}) {
      id
      short_name
      organization_name
      address1
      address2
      code_name
      district
      projects(order_by: {created_at: desc}, limit: 1) {
        id
        project_name
        project_code
        short_name
        created_at
        created_by
      }      
    }
  }
`

// Get project role and isRevoke status of project member
export const GET_USER_PROJECT_ROLE = gql`
  query GetProjectRole($userId: uuid!, $projectId: Int!) {
    user_projects(
      where: {
        user_id: {_eq: $userId}, 
        _and: {project_id: {_eq: $projectId}}
      }
    ) {
      user_role
      is_p_revoked
    }
  }
`

export const GET_USER_ORGANIZATION_ROLE = gql `
  query GetUserOrganizationRole(
    $userId: uuid!, $orgId: Int!
  ) {
    user_organizations(
      where: {organization_id: {_eq: $orgId}, user_id: {_eq: $userId}}
    ) {
      role
      is_revoked
    }
  }
`

//update organization table based on id
export const UPDATE_ORGANIZATION_BYID = gql`
  mutation UpdateOrganizationById(
    $organizationId: Int!, $organization: organizations_set_input
  ) {
    update_organizations_by_pk(
      pk_columns: {id: $organizationId}, 
      _set: $organization
    ) {
      id
    }
  }
`