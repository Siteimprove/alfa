import { test } from "@siteimprove/alfa-test";

import {
  type ClusterDefinition,
  getClusters,
  type Module,
} from "../../src/dependency-graph/index.js";

test("getClusters() parses cluster definitions", async (t) => {
  const definitions: Array<ClusterDefinition> = [
    "pkg0",
    {
      name: "Cluster 1",
      children: ["pkg1", { name: "Cluster 1.1", children: ["pkg2", "pkg3"] }],
    },
    {
      name: "Cluster 2",
      children: [
        { name: "Cluster 2.1", children: ["pkg4"] },
        {
          name: "Cluster 2.2",
          children: [{ name: "Cluster 2.2.1", children: ["pkg5", "pkg6"] }],
        },
      ],
    },
  ];

  const modules: Array<Module> = [
    { id: "pkg0", clusters: [] },
    { id: "pkg1", clusters: ["Cluster 1"] },
    { id: "pkg2", clusters: ["Cluster 1", "Cluster 1.1"] },
    { id: "pkg3", clusters: ["Cluster 1", "Cluster 1.1"] },
    { id: "pkg4", clusters: ["Cluster 2", "Cluster 2.1"] },
    { id: "pkg5", clusters: ["Cluster 2", "Cluster 2.2", "Cluster 2.2.1"] },
    { id: "pkg6", clusters: ["Cluster 2", "Cluster 2.2", "Cluster 2.2.1"] },
  ];

  t.deepEqual([...getClusters(definitions)], modules);
});
