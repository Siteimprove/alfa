/// <reference types="node"/>

import { Node } from "./types";

const { Compiler } = require("remark-stringify");

export function render<T extends Node>(node: T): string {
  const compiler = new Compiler(node);
  return compiler.compile();
}
