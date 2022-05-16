/// <reference types="cypress" />

import { makeServer } from '../../miragejs/server';

context('Store', () => {
  let server;
  const get = cy.get;
  const gid = cy.getByTestId;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should display the store', () => {
    server.createList('product', 10);

    cy.visit('/');
    get('body').contains('Brand');
    get('body').contains('Wrist Watch');
  });

  context('Store > Search for Products', () => {
    it('should type in the search field', () => {
      const type = 'Some text here';

      cy.visit('/');
      get('input[type="search"]').type(type).should('have.value', type);
    });

    it('should type in the search field and submit to search and filter the data and return 1 product', () => {
      const productName = 'Beautiful Watch';

      server.create('product', {
        title: productName,
      });
      server.createList('product', 10);

      cy.visit('/');
      get('input[type="search"]').type(productName);
      gid('search-form').submit();
      gid('product-card').should('have.length', 1);
    });

    it('should not return any product when there is no product with the filter passed', () => {
      server.createList('product', 10);

      cy.visit('/');
      get('input[type="search"]').type('An Awesome Product');
      gid('search-form').submit();
      gid('product-card').should('have.length', 0);
      get('body').contains('0 Products');
    });
  });

  context('Store > Product List', () => {
    it('should display "0 Products" when no product is returned', () => {
      cy.visit('/');
      gid('product-card').should('have.length', 0);
      get('body').contains('0 Products');
    });

    it('should display "1 Product" when 1 product is returned', () => {
      server.create('product');

      cy.visit('/');
      gid('product-card').should('have.length', 1);
      get('body').contains('1 Product');
    });

    it('should display "10 Products" when 10 products are returned', () => {
      server.createList('product', 10);

      cy.visit('/');
      gid('product-card').should('have.length', 10);
      get('body').contains('10 Products');
    });
  });

  context('Store > Shopping Cart', () => {
    const quantity = 10;

    beforeEach(() => {
      server.createList('product', quantity);

      cy.visit('/');
    });

    it('should not display shopping cart when page first loads', () => {
      gid('shopping-cart').should('have.class', 'hidden');
    });

    it('should toggle shopping cart visibility when page toggle cart button is clicked', () => {
      gid('shopping-cart').as('shoppingCart');

      gid('toggle-button').click();
      get('@shoppingCart').should('not.have.class', 'hidden');
      gid('close-button').click();
      get('@shoppingCart').should('have.class', 'hidden');
    });

    it('should not display "Clear cart" button when cart is empty', () => {
      gid('toggle-button').click();
      gid('clear-cart-button').should('not.exist');
    });

    it('should display "Cart is empty" message when there are no products', () => {
      gid('shopping-cart').as('shoppingCart');

      gid('toggle-button').click();
      get('@shoppingCart').should('not.have.class', 'hidden');
      get('@shoppingCart').should('contain.text', 'Cart is empty');
    });

    it('should open shopping cart when a product is added', () => {
      gid('product-card').first().find('button').click();
      gid('shopping-cart').should('not.have.class', 'hidden');
    });

    it('should add first product to the cart', () => {
      gid('product-card').first().find('button').click();
      gid('cart-item').should('have.length', 1);
    });

    it('should add 3 products to the cart', () => {
      cy.addToCart({ indexes: [1, 4, 6] });
      gid('cart-item').should('have.length', 3);
    });

    it('should add 1 product to the cart', () => {
      cy.addToCart({ index: 4 });
      gid('cart-item').should('have.length', 1);
    });

    it('should add all products to the cart', () => {
      cy.addToCart({ indexes: 'all' });
      gid('cart-item').should('have.length', quantity);
    });

    it('should remove a product from cart', () => {
      cy.addToCart({ index: 2 });

      gid('cart-item').as('cartItems');

      get('@cartItems').should('have.length', 1);

      get('@cartItems').first().find('[data-testid="remove-button"]').click();

      get('@cartItems').should('have.length', 0);
    });

    it('should clear cart when "Clear cart" button is clicked', () => {
      cy.addToCart({ indexes: [0, 1, 2] });

      gid('cart-item').as('cartItems');
      get('@cartItems').should('have.length', 3);

      gid('clear-cart-button').click();

      get('@cartItems').should('have.length', 0);
    });

    it('should display quantity 1 when product is added to cart', () => {
      cy.addToCart({ index: 4 });

      gid('cart-item').should('have.length', 1);
      gid('quantity').should('contain.text', 1);
    });

    it('should increase quantity when increase button gets clicked', () => {
      cy.addToCart({ index: 4 });

      gid('cart-item').should('have.length', 1);
      gid('quantity').should('contain.text', 1);
      gid('add-button').click();
      gid('quantity').should('contain.text', 2);
    });

    it('should decrease quantity when decrease button gets clicked', () => {
      cy.addToCart({ index: 4 });

      gid('cart-item').should('have.length', 1);
      gid('quantity').should('contain.text', 1);
      gid('subtract-button').click();
      gid('quantity').should('contain.text', 0);
    });

    it('should not decrease below zero when decrease button gets clicked', () => {
      cy.addToCart({ index: 4 });

      gid('cart-item').should('have.length', 1);
      gid('quantity').should('contain.text', 1);
      gid('subtract-button').click();
      gid('subtract-button').click();
      gid('subtract-button').click();
      gid('quantity').should('contain.text', 0);
    });
  });
});
