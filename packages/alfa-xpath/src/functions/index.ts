import { FunctionMap, registerFunction } from "../function";

import { fn } from "./fn";

const { keys } = Object;

let functions: FunctionMap = new Map();

for (const func of keys(fn)) {
  functions = registerFunction(functions, fn[func as keyof typeof fn]);
}

export { functions };
