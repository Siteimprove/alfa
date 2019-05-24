/// <reference types="@siteimprove/alfa-chai" />

it("should be accessible", () => {
  cy.visit("/fixtures/page.html");

  cy.document().then(document => {
    expect(document).to.be.accessible;
  });
});
