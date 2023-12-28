describe('a11y tests', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit('/');
  });

  //Image
  it('Image (/content-types/image)', () => {
    cy.navigate('/content-types/image');
    cy.wait(2000);
    cy.injectAxe();
    cy.configureAxe();
    cy.checkAccessibility();
  });
});