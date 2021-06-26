/**
 * An Open eBooks test user
 */
const username = "A3IAYP9NDS";
const password = "9864";

/**
 * Extends cypress's visit command to add authentication
 */
export const visitAuthd = (
  url: string,
  options: Partial<Cypress.VisitOptions>
) => cy.visit(url, { ...options, auth: { username, password } });
