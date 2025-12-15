/*
  It seems that loading @ts-graphviz/adapter tests for the existence of "dot"
  on the OS. This can cause failures on OS missing it (e.g., CI/CD pipelines)
  even if the save function is never called.

  Rather than aggressively installing Graphivz in every workflow, even when
  no graph is generated, we keep the saving separate from the graph creation.
  This does mean we need to remember to install graphviz in those workflows who
  actually need it.
 */
/*
  The "." default directory is relative to this file for dynamic imports, not
  to the shell invocation directory. So it is always safer to pass the actual
  directory as CLI option, typically using "$(pwd)" to let the shell handle it
 */
import { getPackages, type Packages } from "@manypkg/get-packages";
import * as gv from "ts-graphviz";
import * as adapter from "@ts-graphviz/adapter";

import * as fs from "node:fs";
import path from "node:path";
import { loadJSON } from "../common.js";

import type { DependencyGraph } from "./dependency-graph.js";
import { GraphFactory } from "./helpers.js";

/*
  Usage:
  `yarn generate-dependency-graphs [targetPath] [targetGraph]`
  - targetPath: Path to the root directory of the monorepo. Default: ".",
    prefer explicitly using `$(pwd)`
  - targetGraph: Type of graph to generate. Default: "all". Can be "all",
    "global", or (part of) a package name.

  E.g.:
  `yarn generate-dependency-graphs $(pwd) all`
  `yarn generate-dependency-graphs $(pwd) global`
  `yarn generate-dependency-graphs $(pwd) @siteimprove/alfa-toolchain`
 `yarn generate-dependency-graphs $(pwd) alfa-toolchain`

 */

const targetPath = process.argv[2] ?? ".";
const targetGraph = process.argv[3] ?? "all";
const destinationPath = "docs";
const clustersDefinitionPath = path.join("config", "package-clusters.json");

await generateGraphs(targetPath, targetGraph);

/**
 * Generates and saves both the global dependency graph (between packages of
 * the repository), and the individual ones (between files inside each package).
 *
 * @public
 */
export async function generateGraphs(
  rootDir: string,
  target: string,
): Promise<void> {
  const packages = await getPackages(rootDir);

  if (target === "all" || target === "global") {
    await generateGlobalGraph(rootDir, packages);
  }
  if (target !== "global") {
    await generatePackagesGraphs(packages);
  }

async function generateGlobalGraph(rootDir: string, packages: Packages) {
  try {
    await saveGraph(
      await createGlobalGraph(rootDir, packages),
      path.join(rootDir, destinationPath),
    );
  } catch (error) {
    console.log("Failed at main graph generation:");
    throw error;
  }
}

async function generatePackagesGraphs(packages: Packages) {
  for (const pkg of packages.packages) {
    if (target === "all" || pkg.packageJson.name.includes(target)) {
    try {
      console.log("Generating graph for package:", pkg.packageJson.name);

      await saveGraph(
        await GraphFactory.fromPackage(pkg),
        path.join(pkg.dir, destinationPath),
      );
    } catch (error) {
      console.log(
        `Failed at graph generation for package ${pkg.packageJson.name}:`,
      );
      throw error;
    }
  }}
}

async function createGlobalGraph(
  rootDir: string,
  packages: Packages,
): Promise<DependencyGraph<string, string>> {
  const config = await loadJSON<{
    name: string;
    scope: string;
    clusters: Array<GraphFactory.Global.ClusterDefinition>;
  }>(path.join(rootDir, clustersDefinitionPath));

  return GraphFactory.fromPackagesList(packages, config);
}

async function saveGraph<C, M>(
  graph: DependencyGraph<C, M>,
  dirname: string,
  filename: string = "dependency-graph",
): Promise<void> {
  const dot = gv.toDot(graph.gvGraph);

  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }

  fs.writeFileSync(path.join(dirname, `${filename}.dot`), dot, "utf8");

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

  await adapter.toFile(dot, path.join(dirname, `${filename}.svg`), {
    ...options,
    format: "svg",
  });

  console.info(`Graph saved to ${dirname}`);
}
