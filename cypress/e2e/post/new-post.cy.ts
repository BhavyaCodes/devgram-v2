import { faker } from '@faker-js/faker';

const text = faker.company.catchPhrase();

describe('User Should be able to submit new post', () => {
  it('Submit post', () => {
    cy.login();
    // cy.get('')
    cy.get('[data-cy="post-content"]').contains(text).should('not.exist');
    cy.get('[data-cy="post-input"]').type(text);
    cy.get('[data-cy="submit-post-button"]').click();
    cy.get('[data-cy="post-content"]').contains(text).should('have.length', 1);

    // cy.get('[data-cy="welcome-text]"').should('not.exist');
    // cy.login();
    // cy.get('[data-test="welcome-text"]').should('exist');
  });
});

export {};
