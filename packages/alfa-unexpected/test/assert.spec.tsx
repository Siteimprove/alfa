/// <reference path="../types/unexpected.d.ts" />

import { isElement } from "@siteimprove/alfa-assert";
import { jsx } from "@siteimprove/alfa-jsx";
import * as expect from "unexpected";
import { createUnexpectedPlugin } from "../src/create-unexpected-plugin";

expect.use(createUnexpectedPlugin(isElement, input => input));

expect(<img alt="Howdy!" />, "to be accessible");
