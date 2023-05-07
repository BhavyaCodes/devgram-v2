import { faker } from '@faker-js/faker';

const text = faker.company.catchPhrase();

describe('Logged in user should be able to submit new post', () => {
  before(() => {
    cy.mongoDump();
  });

  after(() => {
    cy.dropDB();
    cy.mongoRestore();
  });

  it('Submit post logged in user', () => {
    cy.login();
    cy.get('[data-cy="post-content"]').contains(text).should('not.exist');
    cy.get('[data-cy="post-input"]').type(text);
    cy.get('[data-cy="submit-post-button"]').click();
    cy.get('[data-cy="post-content"]').contains(text).should('exist');

    //make sure input is empty after submitting
    cy.get('[data-cy="post-input"]').should('have.text', '');
  });

  it("unauthenticated user shouldn't be able to see input box", () => {
    cy.visit('/');

    cy.get('[data-cy="post-input"]').should('not.exist');
  });
});

export {};
