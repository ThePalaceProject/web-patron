// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/// <reference types="cypress" />

import "@testing-library/cypress/add-commands";
import { BASIC_LOGIN, COOKIE_KEY } from "./utils";
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginByApi(userType: UserType, appType?: AppType): void;
    }
  }
}

type AppType = "OPENEBOOKS" | "SIMPLYE";

type UserType =
  | "ALL_ACCESS_USER"
  | "HIGH_SCHOOL_USER"
  | "MIDDLE_GRADES_USER"
  | "EARLY_GRADES_USER";

function generateToken(username: string, password: string) {
  const btoaStr = btoa(`${username}:${password}`);
  return `Basic ${btoaStr}`;
}

Cypress.Commands.add(
  "loginByApi",
  (userType: UserType, appType: AppType = "OPENEBOOKS") => {
    const username = Cypress.env(`${appType}_${userType}_USERNAME`);
    const password = Cypress.env(`${appType}_${userType}_PW`);
    if (username === "" || !username) {
      throw new Error(
        "Missing username value, set as an environment variable prefixed by CYPRESS_"
      );
    }
    if (password === "" || !password) {
      throw new Error(
        "Missing password value, set as an environment variable prefixed by CYPRESS_"
      );
    }
    const token = generateToken(username, password);
    const credentials = {
      methodType: BASIC_LOGIN,
      token
    };
    cy.clearCookie(COOKIE_KEY);
    cy.setCookie(COOKIE_KEY, JSON.stringify(credentials));
    cy.getCookie(COOKIE_KEY).should("exist");
  }
);

export {};
