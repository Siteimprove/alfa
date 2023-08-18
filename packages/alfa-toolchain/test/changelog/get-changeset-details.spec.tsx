import { test } from "@siteimprove/alfa-test";

import {
  getChangesetDetails,
  kinds,
} from "../../src/changelog/get-changeset-details";

test("getChangesetDetails accepts a valid changeset with details", (t) => {
  for (const kind of kinds) {
    t.deepEqual(
      getChangesetDetails({
        releases: [
          { name: "my-package", type: "minor" },
          { name: "my-other-package", type: "patch" },
        ],
        summary: `**${kind}:** Some clever summary

Some clever details.`,
        id: "unused",
      }).toJSON(),
      {
        type: "ok",
        value: {
          kind: kind,
          summary: "Some clever summary",
          details: "Some clever details.",
          packages: ["my-package", "my-other-package"],
        },
      }
    );
  }
});

test("getChangesetDetails accepts a valid changeset without details", (t) => {
  for (const kind of kinds) {
    t.deepEqual(
      getChangesetDetails({
        releases: [
          { name: "my-package", type: "minor" },
          { name: "my-other-package", type: "patch" },
        ],
        summary: `**${kind}:** Some clever summary`,
        id: "unused",
      }).toJSON(),
      {
        type: "ok",
        value: {
          kind: kind,
          summary: "Some clever summary",
          details: "",
          packages: ["my-package", "my-other-package"],
        },
      }
    );
  }
});

test("getChangesetDetails accepts a valid changeset with multiline details", (t) => {
  for (const kind of kinds) {
    t.deepEqual(
      getChangesetDetails({
        releases: [
          { name: "my-package", type: "minor" },
          { name: "my-other-package", type: "patch" },
        ],
        summary: `**${kind}:** Some clever summary

Some clever details
that

spans
over several lines.`,
        id: "unused",
      }).toJSON(),
      {
        type: "ok",
        value: {
          kind: kind,
          summary: "Some clever summary",
          details: "Some clever details\nthat\n\nspans\nover several lines.",
          packages: ["my-package", "my-other-package"],
        },
      }
    );
  }
});

test("getChangesetDetails rejects a changeset with incorrect kind", (t) => {
  for (const kind of ["hello", "world", "invalid", "added", "fixed"]) {
    t.deepEqual(
      getChangesetDetails({
        releases: [
          { name: "my-package", type: "minor" },
          { name: "my-other-package", type: "patch" },
        ],
        summary: `**${kind}:** Some clever summary`,
        id: "unused",
      }).toJSON(),
      { type: "err", error: `Invalid kind: ${kind}` }
    );
  }
});

test("getChangesetDetails rejects a changeset with incorrect header", (t) => {
  for (const summary of [
    "*Added:** hello" /* single starting '*' */,
    "**Added:* hello" /* single ending '*' */,
    "**Added**: hello" /* misplaced ':' */,
    "**Added:**hello" /* missing space */,
    "**Added3:** hello" /* non-letter in kind */,
    "**Added:** hello\nworld" /* no empty line between summary and details */,
  ]) {
    t.deepEqual(
      getChangesetDetails({
        releases: [{ name: "my-package", type: "patch" }],
        summary,
        id: "unused",
      }).toJSON(),
      {
        type: "err",
        error: `Changeset doesn't match the required format (${summary})`,
      }
    );
  }
});
