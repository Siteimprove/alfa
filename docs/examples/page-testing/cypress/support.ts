/// <reference types="node" />

import * as alfa from "@siteimprove/alfa-cypress";

import rules from "@siteimprove/alfa-rules";
import earl from "@siteimprove/alfa-formatter-earl";

Cypress.Commands.add(
  ...alfa.Cypress.createCommand(rules, [
    (input, outcomes, message) => {
      cy.writeFile("outcomes/page.spec.json", earl()(input, outcomes));

      return `${message}, see the full report in the log`;
    },
  ])
);
