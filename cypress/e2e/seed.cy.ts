/// <reference types="cypress" />

describe('Testing Database helpers', () => {
  it('Should be able to dump database', () => {
    cy.mongoDump();
  });

  it('Should be able to drop database', () => {
    cy.dropDB();
  });

  it('Should be able to restore database', () => {
    cy.mongoRestore();
  });
});

export {};
