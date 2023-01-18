/// <reference lib="dom" />
/// <reference types="cypress" />

// While it may be tempting to pull in @siteimprove/alfa-chai for this module as
// Cypress uses Chai for all its assertion methods, it's a trap! Cypress bundles
// its own copy of the TypeScript typings for Chai and so we have to avoid the
// two being referenced in the same compilation unit as they'd be considered
// incompatible.

import { Asserter, Handler } from "@siteimprove/alfa-assert";
import { Device } from "@siteimprove/alfa-device";
import { Document, Node } from "@siteimprove/alfa-dom";
import { Formatter } from "@siteimprove/alfa-formatter";
import { Hashable } from "@siteimprove/alfa-hash";
import { Request, Response } from "@siteimprove/alfa-http";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Page } from "@siteimprove/alfa-web";

import * as act from "@siteimprove/alfa-act";
import * as device from "@siteimprove/alfa-device/native";
import * as dom from "@siteimprove/alfa-dom/native";
import earl from "@siteimprove/alfa-formatter-earl";

declare global {
  namespace Chai {
    interface Assertion {
      accessible(): Promise<void>;
    }
  }

  namespace Cypress {
    interface Chainer<Subject> {
      (chainer: "be.accessible"): Chainable<Subject>;
      (chainer: "not.be.accessible"): Chainable<Subject>;
    }
  }
}

/**
 * @public
 */
export namespace Cypress {
  export function createPlugin<T extends Hashable, Q = never, S = T>(
    rules: Iterable<act.Rule<Page, T, Q, S>>,
    handlers: Iterable<Handler<Page, T, Q, S>> = [],
    options: Asserter.Options<Page, T, Q, S> = {}
  ): globalThis.Chai.ChaiPlugin {
    const asserter = Asserter.of(rules, handlers, options);

    return (chai) => {
      chai.Assertion.addMethod("accessible", function () {
        const input = toPage(this._obj);

        const result = asserter
          .expect(input)
          .to.be.accessible()

          // Cypress has aversions towards promises and asynchronous functions.
          // We therefore have to synchronously unwrap the future, which it is
          // fortunately designed for. This _will_ panic if the value isn't
          // available, but this shouldn't happen in practice as the assertion
          // handlers can't be asynchronous either.
          // https://github.com/cypress-io/cypress/issues/4742
          .get();

        const message = result.isOk() ? result.get() : result.getErr();

        this.assert(
          result.isOk(),
          `expected #{this} to be accessible${
            result.isErr() ? ` but ${message}` : ""
          }`,
          `expected #{this} to not be accessible${
            result.isOk() ? ` but ${message}` : ""
          }`,
          /* Expected */ true,
          /* Actual */ result.isOk(),
          /* Show diff */ false
        );
      });
    };
  }

  export type Type = globalThis.Node | globalThis.JQuery;

  export function toPage(value: Type): Page {
    if ("jquery" in value) {
      value = value.get(0);
    }

    const nodeJSON = dom.Native.fromNode(value);

    const deviceJSON = device.Native.fromWindow(window);

    return Page.of(
      Request.empty(),
      Response.empty(),
      nodeJSON.type === "document"
        ? Document.from(nodeJSON as Document.JSON)
        : Document.of([Node.from(nodeJSON)]),
      Device.from(deviceJSON)
    );
  }

  export namespace Handler {
    /**
     * @remarks
     * Cypress has this rather odd model of relying on synchronously enqueued
     * hooks and commands to provide a feeling of using a synchronous API. As
     * the handler will run _as part of_ a command, this means that we can't
     * register any additional commands when the handler runs; this must instead
     * be handled beforehand. The handler therefore starts by registering an
     * `after()` hook that will write any files collected during the test run
     * _after_ the tests are done.
     */
    export function persist<I, T extends Hashable, Q, S>(
      output: Mapper<I, string>,
      format: Formatter<I, T, Q, S> = earl()
    ): Handler<I, T, Q, S> {
      const files = new Map<string, string>();

      after(() => {
        for (const [file, data] of files) {
          cy.writeFile(file, data);
        }
      });

      return (input, rules, outcomes, message) => {
        const file = output(input);

        files.set(file, format(input, rules, outcomes) + "\n");

        return `${message}, see the full report at ${file}`;
      };
    }
  }
}
