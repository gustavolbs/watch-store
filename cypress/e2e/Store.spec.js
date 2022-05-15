/// <reference types="cypress" />

import { makeServer } from '../../miragejs/server';

context('Store', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should display the store', () => {
    server.createList('product', 10);

    cy.visit('http://localhost:3000');
    cy.get('body').contains('Brand');
    cy.get('body').contains('Wrist Watch');
  });

  context('Store > Search for Products', () => {
    it('should type in the search field', () => {
      const type = 'Some text here';

      cy.visit('http://localhost:3000');
      cy.get('input[type="search"]').type(type).should('have.value', type);
    });

    it('should type in the search field and submit to search and filter the data and return 1 product', () => {
      const productName = 'Beautiful Watch';

      server.create('product', {
        title: productName,
      });
      server.createList('product', 10);

      cy.visit('http://localhost:3000');
      cy.get('input[type="search"]').type(productName);
      cy.get('[data-testid="search-form"]').submit();
      cy.get('[data-testid="product-card"]').should('have.length', 1);
    });

    it('should not return any product when there is no product with the filter passed', () => {
      server.createList('product', 10);

      cy.visit('http://localhost:3000');
      cy.get('input[type="search"]').type('An Awesome Product');
      cy.get('[data-testid="search-form"]').submit();
      cy.get('[data-testid="product-card"]').should('have.length', 0);
      cy.get('body').contains('0 Products');
    });
  });

  // context.only('Store > Product List', () => {})
});
