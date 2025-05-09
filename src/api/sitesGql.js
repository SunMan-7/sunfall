import { gql } from '@apollo/client';
import { SITE_NAME_FIELDS } from './fragmentGql';

export const GET_SITE_NAMES = gql `
${SITE_NAME_FIELDS}
  query GetSiteNames {
    sites {
      ...SiteNameFields
    }
  }
`