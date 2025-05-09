import { gql } from '@apollo/client';

//queries a list of species from the database
export const GET_SPECIES = gql `
  query GetSpecies {
    species(order_by: {id: asc}) {
      id
      class
      order
      family
      genus
      species
      taxon_level
      authority
      common_name
      taxonomy_type
      taxonomy_subtype
      scientific_name
    }
  }
`

export const GET_PROJECT_SPECIES = gql`
  query GetProjectSpecies(
    $projectId: Int!
  ) {
    species(
      where: {
        image_species: {image: {project_id: {_eq: $projectId}}}
      }
    ) {
      id
      common_name
      genus
      species
    }
  }
`

// Insert multiple rows of data into the species table
export const INSERT_SPECIES_BULK = gql `
  mutation InsertSpeciesBulk(
    $values: [species_insert_input!]!
  ) {
    insert_species(
      objects: $values, 
      on_conflict: {constraint: species_taxonid_unique}
    ) {
      affected_rows
    }
  }
`

// Insert a single row of data into the species table
export const INSERT_SPECIES_ONE = gql`
  mutation InsertSpeciesOne(
    $values: species_insert_input!
  ) {
    insert_species_one(
      object: $values, 
      on_conflict: {constraint: species_taxonid_unique}
    ) {
      id
    }
  }
`

// Update a single row of data in the species table
export const UPDATE_SPECIES_BY_ID = gql `
  mutation UpdateSpeciesById(
    $speciesId: Int!,
    $values: species_set_input    
  ) {
    update_species_by_pk(
      pk_columns: {id: $speciesId}, 
      _set: $values
    ) {
      id
    }
  }
`

//adds species to the database
export const ADD_SPECIES = gql `
  mutation AddSpecies (
    $commonName: String!, $speciesName: String,
    $category: String, $remarks: String, $class: String
    ) {
    insert_species_one(
      object: {
        common_name: $commonName, 
        species_name: $speciesName, 
        category: $category, 
        remarks: $remarks
        class: $class
      }
    ) {
      id
    }
  }
`

export const UPDATE_SPECIES_BYID = gql`
  mutation UpdateSpeciesById(
    $speciesId: Int!, $commonName: String,
    $speciesName: String, $category: String,
    $className: String, $remarks: String  
  ) {
    update_species_by_pk(
      pk_columns: {id: $speciesId}, 
      _set: {
        common_name: $commonName, 
        species_name: $speciesName, 
        category: $category, 
        class: $className, 
        remarks: $remarks
      }
    ) {
      id
    }
  }
`
