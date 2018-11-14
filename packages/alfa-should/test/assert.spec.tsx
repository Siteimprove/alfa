/// <reference path="../types/should.d.ts" />

import { isElement } from "@siteimprove/alfa-assert";
import { jsx } from "@siteimprove/alfa-jsx";
import * as _ from "should";
import { createShouldPlugin } from "../src/create-should-plugin";

createShouldPlugin(isElement, input => input);

<img alt="Howdy!" />.should.be.accessible;
