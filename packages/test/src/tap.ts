/// <reference path="./types/tap.d.ts"/>

import * as tap from "tap";

const { test, tearDown: teardown, beforeEach: before, afterEach: after } = tap;

type Test = typeof tap;

export { test, before, after, teardown, Test };
