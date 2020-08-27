import { test } from "@siteimprove/alfa-test";

import { Frontier } from "../src/frontier";

test(".of() constructs a frontier given a scope", (t) => {
  const frontier = Frontier.of("https://example.com/");

  t.deepEqual(frontier.toJSON(), {
    scope: "https://example.com/",
    items: [
      {
        url: "https://example.com/",
        aliases: [],
        state: "waiting",
      },
    ],
  });
});

test(".of() constructs a frontier given a scope and a list of seed URLs", (t) => {
  const frontier = Frontier.of("https://example.com/", [
    "https://example.com/foo",
  ]);

  t.deepEqual(frontier.toJSON(), {
    scope: "https://example.com/",
    items: [
      {
        url: "https://example.com/foo",
        aliases: [],
        state: "waiting",
      },
    ],
  });
});

test(".of() ignores seed URLs that are not in scope", (t) => {
  const frontier = Frontier.of("https://example.com/", [
    "https://example.org/foo",
  ]);

  t.deepEqual(frontier.toJSON(), {
    scope: "https://example.com/",
    items: [],
  });
});

test("#enqueue() adds a URL to the frontier", (t) => {
  const frontier = Frontier.of("https://example.com/");

  frontier.enqueue("https://example.com/foo.html");

  t.deepEqual(frontier.toJSON(), {
    scope: "https://example.com/",
    items: [
      {
        url: "https://example.com/",
        aliases: [],
        state: "waiting",
      },
      {
        url: "https://example.com/foo.html",
        aliases: [],
        state: "waiting",
      },
    ],
  });
});

test("#enqueue() ignores a URL that has already been seen", (t) => {
  const frontier = Frontier.of("https://example.com/");

  frontier.enqueue("https://example.com/");

  t.deepEqual(frontier.toJSON(), {
    scope: "https://example.com/",
    items: [
      {
        url: "https://example.com/",
        aliases: [],
        state: "waiting",
      },
    ],
  });
});

test("#enqueue() doesn't change the state of an already seen URL", (t) => {
  const frontier = Frontier.of("https://example.com/");

  frontier.dequeue();
  frontier.enqueue("https://example.com/");

  t.deepEqual(frontier.toJSON(), {
    scope: "https://example.com/",
    items: [
      {
        url: "https://example.com/",
        aliases: [],
        state: "in-progress",
      },
    ],
  });
});

test("#dequeue() gets the next waiting URL in queue and moves it to in progress", (t) => {
  const frontier = Frontier.of("https://example.com/");

  t.deepEqual(frontier.dequeue().get(), new URL("https://example.com"));

  t.deepEqual(frontier.toJSON(), {
    scope: "https://example.com/",
    items: [
      {
        url: "https://example.com/",
        aliases: [],
        state: "in-progress",
      },
    ],
  });
});
