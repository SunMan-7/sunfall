import { gql } from '@apollo/client';

// Fetch all data from the individuals table including rosettee and species
export const GET_INDIVIDUALS = gql`
  query GetIndividuals {
    individuals(order_by: {id: asc}) {
      id
      code_name
      remarks 
      age
      sex 
      year_discovered   
      rosettes {
        file_id
        side
      }
      species {
        id
        common_name
        scientific_name
      }
    }
  }
`

// Fetch names from the individuals table
export const GET_INDIVIDUAL_BY_SPECIES= gql`
  query GetIndividualBySpeciesId(
    $speciesId: Int!
  ) {
    individuals(
      order_by: {id: asc}, 
      where: {species_id: {_eq: $speciesId}}
    ) {
      id
      individual_name
      code_name
    }
  }
`
// Fetch name and rosettes from the individuals table based on species id
export const GET_INDIVIDUALS_ROSETTES_SPECIESID = gql`
  query GetIndividualsRosettesBySpeciesId(
    $speciesId: Int!
  ) {
    individuals(
      where: {species_id: {_eq: $speciesId}}
    ) {
      id
      individual_name
      rosettes {
        file_id
        side
      }
    }
  }
`

// Insert a new row in the individual table
export const ADD_INDIVIDUAL = gql`
  mutation AddIndividual(
    $individualName: String!, $age: String,
    $sex: bpchar, $markings: String, 
    $remarks: String, $speciesId: Int!
  ) {
    insert_individuals_one(
      object: {
        age: $age, individual_name: $individualName, 
        markings: $markings, remarks: $remarks, 
        sex: $sex, species_id: $speciesId
      }
    ) {
      id
    }
  }
`

// insert a single row into the table: "individuals"
export const INSERT_INDIVIDUAL_ONE = gql`
  mutation InsertIndividualOne(
    $values: individuals_insert_input!
  ){
    insert_individuals_one(
      object: $values, 
    ) {
      id
    }
  }
`

//     on_conflict: {constraint: individuals_code_name_key}

// upsert data into the table: "individuals" (ideal for batch upload from CSV file)
export const UPSERT_INDIVIDUALS_MANY = gql`
  mutation UpsertIndividualsMany(
    $values: [individuals_insert_input!]!
  ) {
    insert_individuals(
      objects: $values, 
      on_conflict: {
        constraint: individuals_code_name_key, 
        update_columns: [age, sex, species_id, year_discovered, remarks]
      }
    ) {
      affected_rows
    }
  }
`

// update single row of the table: "individuals" by primary key
export const UPDATE_INDIVIDUAL_BYID = gql`
  mutation UpdateIndividualById(
    $individualId: Int!
    $values: individuals_set_input   
  ) {
    update_individuals_by_pk(
      pk_columns: {id: $individualId}, 
      _set: $values
    ) {
      id
    }
  }
`

// Update a row in the individual table
export const UPDATE_INDIVIDUAL = gql`
  mutation UpdateIndividual (
    $individualId: Int!, $age: String,
    $individualName: String!,
    $markings: String, $remarks: String,
    $sex: bpchar, $speciesId: Int!
  ) {
    update_individuals_by_pk(
      pk_columns: {id: $individualId}, 
      _set: {
        age: $age, 
        individual_name: $individualName, 
        markings: $markings, 
        remarks: $remarks, 
        sex: $sex, 
        species_id: $speciesId
      }
    ) {
      id
    }
  }
`

// Fetch data from image table by individual id
export const GET_IMAGES_BY_INDIVIDUAL = gql`
  query GetImagesByIndividual(
    $individualId: Int!
  ) {
    images(
      order_by: {date_taken: desc}, 
      where: {
        image_species: {
          image_individuals: {individual_id: {_eq: $individualId}}
        },
        _and: {is_highlighted: {_eq: true}},
      },
      limit: 5
    ) {      
      file_id
      file_name
      date_taken
    }
  }
`