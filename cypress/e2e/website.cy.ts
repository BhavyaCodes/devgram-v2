describe('Visit website', () => {
  it('Should display h1', () => {
    cy.visit('/');
    // cy.exec('./mongorestore.sh').then((data) => {
    //   cy.log(data.stdout);
    //   cy.log(data.stderr);
    //   cy.log(data.code.toString());
    // });

    // cy.exec('./mongodump.sh').then((data) => {
    //   cy.log(data.stdout);
    //   cy.log(data.stderr);
    //   cy.log(data.code.toString());
    // });
    cy.get('h1').should('have.text', 'Devgram');
  });
});

export {};
