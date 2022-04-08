import { test } from "@siteimprove/alfa-test";

import { h } from "../../../src";
import { getNodesBetween } from "../../../src/node/traversal/get-nodes-between";

const hello = h.text("Hello");
const spanHello = h.element("span", [], [hello]);
const divHello = <div>{spanHello}</div>;

const spanEmpty = <span></span>;
const divEmpty = <div>{spanEmpty}</div>;

const world = h.text("World");
const spanWorld = h.element("span", [], [world]);
const divWorld = <div>{spanWorld}</div>;

h.document([divHello, divEmpty, divWorld]);

test("getNodesBetween() returns the nodes between two nodes", (t) => {
  t.deepEqual(
    getNodesBetween(divHello, divWorld, {
      includeFirst: true,
      includeSecond: true,
    }).toArray(),
    [divHello, spanHello, hello, divEmpty, spanEmpty, divWorld]
  );

  t.deepEqual(
    getNodesBetween(divHello, divWorld, {
      includeFirst: true,
      includeSecond: false,
    }).toArray(),
    [divHello, spanHello, hello, divEmpty, spanEmpty]
  );

  t.deepEqual(
    getNodesBetween(divHello, divWorld, {
      includeFirst: false,
      includeSecond: true,
    }).toArray(),
    [divEmpty, spanEmpty, divWorld]
  );

  t.deepEqual(
    getNodesBetween(divHello, divWorld, {
      includeFirst: false,
      includeSecond: false,
    }).toArray(),
    [divEmpty, spanEmpty]
  );
});

test(`getNodesBetween() return a single node when both arguments are the same
            and both ends are included`, (t) => {
  t.deepEqual(
    getNodesBetween(divHello, divHello, {
      includeFirst: true,
      includeSecond: true,
    }).toArray(),
    [divHello]
  );
});

test(`getNodesBetween() return an empty sequence when both arguments are the
            same and at least on ends is included`, (t) => {
  t.deepEqual(
    getNodesBetween(divHello, divHello, {
      includeFirst: true,
      includeSecond: false,
    }).toArray(),
    []
  );

  t.deepEqual(
    getNodesBetween(divHello, divHello, {
      includeFirst: false,
      includeSecond: true,
    }).toArray(),
    []
  );

  t.deepEqual(
    getNodesBetween(divHello, divHello, {
      includeFirst: false,
      includeSecond: false,
    }).toArray(),
    []
  );
});

test(`getNodesBetween() return an empty sequence when node2 is a descendant of
      node1 and starting point is excluded`, (t) => {
  t.deepEqual(
    getNodesBetween(divHello, hello, {
      includeFirst: true,
      includeSecond: true,
    }).toArray(),
    [divHello, spanHello, hello]
  );

  t.deepEqual(
    getNodesBetween(divHello, hello, {
      includeFirst: false,
      includeSecond: true,
    }).toArray(),
    []
  );

  t.deepEqual(
    getNodesBetween(divHello, hello, {
      includeFirst: true,
      includeSecond: false,
    }).toArray(),
    [divHello, spanHello]
  );

  t.deepEqual(
    getNodesBetween(divHello, hello, {
      includeFirst: false,
      includeSecond: false,
    }).toArray(),
    []
  );
});
