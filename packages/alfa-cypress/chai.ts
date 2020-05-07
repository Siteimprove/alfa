/// <reference types="cypress" />

import { Chai } from "@siteimprove/alfa-chai";
import { Future } from "@siteimprove/alfa-future";

import { Cypress } from "./src/cypress";

declare global {
  namespace Cypress {
    interface Chainer<Subject> {
      (chainer: "be.accessible"): Chainable<Subject>;
      (chainer: "not.be.accessible"): Chainable<Subject>;
    }
  }
}

export default Chai.createPlugin(Cypress.isType, (value) =>
  Future.now(Cypress.asPage(value))
);
