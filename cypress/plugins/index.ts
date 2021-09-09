/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
/**
 * @type {Cypress.PluginConfig}
 */

require("dotenv").config({ path: ".env.local" });

module.exports = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
) => {
  config.env.OPENEBOOKS_ALL_ACCESS_USER_USERNAME =
    process.env.OPENEBOOKS_ALL_ACCESS_USER_USERNAME;
  config.env.OPENEBOOKS_ALL_ACCESS_USER_PW =
    process.env.OPENEBOOKS_ALL_ACCESS_USER_PW;
  config.env.OPENEBOOKS_HIGH_SCHOOL_USER_USERNAME =
    process.env.OPENEBOOKS_HIGH_SCHOOL_USER_USERNAME;
  config.env.OPENEBOOKS_HIGH_SCHOOL_USER_PW =
    process.env.OPENEBOOKS_HIGH_SCHOOL_USER_PW;
  config.env.OPENEBOOKS_MIDDLE_GRADES_USER_USERNAME =
    process.env.OPENEBOOKS_MIDDLE_GRADES_USER_USERNAME;
  config.env.OPENEBOOKS_MIDDLE_GRADES_USER_PW =
    process.env.OPENEBOOKS_MIDDLE_GRADES_USER_PW;
  config.env.OPENEBOOKS_EARLY_GRADES_USER_USERNAME =
    process.env.OPENEBOOKS_EARLY_GRADES_USER_USERNAME;
  config.env.OPENEBOOKS_EARLY_GRADES_USER_PW =
    process.env.OPENEBOOKS_EARLY_GRADES_USER_PW;
  config.env.OPENEBOOKS_CLEVER_HIGH_SCHOOL_ACCESS_TOKEN =
    process.env.OPENEBOOKS_CLEVER_HIGH_SCHOOL_ACCESS_TOKEN;

  return config;
};

export {};
