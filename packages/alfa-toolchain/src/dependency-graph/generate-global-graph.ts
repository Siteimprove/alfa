import path from "node:path";
import { createGlobalGraph } from "./create-global-graph.js";
import { saveGraph } from "./save-graph.js";

const targetPath = process.argv[2] ?? ".";
const destinationPath = "docs";

await generateGlobalGraph(targetPath);

/**
 * Generates and saves global dependency graph for the repository.
 *
 * @remarks
 * This requires graphviz to be installed on the OS, even just importing this
 * file requires so, as @ts-graphviz/adapter tests for its presence upon load.
 *
 * The "." directory is relative to this file for dynamic imports, not to the
 * shell invocation directory. So it is always safer to pass the actual root
 * directory as CLI option, typically using "$(pwd)" to let the shell handle it
 *
 * @public
 */
export async function generateGlobalGraph(rootDir: string) {
  const graph = await createGlobalGraph(targetPath);

  await saveGraph(graph, path.join(rootDir, destinationPath));
}
