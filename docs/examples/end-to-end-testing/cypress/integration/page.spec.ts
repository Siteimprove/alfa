/// <reference types="@siteimprove/alfa-cypress/chai" />

it("should be accessible", () => {
  cy.visit("/fixtures/page.html");
  cy.document().should("be.accessible");
});
