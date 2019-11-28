/// <reference path="../types/unexpected.d.ts" />

import { Assert } from "@siteimprove/alfa-assert";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";
import * as unexpected from "unexpected";

// tslint:disable:callable-types

declare module "unexpected" {
  interface Expect {
    (
      subject: unknown,
      assertionName: "to be accessible" | "not to be accessible"
    ): Promise<void>;
  }
}

export namespace Unexpected {
  export function createPlugin<T>(
    identify: Predicate<unknown, T>,
    transform: Mapper<T, Page>
  ): unexpected.PluginDefinition {
    return {
      name: "@siteimprove/alfa-unexpected",
      installInto(unexpected) {
        unexpected.addType({
          name: "Element",
          base: "object",
          identify(value: unknown): value is T {
            return identify(value);
          },
          inspect(value, depth, output) {
            output.text(`${value}`);
          }
        });

        unexpected.addAssertion<T>(
          `<Element> [not] to be accessible`,
          (expect, subject) => {
            const page = transform(subject);

            return Assert.Page.isAccessible(page).map(error => {
              expect(error.isNone(), "[not] to be", true);
            });
          }
        );
      }
    };
  }
}
