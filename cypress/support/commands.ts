/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
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
Cypress.Commands.add('login', () => {
  cy.visit('/api/google-oauth-cypress');
});

Cypress.Commands.add('mongoRestore', () => {
  cy.exec('./mongorestore.sh').then((data) => {
    // cy.log(data.stdout);
    // cy.log(data.stderr);
    cy.log('performing mongorestore');
    cy.log(data.code.toString() ? '1' : '0');
    // cy.get(data.code.toString()).should('have.text', '0');
    expect(data.code.toString()).to.include('0');
  });
});

Cypress.Commands.add('mongoDump', () => {
  cy.exec('./mongodump.sh').then((data) => {
    // cy.log(data.stdout);
    // cy.log(data.stderr);
    cy.log('performing mongodump');
    cy.log(data.code.toString() ? '1' : '0');
    // cy.get(data.code.toString()).should('have.text', '0');
    expect(data.code.toString()).to.include('0');
  });
});

Cypress.Commands.add('dropDB', () => {
  cy.exec('./mongodrop.sh').then((data) => {
    // cy.log(data.stdout);
    // cy.log(data.stderr);
    cy.log('dropping DB');
    cy.log(data.code.toString() ? '1' : '0');
    // cy.get(data.code.toString()).should('have.text', '0');
    expect(data.code.toString()).to.include('0');
  });
});
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
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

export {};
