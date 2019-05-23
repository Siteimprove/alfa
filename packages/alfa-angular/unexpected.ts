import { createUnexpectedPlugin } from "@siteimprove/alfa-unexpected";
import { fromAngularFixture } from "./src/from-angular-fixture";
import { isAngularFixture } from "./src/is-angular-fixture";

export const Plugin = createUnexpectedPlugin(
  isAngularFixture,
  fromAngularFixture
);
