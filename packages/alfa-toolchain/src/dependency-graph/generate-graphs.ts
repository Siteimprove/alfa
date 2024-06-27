import { getPackages } from "@manypkg/get-packages";

import { DependencyGraph } from "./dependency-graph.js";

const targetPath = process.argv[2] ?? ".";

generateGraphs(targetPath);

/**
 * @public
 */
export async function generateGraphs(cwd: string) {
  const packages = await getPackages(cwd);
  for (const pkg of packages.packages) {
    (await DependencyGraph.from(pkg)).save();
  }
}
