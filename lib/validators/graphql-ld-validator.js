'use strict';

const Validator = require('./validator');
const util = require('util');

const ERROR_TEMPLATE =
  `Config file validation error for route '%s' - '%s':
        * GraphQL-LD query variables: %s not described in the parameters section.`;

/**
 * Validates the GraphQL-LD sections of the config file.
 *
 * @type {module.GraphQLLDInfoValidator}
 */
module.exports = class GraphQLLDInfoValidator extends Validator {
  constructor() {
    super();
  }

  static validate(routeInfo, graphQLLDInfo, parameters) {
    if (graphQLLDInfo) {
      return this.validateVariables(routeInfo, graphQLLDInfo, parameters);
    } else {
      return false;
    }
  }

  /**
   * Checks if all variables used in the GraphQL-LD query are described in the parameters section.
   *
   * @param routeInfo, (see walder/lib/models/routeInfo.js)
   * @param graphQLLDInfo, (see walder/lib/models/graphQLLDInfo.js)
   * @param parameters, contains all described path and query parameters
   */
  static validateVariables(routeInfo, graphQLLDInfo, parameters) {
    let array = [];
    for(const object of Object.values(graphQLLDInfo.queries)){
      array.push(object.query);
    }
    const queryVariables = array.join('\n').match(/\$[a-zA-Z]+/g);
    if (queryVariables) {
      const unknownVariables = queryVariables.filter((variable) => {
        let varName = variable.slice(1);

        // Pagination variable 'offset' is mapped to 'limit'
        if (varName === 'offset') {
          varName = 'limit';
        }

        return !(varName in parameters);
      });

      if (unknownVariables.length > 0) {
        return util.format(ERROR_TEMPLATE, routeInfo.path, routeInfo.method, unknownVariables.join(', '));
      }
    }
  }
};
