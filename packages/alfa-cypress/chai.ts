/// <reference types="cypress" />

import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromCypressElement } from "./src/from-cypress-element";
import { isCypressElement } from "./src/is-cypress-element";

// tslint:disable:no-default-export

declare global {
  namespace Cypress {
    interface Chainer<Subject> {
      (chainer: "be.accessible"): Chainable<Subject>;
      (chainer: "not.be.accessible"): Chainable<Subject>;
    }
  }
}

export default createChaiPlugin(isCypressElement, fromCypressElement);
