import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromAngularFixture } from "./src/from-angular-fixture";
import { isAngularFixture } from "./src/is-angular-fixture";

export const Plugin = createChaiPlugin(isAngularFixture, fromAngularFixture);
