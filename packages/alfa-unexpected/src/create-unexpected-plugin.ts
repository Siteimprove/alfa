/// <reference path="../types/unexpected.d.ts" />

import { AssertionError, expect as assert } from "@siteimprove/alfa-assert";
import { Element, serialize } from "@siteimprove/alfa-dom";
import { highlight } from "@siteimprove/alfa-highlight";
import * as unexpected from "unexpected";

// tslint:disable:callable-types

declare module "unexpected" {
  interface Expect {
    (
      subject: Element,
      assertionName: "to be accessible" | "not to be accessible"
    ): Promise<void>;
  }
}

export function createUnexpectedPlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Element
): unexpected.PluginDefinition {
  return {
    name: "@siteimprove/alfa-unexpected",
    installInto(unexpected) {
      unexpected.addType({
        name: "Element",
        base: "object",
        identify,
        inspect: (value, depth, output) => {
          const element = transform(value);

          output.text(highlight("html", serialize(element, element)));
        }
      });

      unexpected.addAssertion<T>(
        `<Element> [not] to be accessible`,
        (expect, subject) => {
          let error: AssertionError | null = null;
          try {
            assert(transform(subject)).to.be.accessible;
          } catch (err) {
            if (err instanceof AssertionError) {
              error = err;
            } else {
              throw err;
            }
          }

          expect(error, "[not] to be", null);
        }
      );
    }
  };
}
