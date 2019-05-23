import { createJasminePlugin } from "@siteimprove/alfa-jasmine";
import { fromAngularFixture } from "./src/from-angular-fixture";
import { isAngularFixture } from "./src/is-angular-fixture";

createJasminePlugin(isAngularFixture, fromAngularFixture);
