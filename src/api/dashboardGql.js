import { gql } from "@apollo/client";

export const GET_TOTAL_SPECIES_IDENTIFIED = gql `
  query TotalSpeciesIdentified (
    $projectId: Int!
  ) {
    image_species_aggregate(
      where: {
        image: {project_id: {_eq: $projectId}}, 
        _and: {
          species: {taxonomy_subtype: {_in: ["wild-animal", "domestic-animal"]}}
        }
      },
      distinct_on: species_id
    ) {
      aggregate {
        count
      }
    }
  }
`

export const GET_TOTAL_IMAGES = gql`
  query GetTotalImages(
    $projectId: Int!
  ) {
    images_aggregate(where: {project_id: {_eq: $projectId}}) {
      aggregate {
        count
      }
    }
  }
`
export const GET_TOTAL_WILDLIFE_IMAGES = gql`
  query TotalWildlifeImages($projectId: Int!) {
    image_species_aggregate(
      where: {
        image: {project_id: {_eq: $projectId}}, 
        _and: {
          species: {taxonomy_subtype: {_in: ["wild-animal", "domestic-animal"]}}
        }
      }, 
      distinct_on: image_file_id) {
      aggregate {
        count
      }
    }
  }
`

export const GET_TOTAL_PROJ_LOCATIONS = gql`
  query GetTotalLocations(
    $projectId: Int!
  ) {
    locations_aggregate(
      where: {project_id: {_eq: $projectId}}
    ) {
      aggregate {
        count
      }
    }
  }
`

export const GET_TOTAL_CHECKS = gql `
  query GetTotalChecks (
    $projectId: Int!
  ) {
    deployments_aggregate(
      where: {project_id: {_eq: $projectId}}
    ) {
      aggregate {
        count
      }
    }
  }
`

export const GET_TOTAL_PROJ_CAMERAS = gql `
  query GetTotalProjectCameras(
    $projectId: Int!
  ) {
    cameras_aggregate(
      where: {deployments: {project_id: {_eq: $projectId}}}
    ) {
      aggregate {
        count
      }
    }
  }
`

export const GET_PROJECT_SAMPLING_DAYS = gql `
  query GetProjectSamplingDays(
    $projectId: Int!
  ) {
    sampling_days_view_aggregate(
      where: {project_id: {_eq: $projectId}}
    ) {
      aggregate {
        sum {
          distinct_date_count
        }
      }
    }
  }
`

export const IMAGE_COUNT_PER_SPECIES = gql `
  query ImageCountPerSpecies(
    $projectId: Int!
  ) {
    image_count_per_species(
      where: {
        project_id: {_eq: $projectId}, 
        _and: {taxonomy_subtype: {_in: ["wild-animal", "domestic-animal"]}}
      }
    ) {
      common_name
      image_count
    }
  }
` 