import { gql } from '@apollo/client';
import { LOCATION_NAME_FIELDS } from './fragmentGql';
import { SITE_NAME_FIELDS } from './fragmentGql';

export const GET_LOCATIONS = gql `
  ${LOCATION_NAME_FIELDS}, ${SITE_NAME_FIELDS}
  query GetLocations(
    $organizationId: Int!
  ) {
    locations(
      order_by: {id: asc},
      where: {organization_id: {_eq: $organizationId}}
    ) {
      ...LocationNameFields
      x      
      y
      remarks
    }
  }
`

export const GET_LOCATION_NAMES = gql `
  ${LOCATION_NAME_FIELDS}
  query GetLocationNames {
    locations(order_by: {id: asc}) {
      ...LocationNameFields     
    }
  }
`

// Fetch all locations within a specific project
export const GET_PROJECT_LOCATIONS = gql `
  query GetProjectLocations(
    $projectId: Int!
  ) {
    locations(
      order_by: {id: desc},
      where: {project_id: {_eq: $projectId}}
    ) {
      id
      location_name
      x      
      y
      remarks
    }
  }
`

// insert a row of data into the locations table
// export const INSERT_LOCATION = gql`
//   mutation InsertLocationOne (
//     $location: locations_insert_input!
//   ) {
//     insert_locations_one(
//       on_conflict: {
//         constraint: locations_location_name_key,
//       }, 
//       object: $location
//     ) {
//       id
//     }
//   }
// `

export const INSERT_LOCATION = gql `
  mutation InsertLocationOne(
    $location: locations_insert_input!
  ) {
    insert_locations_one(object: $location) {
      id
      location_name
    }
  }
`

// insert multiple rows of data into the locations table
export const INSERT_LOCATIONS_MANY = gql`
  mutation InsertLocations(
    $values: [locations_insert_input!]!
  ) {
    insert_locations(
      objects: $values, 
      on_conflict: {
        constraint: locations_location_name_project_id_key,
        update_columns: [x, y, remarks]
      }
    ) {
      returning {
        id
      }
    }
  }
`

//update a row in locations table 
export const UPDATE_LOCATION_BYID = gql`
  mutation UpdateLocation (
    $locationId: Int!, $location: locations_set_input
  ) {
    update_locations_by_pk(
      pk_columns: {id: $locationId}, 
      _set: $location
    ) {
      id
    }
  }
`

export const ADD_LOCATION= gql `
  mutation AddLocation(
    $locationName: String!, $longitude: float8!,
    $latitude: float8!, $siteId: Int,
    $region: String, $remarks: String
  ) {
    insert_locations_one(
      object: {
        location_name: $locationName, longitude: $longitude, 
        latitude: $latitude, site_id: $siteId, 
        region: $region, remarks: $remarks    }
    ) {
      id
    }
  }
`
