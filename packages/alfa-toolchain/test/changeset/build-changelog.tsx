import { Map } from "@siteimprove/alfa-map";
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

test("buildBody() builds a full body", (t) => {
  t.deepEqual(
    Changelog.buildBody([
      [
        {
          kind: "Added",
          summary: "Summary 1",
          packages: ["@siteimprove/package-1-1", "@siteimprove/package-1-2"],
        },
        "[LINK 1]",
      ],
      [
        {
          kind: "Breaking",
          summary: "Summary 2",
          packages: ["@siteimprove/package-2"],
        },
        "[LINK 2]",
      ],
      [
        {
          kind: "Added",
          summary: "Summary 3",
          packages: ["@siteimprove/package-3"],
        },
        "[LINK 3]",
      ],
      [
        {
          kind: "Fixed",
          summary: "Summary 4",
          packages: ["@siteimprove/package-4"],
        },
        "[LINK 4]",
      ],
      [
        {
          kind: "Removed",
          summary: "Summary 5",
          packages: ["@siteimprove/package-5"],
        },
        "[LINK 5]",
      ],
    ]),
    "### Breaking\n\n" +
      "- [@siteimprove/package-2](packages/package-2/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " Summary 2. ([LINK 2])\n\n" +
      "### Removed\n\n" +
      "- [@siteimprove/package-5](packages/package-5/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " Summary 5. ([LINK 2])\n\n" +
      "### Added\n\n" +
      "- [@siteimprove/package-1-1](packages/package-1-1/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " [@siteimprove/package-1-2](packages/package-1-2/CHANGELOG.md#[INSERT NEW VERSION HERE]):" +
      " Summary 1. ([LINK 1])\n\n" +
      "- [@siteimprove/package-3](packages/package-3/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " Summary 3. ([LINK 3])\n\n" +
      "### Fixed\n\n" +
      "- [@siteimprove/package-4](packages/package-4/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " Summary 4. ([LINK 4])"
  );
});

test("buildBody() skips missing kinds", (t) => {
  t.deepEqual(
    Changelog.buildBody([
      [
        {
          kind: "Added",
          summary: "Summary 1",
          packages: ["@siteimprove/package-1-1", "@siteimprove/package-1-2"],
        },
        "[LINK 1]",
      ],
      [
        {
          kind: "Breaking",
          summary: "Summary 2",
          packages: ["@siteimprove/package-2"],
        },
        "[LINK 2]",
      ],
      [
        {
          kind: "Added",
          summary: "Summary 3",
          packages: ["@siteimprove/package-3"],
        },
        "[LINK 3]",
      ],
    ]),
    "### Breaking\n\n" +
      "- [@siteimprove/package-2](packages/package-2/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " Summary 2. ([LINK 2])\n\n" +
      "### Added\n\n" +
      "- [@siteimprove/package-1-1](packages/package-1-1/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " [@siteimprove/package-1-2](packages/package-1-2/CHANGELOG.md#[INSERT NEW VERSION HERE]):" +
      " Summary 1. ([LINK 1])\n\n" +
      "- [@siteimprove/package-3](packages/package-3/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " Summary 3. ([LINK 3])"
  );
});

test("buildBody() respect prefix and package map", (t) => {
  t.deepEqual(
    Changelog.buildBody(
      [
        [
          {
            kind: "Added",
            summary: "Summary 1",
            packages: ["@myOrg/package-1-1", "@myOrg/package-1-2"],
          },
          "[LINK 1]",
        ],
        [
          {
            kind: "Breaking",
            summary: "Summary 2",
            packages: ["@myOrg/package-2"],
          },
          "[LINK 2]",
        ],
        [
          {
            kind: "Added",
            summary: "Summary 3",
            packages: ["@myOrg/package-3"],
          },
          "[LINK 3]",
        ],
      ],
      "@myOrg",
      Map.from([
        ["package-1-1", "dir1"],
        ["package-3", "dir3"],
      ])
    ),
    "### Breaking\n\n" +
      "- [@myOrg/package-2](packages/package-2/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " Summary 2. ([LINK 2])\n\n" +
      "### Added\n\n" +
      "- [@myOrg/package-1-1](dir1/package-1-1/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " [@myOrg/package-1-2](packages/package-1-2/CHANGELOG.md#[INSERT NEW VERSION HERE]):" +
      " Summary 1. ([LINK 1])\n\n" +
      "- [@myOrg/package-3](dir3/package-3/CHANGELOG.md#[INSERT NEW VERSION HERE])," +
      " Summary 3. ([LINK 3])"
  );
});
