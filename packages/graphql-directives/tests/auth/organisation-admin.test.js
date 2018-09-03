'use strict';

const AuthDirective = require('../../directives/auth');
const { graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const testUtils = require('../test-utils');

const schema = makeExecutableSchema({
  typeDefs: [
    `
      type Query {
        hello: String @auth(roles: [ORGANISATION_ADMIN])
      }
    `
  ],
  resolvers: {
    Query: {
      hello: () => 'world'
    }
  },
  schemaDirectives: {
    auth: AuthDirective
  }
});

describe('auth directive - ORGANISATION_ADMIN', () => {
  const query = `
    query {
      hello
    }
  `;

  it('should only allow ORGANISATION_ADMINs to run the resolver', () => {
    return graphql(schema, query, null, { viewer: testUtils.generateOrganisationAdminViewer() })
    .then(res => {
      expect(res.data.hello).toEqual('world');
    });
  });

  it('should not resolve the value for non ORGANISATION_ADMINs', () => {
    return graphql(schema, query, null, { viewer: testUtils.generateViewer() })
    .then(res => {
      expect(res.data.hello).toEqual(null);
    });
  });

  it('should not resolve if the viewer is not an organisation admin of their CURRENT organisation', () => {
    return graphql(schema, query, null, { viewer: testUtils.generateInvalidOrganisationAdminViewer() })
    .then(res => {
      expect(res.data.hello).toEqual(null);
    });
  });
});