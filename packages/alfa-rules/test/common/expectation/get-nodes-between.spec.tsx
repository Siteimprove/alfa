import { h } from "@siteimprove/alfa-dom";
import { Sequence } from "@siteimprove/alfa-sequence";
import { test } from "@siteimprove/alfa-test";
import { getNodesBetween } from "../../../src/common/expectation/get-nodes-between";

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
    }).toJSON(),
    Sequence.from([
      divHello,
      spanHello,
      hello,
      divEmpty,
      spanEmpty,
      divWorld,
    ]).toJSON()
  );

  t.deepEqual(
    getNodesBetween(divHello, divWorld, {
      includeFirst: true,
      includeSecond: false,
    }).toJSON(),
    Sequence.from([divHello, spanHello, hello, divEmpty, spanEmpty]).toJSON()
  );

  t.deepEqual(
    getNodesBetween(divHello, divWorld, {
      includeFirst: false,
      includeSecond: true,
    }).toJSON(),
    Sequence.from([divEmpty, spanEmpty, divWorld]).toJSON()
  );

  t.deepEqual(
    getNodesBetween(divHello, divWorld, {
      includeFirst: false,
      includeSecond: false,
    }).toJSON(),
    Sequence.from([divEmpty, spanEmpty]).toJSON()
  );
});

test(`getNodesBetween() return a single node when both arguments are the same
            and both ends are included`, (t) => {
  t.deepEqual(
    getNodesBetween(divHello, divHello, {
      includeFirst: true,
      includeSecond: true,
    }).toJSON(),
    [divHello.toJSON()]
  );
});

test(`getNodesBetween() return an empty sequence when both arguments are the
            same and at least on ends is included`, (t) => {
  t.deepEqual(
    getNodesBetween(divHello, divHello, {
      includeFirst: true,
      includeSecond: false,
    }).toJSON(),
    []
  );

  t.deepEqual(
    getNodesBetween(divHello, divHello, {
      includeFirst: false,
      includeSecond: true,
    }).toJSON(),
    []
  );

  t.deepEqual(
    getNodesBetween(divHello, divHello, {
      includeFirst: false,
      includeSecond: false,
    }).toJSON(),
    []
  );
});

test(`getNodesBetween() return an empty sequence when node2 is a descendant of
      node1 and starting point is excluded`, (t) => {
  t.deepEqual(
    getNodesBetween(divHello, hello, {
      includeFirst: true,
      includeSecond: true,
    }).toJSON(),
    [divHello.toJSON(), spanHello.toJSON(), hello.toJSON()]
  );

  t.deepEqual(
    getNodesBetween(divHello, hello, {
      includeFirst: false,
      includeSecond: true,
    }).toJSON(),
    []
  );

  t.deepEqual(
    getNodesBetween(divHello, hello, {
      includeFirst: true,
      includeSecond: false,
    }).toJSON(),
    [divHello.toJSON(), spanHello.toJSON()]
  );

  t.deepEqual(
    getNodesBetween(divHello, hello, {
      includeFirst: false,
      includeSecond: false,
    }).toJSON(),
    []
  );
});
