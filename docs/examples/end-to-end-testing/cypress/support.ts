import * as alfa from "@siteimprove/alfa-cypress";

import rules from "@siteimprove/alfa-rules";
import json from "@siteimprove/alfa-formatter-json";

alfa.Cypress.createPlugin(rules, [
  (input, outcomes, message) => {
    cy.writeFile("outcomes/page.spec.json", json()(input, outcomes));

    return `${message}, see the full report at outcomes/page.spec.json`;
  },
]);
