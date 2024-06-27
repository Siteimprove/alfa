import { FunctionMap, registerFunction } from "../function.js";

import { fn } from "./fn.js";

const { keys } = Object;

let functions: FunctionMap = new Map();

for (const func of keys(fn)) {
  functions = registerFunction(functions, fn[func as keyof typeof fn]);
}

export { functions };
