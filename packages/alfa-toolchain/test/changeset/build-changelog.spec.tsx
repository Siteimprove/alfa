import type { Package } from "@manypkg/get-packages";
import { test } from "@siteimprove/alfa-test";

import { Changelog } from "../../dist/changeset/build-changelog";

function fakePackage(
  pkg: string,
  prefix: string = "@siteimprove",
  dir: string = "packages",
): Package {
  return {
    packageJson: {
      name: pkg,
      repository: { directory: `${dir}/${pkg.replace(`${prefix}/`, "")}` },
    },
  } as any as Package;
}

test("buildLine() builds a package line entry", (t) => {
  t.deepEqual(
    Changelog.buildLine(
      [fakePackage("@siteimprove/my-package")],
      "X.Y.Z",
    )([
      {
        kind: "Added",
        title: "Some awesome title.",
        packages: ["@siteimprove/my-package"],
      },
      "[NOT A LINK]",
    ]),
    "- [@siteimprove/my-package](packages/my-package/CHANGELOG.md#XYZ):" +
      " Some awesome title. ([NOT A LINK])",
  );
});

test("buildLine() adds trailing dot if necessary", (t) => {
  t.deepEqual(
    Changelog.buildLine(
      [fakePackage("@siteimprove/my-package")],
      "X.Y.Z",
    )([
      {
        kind: "Added",
        title: "Some awesome title",
        packages: ["@siteimprove/my-package"],
      },
      "[NOT A LINK]",
    ]),
    "- [@siteimprove/my-package](packages/my-package/CHANGELOG.md#XYZ):" +
      " Some awesome title. ([NOT A LINK])",
  );
});

test("buildLine() leaves intermediate dots alone", (t) => {
  t.deepEqual(
    Changelog.buildLine(
      [fakePackage("@siteimprove/my-package")],
      "X.Y.Z",
    )([
      {
        kind: "Added",
        title: "Some. Awesome. Title",
        packages: ["@siteimprove/my-package"],
      },
      "[NOT A LINK]",
    ]),
    "- [@siteimprove/my-package](packages/my-package/CHANGELOG.md#XYZ):" +
      " Some. Awesome. Title. ([NOT A LINK])",
  );
});

test("buildLine() skips undefined PR links", (t) => {
  t.deepEqual(
    Changelog.buildLine(
      [fakePackage("@siteimprove/my-package")],
      "X.Y.Z",
    )([
      {
        kind: "Added",
        title: "Some awesome title",
        packages: ["@siteimprove/my-package"],
      },
      undefined,
    ]),
    "- [@siteimprove/my-package](packages/my-package/CHANGELOG.md#XYZ):" +
      " Some awesome title.",
  );
});

test("buildLine() handles multi-packages change", (t) => {
  t.deepEqual(
    Changelog.buildLine(
      ["@siteimprove/my-package", "@siteimprove/my-other-package"].map((pkg) =>
        fakePackage(pkg),
      ),
      "X.Y.Z",
    )([
      {
        kind: "Added",
        title: "Some awesome title",
        packages: ["@siteimprove/my-package", "@siteimprove/my-other-package"],
      },
      "[NOT A LINK]",
    ]),
    "- [@siteimprove/my-package](packages/my-package/CHANGELOG.md#XYZ)," +
      " [@siteimprove/my-other-package](packages/my-other-package/CHANGELOG.md#XYZ):" +
      " Some awesome title. ([NOT A LINK])",
  );
});

test("buildGroup() builds a group of same kinds changes", (t) => {
  t.deepEqual(
    Changelog.buildGroup(
      "Added",
      [
        [
          {
            kind: "Added",
            title: "Some awesome title",
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
            title: "Some other title",
            packages: ["@siteimprove/my-third-package"],
          },
          "[STILL NOT A LINK]",
        ],
      ],
      [
        "@siteimprove/my-package",
        "@siteimprove/my-other-package",
        "@siteimprove/my-third-package",
      ].map((pkg) => fakePackage(pkg)),
      "X.Y.Z",
    ),
    "### Added\n\n" +
      "- [@siteimprove/my-package](packages/my-package/CHANGELOG.md#XYZ)," +
      " [@siteimprove/my-other-package](packages/my-other-package/CHANGELOG.md#XYZ):" +
      " Some awesome title. ([NOT A LINK])\n\n" +
      "- [@siteimprove/my-third-package](packages/my-third-package/CHANGELOG.md#XYZ):" +
      " Some other title. ([STILL NOT A LINK])",
  );
});

test("buildBody() builds a full body", (t) => {
  t.deepEqual(
    Changelog.buildBody(
      [
        [
          {
            kind: "Added",
            title: "Title 1",
            packages: ["@siteimprove/package-1-1", "@siteimprove/package-1-2"],
          },
          "[LINK 1]",
        ],
        [
          {
            kind: "Breaking",
            title: "Title 2",
            packages: ["@siteimprove/package-2"],
          },
          "[LINK 2]",
        ],
        [
          {
            kind: "Added",
            title: "Title 3",
            packages: ["@siteimprove/package-3"],
          },
          "[LINK 3]",
        ],
        [
          {
            kind: "Fixed",
            title: "Title 4",
            packages: ["@siteimprove/package-4"],
          },
          "[LINK 4]",
        ],
        [
          {
            kind: "Removed",
            title: "Title 5",
            packages: ["@siteimprove/package-5"],
          },
          "[LINK 5]",
        ],
      ],
      [
        "@siteimprove/package-1-1",
        "@siteimprove/package-1-2",
        "@siteimprove/package-2",
        "@siteimprove/package-3",
        "@siteimprove/package-4",
        "@siteimprove/package-5",
      ].map((pkg) => fakePackage(pkg)),
      "X.Y.Z",
    ),
    "### Breaking\n\n" +
      "- [@siteimprove/package-2](packages/package-2/CHANGELOG.md#XYZ):" +
      " Title 2. ([LINK 2])\n\n" +
      "### Removed\n\n" +
      "- [@siteimprove/package-5](packages/package-5/CHANGELOG.md#XYZ):" +
      " Title 5. ([LINK 5])\n\n" +
      "### Added\n\n" +
      "- [@siteimprove/package-1-1](packages/package-1-1/CHANGELOG.md#XYZ)," +
      " [@siteimprove/package-1-2](packages/package-1-2/CHANGELOG.md#XYZ):" +
      " Title 1. ([LINK 1])\n\n" +
      "- [@siteimprove/package-3](packages/package-3/CHANGELOG.md#XYZ):" +
      " Title 3. ([LINK 3])\n\n" +
      "### Fixed\n\n" +
      "- [@siteimprove/package-4](packages/package-4/CHANGELOG.md#XYZ):" +
      " Title 4. ([LINK 4])",
  );
});

test("buildBody() skips missing kinds", (t) => {
  t.deepEqual(
    Changelog.buildBody(
      [
        [
          {
            kind: "Added",
            title: "Title 1",
            packages: ["@siteimprove/package-1-1", "@siteimprove/package-1-2"],
          },
          "[LINK 1]",
        ],
        [
          {
            kind: "Breaking",
            title: "Title 2",
            packages: ["@siteimprove/package-2"],
          },
          "[LINK 2]",
        ],
        [
          {
            kind: "Added",
            title: "Title 3",
            packages: ["@siteimprove/package-3"],
          },
          "[LINK 3]",
        ],
      ],
      [
        "@siteimprove/package-1-1",
        "@siteimprove/package-1-2",
        "@siteimprove/package-2",
        "@siteimprove/package-3",
      ].map((pkg) => fakePackage(pkg)),
      "X.Y.Z",
    ),
    "### Breaking\n\n" +
      "- [@siteimprove/package-2](packages/package-2/CHANGELOG.md#XYZ):" +
      " Title 2. ([LINK 2])\n\n" +
      "### Added\n\n" +
      "- [@siteimprove/package-1-1](packages/package-1-1/CHANGELOG.md#XYZ)," +
      " [@siteimprove/package-1-2](packages/package-1-2/CHANGELOG.md#XYZ):" +
      " Title 1. ([LINK 1])\n\n" +
      "- [@siteimprove/package-3](packages/package-3/CHANGELOG.md#XYZ):" +
      " Title 3. ([LINK 3])",
  );
});

test("buildBody() respect prefix and package map", (t) => {
  t.deepEqual(
    Changelog.buildBody(
      [
        [
          {
            kind: "Added",
            title: "Title 1",
            packages: ["@myOrg/package-1-1", "@myOrg/package-1-2"],
          },
          "[LINK 1]",
        ],
        [
          {
            kind: "Breaking",
            title: "Title 2",
            packages: ["@myOrg/package-2"],
          },
          "[LINK 2]",
        ],
        [
          {
            kind: "Added",
            title: "Title 3",
            packages: ["@myOrg/package-3"],
          },
          "[LINK 3]",
        ],
      ],
      [
        fakePackage("@myOrg/package-1-1", "@myOrg", "dir1"),
        fakePackage("@myOrg/package-1-2", "@myOrg", "packages"),
        fakePackage("@myOrg/package-2", "@myOrg", "packages"),
        fakePackage("@myOrg/package-3", "@myOrg", "dir3"),
      ],
      "X.Y.Z",
    ),
    "### Breaking\n\n" +
      "- [@myOrg/package-2](packages/package-2/CHANGELOG.md#XYZ):" +
      " Title 2. ([LINK 2])\n\n" +
      "### Added\n\n" +
      "- [@myOrg/package-1-1](dir1/package-1-1/CHANGELOG.md#XYZ)," +
      " [@myOrg/package-1-2](packages/package-1-2/CHANGELOG.md#XYZ):" +
      " Title 1. ([LINK 1])\n\n" +
      "- [@myOrg/package-3](dir3/package-3/CHANGELOG.md#XYZ):" +
      " Title 3. ([LINK 3])",
  );
});

test("mergeBodies() insert new content after heading, and spaces it", (t) => {
  t.deepEqual(
    Changelog.mergeBodies(
      "# Alfa\n\n" + "## Older versions",
      "## New version\n\n" + "### Kind\n\n" + "Some changes",
    ),
    "# Alfa\n\n" +
      "## New version\n\n" +
      "### Kind\n\n" +
      "Some changes\n\n" +
      "## Older versions",
  );
});
