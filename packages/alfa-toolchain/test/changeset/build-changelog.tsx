import { test } from "@siteimprove/alfa-test";

import { Changelog } from "../../src/changeset/build-changelog";

test("buildLine() builds a package line entry", (t) => {
  t.deepEqual(
    Changelog.buildLine(
      {
        kind: "Added",
        summary: "Some awesome summary.",
        packages: ["@siteimprove/my-package"],
      },
      "[NOT A LINK]"
    ),
    "- [@siteimprove/my-package](packages/my-package/CHANGELOG.md#[INSERT NEW VERSION HERE]):" +
      " Some awesome summary. ([NOT A LINK])"
  );
});

test("buildLine() adds trailing dot if necessary", (t) => {
  t.deepEqual(
    Changelog.buildLine(
      {
        kind: "Added",
        summary: "Some awesome summary",
        packages: ["@siteimprove/my-package"],
      },
      "[NOT A LINK]"
    ),
    "- [@siteimprove/my-package](packages/my-package/CHANGELOG.md#[INSERT NEW VERSION HERE]):" +
      " Some awesome summary. ([NOT A LINK])"
  );
});

test("buildLine() leaves intermediate dots alone", (t) => {
  t.deepEqual(
    Changelog.buildLine(
      {
        kind: "Added",
        summary: "Some. Awesome. Summary",
        packages: ["@siteimprove/my-package"],
      },
      "[NOT A LINK]"
    ),
    "- [@siteimprove/my-package](packages/my-package/CHANGELOG.md#[INSERT NEW VERSION HERE]):" +
      " Some. Awesome. Summary. ([NOT A LINK])"
  );
});

test("buildLine() handles multi-packages change", (t) => {
  t.deepEqual(
    Changelog.buildLine(
      {
        kind: "Added",
        summary: "Some awesome summary",
        packages: ["@siteimprove/my-package", "@siteimprove/my-other-package"],
      },
      "[NOT A LINK]"
    ),
    "- [@siteimprove/my-package](packages/my-package/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " [@siteimprove/my-other-package](packages/my-other-package/CHANGELOG.md#[INSERT NEW VERSION HERE]):" +
      " Some awesome summary. ([NOT A LINK])"
  );
});

test("buildGroup() builds a group of same kinds changes", (t) => {
  t.deepEqual(
    Changelog.buildGroup("Added", [
      [
        {
          kind: "Added",
          summary: "Some awesome summary",
          packages: [
            "@siteimprove/my-package",
            "@siteimprove/my-other-package",
          ],
        },
        "[NOT A LINK]",
      ],
      [
        {
          kind: "Added",
          summary: "Some other summary",
          packages: ["@siteimprove/my-third-package"],
        },
        "[STILL NOT A LINK]",
      ],
    ]),
    "### Added\n\n" +
      "- [@siteimprove/my-package](packages/my-package/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " [@siteimprove/my-other-package](packages/my-other-package/CHANGELOG.md#[INSERT NEW VERSION HERE]):" +
      " Some awesome summary. ([NOT A LINK])\n\n" +
      "- [@siteimprove/my-third-package](packages/my-third-package/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " Some other summary. ([STILL NOT A LINK])\n\n"
  );
});
