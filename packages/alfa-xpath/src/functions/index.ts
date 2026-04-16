import { type FunctionMap, registerFunction } from "../function.ts";

import { fn } from "./fn.ts";

const { keys } = Object;

let functions: FunctionMap = new Map();

for (const func of keys(fn)) {
  functions = registerFunction(functions, fn[func as keyof typeof fn]);
}

export { functions };
