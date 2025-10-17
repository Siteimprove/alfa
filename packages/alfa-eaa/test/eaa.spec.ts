import { test } from "@siteimprove/alfa-test";
import { None, Option } from "@siteimprove/alfa-option";
import { EAA } from "../dist/eaa.js";

const chapter = "9.1.1.1" as const; // Non-text content

test("EAA.of() creates an EAA instance with the given chapter", (t) => {
  const eaa = EAA.of(chapter);
  t.equal(eaa.chapter, chapter);
});

test("EAA#title returns the expected title for the chapter", (t) => {
  const eaa = EAA.of(chapter);
  t.equal(eaa.title, "Non-text content");
});

test("EAA.isChapter() returns true for a valid chapter", (t) => {
  t.equal(EAA.isChapter(chapter), true);
});

test("EAA.isChapter() returns false for an invalid chapter", (t) => {
  t.equal(EAA.isChapter("invalid"), false);
});

test("EAA.isEAA() returns true for EAA instances", (t) => {
  t.equal(EAA.isEAA(EAA.of(chapter)), true);
});

test("EAA.isEAA() returns false for other values", (t) => {
  t.equal(EAA.isEAA({ chapter }), false);
});

test("EAA.fromChapter() returns an Option containing an EAA for valid chapter", (t) => {
  const option = EAA.fromChapter(chapter);
  t.deepEqual(option, Option.of(EAA.of(chapter)));
});

test("EAA.fromChapter() returns None for an invalid chapter", (t) => {
  t.equal(EAA.fromChapter("invalid"), None);
});
