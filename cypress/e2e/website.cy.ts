describe('Visit website', () => {
  it('Should display h1', () => {
    cy.visit('/');

    cy.get('h1').should('have.text', 'Devgram');
  });
});
