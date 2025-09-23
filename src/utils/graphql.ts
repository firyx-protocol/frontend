import { gql, GraphQLClient } from 'graphql-request';

import { APTOS_GRAPHQL_ENDPOINT } from '@/constants';

export const aptosGraphqlClient = new GraphQLClient(APTOS_GRAPHQL_ENDPOINT);