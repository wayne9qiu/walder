'use strict';

const validator = require('./validator');

// Contains all used sub validators.
const VALIDATORS = {
  GraphQLLD: require('./graphql-ld-validator')
};

/**
 * Validates the input configuration file by using other section specific sub validators.
 * Sub validators are added by adding them to the constant VALIDATORS above.
 *
 * Keeps all found errors in the 'errors' property.
 *
 * @type {module.MainValidator}
 */
module.exports = class MainValidator extends validator {
  constructor() {
    super();

    this.errors = {};

    Object.keys(VALIDATORS).forEach((type) => {
      this.errors[type] = [];
    });

    // Latest errors
    this.prevErrors = {};
  }

  /**
   * Validate the current route/method.
   *
   * @param routeInfo, (see walder/lib/models/routeInfo.js)
   * @param graphQLLDInfo, (see walder/lib/models/graphQLLDInfo.js)
   * @param parameters, (see walder/lib/parsers/parameterParser.js)
   */
  validate(routeInfo, graphQLLDInfo, parameters) {
    this.prevErrors = {};

    let hasError = false;

    Object.keys(this.errors).forEach((type) => {
      const errors = VALIDATORS[type].validate(routeInfo, graphQLLDInfo, parameters);
      if (errors) {
        hasError = true;
        this.prevErrors[type] = errors;
        this.errors[type].push(errors);
      }
    });

    return hasError;
  }

  /**
   * If errors were found, throw them.
   */
  finish() {
    let hasErrors = false;

    const output = ['Config file validation errors:\n'];

    Object.keys(this.errors).forEach((type) => {
      if (this.errors[type].length > 0) {
        output.push(` #${type}:`);

        for (const error of this.errors[type]) {
          hasErrors = true;

          output.push(`    - ${error}`);
        }
      }
    });

    if (hasErrors) {
      throw new Error(output.join('\n'));
    }
  }
};
