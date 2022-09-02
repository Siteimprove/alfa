import { test } from "@siteimprove/alfa-test";

import { Refinement } from "@siteimprove/alfa-refinement";

import { Selective } from "../src/selective";

const isFoo: Refinement<string, "foo"> = (string): string is "foo" =>
  string === "foo";

const isBar: Refinement<string, "bar"> = (string): string is "bar" =>
  string === "bar";

test("#if() conditionally applies a function to a selective value", (t) => {
  Selective.of("foo")
    .if(isFoo, (value) => {
      t.equal(value, "foo");
    })
    .if(isBar, () => {
      t.fail();
    });
});

test(`#else() applies a function to a selective value that matched no other
      conditions`, (t) => {
  Selective.of("bar")
    .if(isFoo, () => {
      t.fail();
    })
    .else((value) => {
      t.equal(value, "bar");
    });
});

test("#get() returns the value of a selective", (t) => {
  t.equal(
    Selective.of("foo")
      .if(isFoo, () => "was foo")
      .get(),
    "was foo"
  );

  t.equal(
    Selective.of("bar")
      .if(isFoo, () => "was foo")
      .get(),
    "bar"
  );
});

test(`#map() applies a function to a matched selective value`, (t) => {
  t.equal(
    Selective.of("foo")
      .if(isFoo, () => "was foo")
      .map((string) => string.toUpperCase())
      .get(),
    "WAS FOO"
  );
});

test(`#apply() applies a selective function to a selective value`, (t) => {
  t.equal(
    Selective.of("foo")
      .if(isFoo, () => 2)
      .apply(Selective.of("bar").if(isBar, () => (n: number) => n * 2))
      .get(),
    4
  );
});

test(`#flatMap() applies a function to a matched selective value and flattens
      the result`, (t) => {
  t.equal(
    Selective.of("foo")
      .if(isFoo, () => "was foo")
      .flatMap((wasFoo) =>
        Selective.of("bar")
          .if(isBar, () => "was bar")
          .map((wasBar) => `${wasFoo} and ${wasBar}`)
      )
      .get(),
    "was foo and was bar"
  );
});

test(`#flatten() unwraps a nested selective value`, (t) => {
  t.equal(
    Selective.of("foo")
      .else(() => Selective.of("bar"))
      .flatten()
      .get(),
    "bar"
  );
});
