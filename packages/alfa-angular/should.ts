import { createShouldPlugin } from "@siteimprove/alfa-should";
import { fromAngularFixture } from "./src/from-angular-fixture";
import { isAngularFixture } from "./src/is-angular-fixture";

export const Plugin = createShouldPlugin(isAngularFixture, fromAngularFixture);
