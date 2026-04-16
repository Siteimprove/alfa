import { test } from "@siteimprove/alfa-test";

import type { Hash } from "@siteimprove/alfa-hash";

import { FNV } from "../src/index.ts";

const fnv = (hasher: (hash: Hash) => Hash): number =>
  hasher(FNV.empty()).finish();

// Cross reference expected hashes with https://npm.runkit.com/fnv1a

test(".write() writes string data", (t) => {
  t.equal(
    fnv((h) => h.writeString("hello world")),
    0xd58b3fa7,
  );

  t.equal(
    fnv((h) => h.writeString("🦄🌈")),
    0xaaf5fee7,
  );
});
