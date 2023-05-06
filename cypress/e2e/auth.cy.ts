describe('Test Auth', () => {
  it('Should display h1', () => {
    cy.visit('/');
    cy.get('[data-cy="welcome-text]"').should('not.exist');
    cy.login();
    cy.get('[data-test="welcome-text"]').should('exist');
  });
});

export {};
