import path from "node:path";
import { createGlobalGraph } from "./create-global-graph.js";
import { saveGraph } from "./save-graph.js";

const targetPath = process.argv[2] ?? ".";
const destinationPath = "docs";

await generateGlobalGraph(targetPath);

export async function generateGlobalGraph(rootDir: string) {
  const graph = await createGlobalGraph(targetPath);

  await saveGraph(graph, path.join(rootDir, destinationPath));
}
