/// <reference types="node"/>

import { Node, Root, Parent } from "./types";

const vfile = require("vfile");
const { Parser } = require("remark-parse");

function clean(node: Node) {
  // Remove positional information added by Remark.
  delete (node as any).position;

  if ("children" in node) {
    (node as Parent).children.forEach(clean);
  }
}

export function parse(markdown: string): Root {
  const parser = new Parser(null, vfile(markdown));
  const parsed = parser.parse();

  clean(parsed);

  return parsed;
}
