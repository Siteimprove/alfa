/*
  It seems that loading @ts-graphviz/adapter tests for the existence of "dot"
  on the OS. This can cause failures on OS missing it (e.g., CI/CD pipelines)
  even if the save function is never called.

  Rather than aggressively installing graphivz in every workflow, even when
  no graph is generated, we keep the saving separate and only import this file
  where it is really needed. This does mean we need to remember to install
  graphviz in those workflows who actually need it.
 */

import * as gv from "ts-graphviz";
import * as adapter from "@ts-graphviz/adapter";

import * as fs from "node:fs";
import * as path from "node:path";

import type { DependencyGraph } from "./dependency-graph.js";

/**
 * Saves a dependency graph, both as .dot and .svg files.
 */
export async function saveGraph<C, M>(
  graph: DependencyGraph<C, M>,
  dirname: string,
  filename: string = "dependency-graph",
): Promise<void> {
  const dot = gv.toDot(graph.gvGraph);

  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }

  fs.writeFileSync(path.join(dirname, `${filename}.dot`), dot, "utf8");

  await adapter.toFile(dot, path.join(dirname, `${filename}.svg`), {
    ...options,
    format: "svg",
  });
}

const options: adapter.Options = {
  attributes: {
    graph: {
      overlap: false,
      pad: 0.3,
      rankdir: "TB",
      layout: "dot",
      bgcolor: "#ffffff",
    },
    edge: { color: "#151515" },
    node: {
      fontname: "Arial",
      fontsize: 14,
      color: "#000000",
      shape: "box",
      style: "rounded",
      height: 0,
      fontcolor: "#000000",
    },
  },
};
