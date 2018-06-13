import * as assertLax from "assert";

const assertStrict = require("assert").strict;

/**
 * @internal
 */
export const assert: typeof assertLax = assertStrict;
