import { createJestPlugin } from "@siteimprove/alfa-jest";
import { fromAngularFixture } from "./src/from-angular-fixture";
import { isAngularFixture } from "./src/is-angular-fixture";

createJestPlugin(isAngularFixture, fromAngularFixture);
