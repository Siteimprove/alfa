import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromAngularFixture } from "./src/from-angular-fixture";
import { isAngularFixture } from "./src/is-angular-fixture";

// tslint:disable:no-default-export

export default createChaiPlugin(isAngularFixture, fromAngularFixture);
