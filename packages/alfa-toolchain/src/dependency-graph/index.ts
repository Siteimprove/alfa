import { DependencyGraph } from "./dependency-graph";

main();

async function main() {
  const graph = await DependencyGraph.from("packages", "alfa", "css");

  graph.save();
}
