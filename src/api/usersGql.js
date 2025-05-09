import { gql } from '@apollo/client';

//get allowed user details
export const GET_USERS = gql`
  query GetUsers {
    default_organization {
      user {
        id
        avatarUrl
        displayName
        email
        defaultRole
      }
      is_revoked
    }
  }
`

//Get top level users within the organization
export const GET_ORGANIZATION_T2_USERS = gql`
query GetT2Users($organizationId: Int!) {
  users(
    order_by: {displayName: asc}, 
    where: {
      defaultRole: {_in: ["o_admin", "o_editor", "o_viewer", "user"]}, 
      _and: {default_organization: {organization_id: {_eq: $organizationId}}}
    }
  ) {
    id
    avatarUrl
    defaultRole
    displayName
    email
    default_organization{
      organization_id
      is_revoked
    }
  }
}
`

// Get organization admins
export const GET_ORGANIZATION_STAFF = gql`
  query GetOrganizationAdmins($organizationId: Int!) {
    user_organizations(
      where: {organization_id: {_eq: $organizationId}, role: {_neq: "member"}}, 
      order_by: {user: {displayName: asc}}
    ) {
      id
      is_revoked
      role
      user {
        id
        displayName
        email
        avatarUrl
      }
    }
  }
`

// Get project role of project member
export const GET_PROJECT_ROLE = gql`
  query GetProjectRole($userId: uuid!, $projectId: Int!) {
    user_projects(
      where: {
        user_id: {_eq: $userId}, 
        _and: {project_id: {_eq: $projectId}}
      }
    ) {
      user_role
    }
  }
`




//fetch user role based on user email.
export const GET_USER_BYEMAIL = gql`
  query GetUserByEmail (
    $email: citext!
  ) {
    users(where: {email: {_eq: $email}}) {
      id,
      defaultRole
      default_organization {
        organization_id
      }
    }
  }
`

//fetch user role based on user email.
export const GET_USER_ID_BY_EMAIL = gql`
  query GetUserIdByEmail (
    $email: citext!
  ) {
    users(where: {email: {_eq: $email}}) {
      id
    }
  }
`

// update single row of the table: "auth.users". Meant mostly for defaultRole column
export const UPDATE_USER_BYID = gql`
  mutation UpdateUserById (
    $userId: uuid!,
    $values: users_set_input
  ) {
    updateUser(pk_columns: {id: $userId}, _set: $values) {
      id
      defaultRole
      default_organization{
        organization_id
        is_revoked
      }
    }
  }
`

export const UPDATE_DEFAULT_ROLE_BYID = gql`
  mutation UpdateDefaultRoleById(
    $userId: uuid!, $defaultRole: String!
  ){
    updateUser(
      pk_columns: {id: $userId}, 
      _set: {defaultRole: $defaultRole}
    ) {
      id
    }
  }
`

// update data of the table: "user_projects" by project id and user id.
export const UPDATE_USER_PROJECTS = gql`
  mutation UpdateUserProject(
    $projectId: Int!, $userId: uuid!, 
    $values: user_projects_set_input!
  ) {
    update_user_projects(
      where: {
        project_id: {_eq: $projectId}, _and: {user_id: {_eq: $userId}}
      }, 
      _set: $values
    ) {
      returning {
        id
        is_p_revoked
        user_role
      }
    }
  }
`

// update is_p_revoked in user_projects table
export const UPDATE_REVOKE_USER_PROJECTS = gql`
  mutation UpdateRevokeProjectMember (
    $projectId: Int!, $userId: uuid!, $isRevoked: Boolean!
  ) {
    update_user_projects(
      where: {
        project_id: {_eq: $projectId}, 
        _and: {user_id: {_eq: $userId}}
      }, 
      _set: {is_p_revoked: $isRevoked}
    ) {
      returning {
        id
      }
    }
  }
`

// update user_role in user_projects table
export const UPDATE_ROLE_USER_PROJECTS = gql`
  mutation UpdateRevokeProjectMember (
    $projectId: Int!, $userId: uuid!, $userRole: String!
  ) {
    update_user_projects(
      where: {
        project_id: {_eq: $projectId}, 
        _and: {user_id: {_eq: $userId}}
      }, 
      _set: {user_role: $userRole}
    ) {
      returning {
        id
      }
    }
  }
`

// insert user's default organization. If user already exist, then update is_revoked field.
export const UPSERT_DEFAULT_ORGANIZATION = gql`
  mutation UpsertDefaultOrganization(
    $defaultOrg: default_organization_insert_input!
  ) {
    insert_default_organization_one(
      object: $defaultOrg, 
      on_conflict: {
        constraint: default_organization_pkey, 
        update_columns: is_revoked
      }
    ) {
      user_id
      organization_id
      is_revoked
    }
  }
`

// Insert users into user_organizations table.
export const INSERT_USER_ORGANIZATION = gql`
  mutation InsertUserOrganization(
    $values: user_organizations_insert_input!
  ) {
    insert_user_organizations_one(object: $values) {
      id
    }
  }
`

export const UPDATE_USER_ORGANIZATION_BYKEY = gql`
  mutation updateUserOrganization(
    $id: Int!, $values: user_organizations_set_input
  ) {
    update_user_organizations_by_pk(
      pk_columns: {id: $id}, 
      _set: $values
    ) {
      id
      role
      is_revoked
    }
  }
`

// Get members that are assigned to projects
export const GET_PROJECT_MEMBERS = gql`
  query GetProjectMembers(
    $projectId: Int!
  ) {
    user_projects(
      where: {project_id: {_eq: $projectId}}, 
      order_by: {user: {displayName: asc}}
    ) {
      id
      is_p_revoked
      user_role
      user {
        id
        displayName
        email
        avatarUrl
      }
    }
  }
`

// insert users into user_projects table
export const INSERT_USER_PROJECT = gql`
  mutation InsertUserProject(
    $userProjects: user_projects_insert_input!
  ) {
    insert_user_projects_one(
      object: $userProjects
    ) {
      id
    }
  }
`

// update user_projects table by primary key
export const UPDATE_USER_PROJECTS_BYKEY = gql`
  mutation UpdateUserProjectsByKey(
    $id: Int!, $values: user_projects_set_input!
  ) {
    update_user_projects_by_pk(
      pk_columns: {id: $id}, 
      _set: $values
    ) {
      id
      is_p_revoked
      user_role
    }
  }
`
