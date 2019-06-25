import { Map } from "@siteimprove/alfa-collection";
import { values } from "@siteimprove/alfa-util";
import { FunctionMap, registerFunction } from "../function";

import { fn } from "./fn";

let functions: FunctionMap = Map();

for (const func of [...values(fn)]) {
  functions = registerFunction(functions, func);
}

export { functions };
