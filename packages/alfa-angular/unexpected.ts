import { createUnexpectedPlugin } from "@siteimprove/alfa-unexpected";
import { fromAngularFixture } from "./src/from-angular-fixture";
import { isAngularFixture } from "./src/is-angular-fixture";

// tslint:disable:no-default-export

export default createUnexpectedPlugin(isAngularFixture, fromAngularFixture);
