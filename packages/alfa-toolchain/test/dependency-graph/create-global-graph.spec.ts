import { test } from "@siteimprove/alfa-test";

import type {
  ClusterDefinition,
  Module,
} from "../../dist/dependency-graph/dependency-graph.js";
import {
  getAllScopedDependencies,
  getClusters,
  getScopedProdDependencies,
} from "../../dist/dependency-graph/create-global-graph.js";

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

test("getAllScopedDependencies grabs both production and development dependencies", async (t) => {
  const pkg = {
    dependencies: {
      "@foo/foo1": "1",
      "@foo/foo2": "1",
      "@foo/foo3": "1",
      "@bar/foo4": "1",
    },
    devDependencies: {
      "@foo/dev1": "1",
      "@foo/dev2": "1",
      "@bar/dev3": "1",
    },
  };

  t.deepEqual(getAllScopedDependencies(pkg, "@foo"), [
    "@foo/foo1",
    "@foo/foo2",
    "@foo/foo3",
    "@foo/dev1",
    "@foo/dev2",
  ]);
});

test("getAllScopedDependencies handles missing dependencies", async (t) => {
  const pkg = {
    devDependencies: {
      "@foo/dev1": "1",
      "@foo/dev2": "1",
      "@bar/dev3": "1",
    },
  };

  t.deepEqual(getAllScopedDependencies(pkg, "@foo"), [
    "@foo/dev1",
    "@foo/dev2",
  ]);
});

test("getAllScopedDependencies handles missing devDependencies", async (t) => {
  const pkg = {
    dependencies: {
      "@foo/foo1": "1",
      "@foo/foo2": "1",
      "@foo/foo3": "1",
      "@bar/foo4": "1",
    },
  };

  t.deepEqual(getAllScopedDependencies(pkg, "@foo"), [
    "@foo/foo1",
    "@foo/foo2",
    "@foo/foo3",
  ]);
});

test("getScopedProdDependencies grabs only production dependencies", async (t) => {
  const pkg = {
    dependencies: {
      "@foo/foo1": "1",
      "@foo/foo2": "1",
      "@foo/foo3": "1",
      "@bar/foo4": "1",
    },
    devDependencies: {
      "@foo/dev1": "1",
      "@foo/dev2": "1",
      "@bar/dev3": "1",
    },
  };

  t.deepEqual(getScopedProdDependencies(pkg, "@foo"), [
    "@foo/foo1",
    "@foo/foo2",
    "@foo/foo3",
  ]);
});

test("getScopedProdDependencies handles missing dependencies", async (t) => {
  const pkg = {
    devDependencies: {
      "@foo/dev1": "1",
      "@foo/dev2": "1",
      "@bar/dev3": "1",
    },
  } as { dependencies?: { [key: string]: string } };

  t.deepEqual(getScopedProdDependencies(pkg, "@foo"), []);
});

test("getScopedProdDependencies handles missing devDependencies", async (t) => {
  const pkg = {
    dependencies: {
      "@foo/foo1": "1",
      "@foo/foo2": "1",
      "@foo/foo3": "1",
      "@bar/foo4": "1",
    },
  };

  t.deepEqual(getScopedProdDependencies(pkg, "@foo"), [
    "@foo/foo1",
    "@foo/foo2",
    "@foo/foo3",
  ]);
});
