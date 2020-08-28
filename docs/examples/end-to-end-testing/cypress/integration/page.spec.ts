/// <reference types="cypress" />

it("should be accessible", () => {
  cy.visit("/fixtures/page.html");
  cy.document().audit();
});
