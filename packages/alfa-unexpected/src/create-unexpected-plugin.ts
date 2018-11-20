/// <reference path="../types/unexpected.d.ts" />

import { expect as assert } from "@siteimprove/alfa-assert";
import { Element } from "@siteimprove/alfa-dom";
import * as expect from "unexpected";

export function createUnexpectedPlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Element
): expect.PluginDefinition {
  return {
    name: "@siteimprove/alfa-unexpected",
    installInto(expect) {
      expect.addType({
        name: "Element",
        base: "object",
        identify,
        inspect: (value, depth, output) => {
          output.text(transform(value).localName);
        }
      });

      expect.addAssertion<T>(
        `<Element> [not] to be accessible`,
        (expect, subject) => {
          const error = assert(transform(subject)).to.be.accessible;

          expect(error, "[not] to be", null);
        }
      );
    }
  };
}
