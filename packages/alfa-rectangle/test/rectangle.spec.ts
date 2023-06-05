import { FNV } from "@siteimprove/alfa-fnv";
import { test } from "@siteimprove/alfa-test";

import { Rectangle } from "../src";

const rect = Rectangle.of(28, 62, 54, 81);

test("#width gets the width of a rectangle", (t) => {
  t.equal(rect.width, 54);
});

test("#height gets the height of a rectangle", (t) => {
  t.equal(rect.height, 81);
});

test("#top gets the y-coordinate of the top left corner of a rectangle", (t) => {
  t.equal(rect.top, 62);
});

test("#left gets the x-coordinate of the top left corner of a rectangle", (t) => {
  t.equal(rect.left, 28);
});

test("#right gets the x-coordinate of the top right corner of a rectangle", (t) => {
  t.equal(rect.right, 82);
});

test("#bottom gets the y-coordinate of the bottom left corner of a rectangle", (t) => {
  t.equal(rect.bottom, 143);
});

test("#center calculates the center point of a rectangle", (t) => {
  t.deepEqual(rect.center, { x: 55, y: 102.5 });
});

test("#area calculates the area of a rectangle", (t) => {
  t.equal(rect.area, 4374);
});

test("#contains returns true when first rectangle contains second rectangle", (t) => {
  const rect1 = Rectangle.of(49, 70, 31, 47);
  const rect2 = Rectangle.of(49, 70, 21, 37);

  t.equal(rect1.contains(rect2), true);
});

test("#contains returns true when first rectangle strictly contains second rectangle", (t) => {
  const rect1 = Rectangle.of(49, 70, 31, 47);
  const rect2 = Rectangle.of(59, 80, 11, 27);

  t.equal(rect1.contains(rect2), true);
});

test("#contains returns false if rectangles overlap", (t) => {
  const rect1 = Rectangle.of(49, 70, 31, 47);
  const rect2 = Rectangle.of(59, 80, 31, 47);

  t.equal(rect1.contains(rect2), false);
});

test("#contains returns false when rectangles are disjoint", (t) => {
  const rect1 = Rectangle.of(49, 70, 31, 47);
  const rect2 = Rectangle.of(80, 127, 31, 47);

  t.equal(rect1.contains(rect2), false);
});

test("#intersects returns true if rectangles are equal", (t) => {
  const rect1 = Rectangle.of(49, 70, 31, 47);
  const rect2 = Rectangle.of(49, 70, 31, 47);

  t.equal(rect1.intersects(rect2), true);
});

test("#intersects returns true if rectangles overlap", (t) => {
  const rect1 = Rectangle.of(49, 70, 31, 47);
  const rect2 = Rectangle.of(59, 80, 31, 47);

  t.equal(rect1.intersects(rect2), true);
});

test("#intersects returns false when rectangles are disjoint", (t) => {
  const rect1 = Rectangle.of(49, 70, 31, 47);
  const rect2 = Rectangle.of(80, 127, 31, 47);

  t.equal(rect1.intersects(rect2), false);
});

test("#union calculates the smallest rectangle containing all input rectangles", (t) => {
  const rect1 = Rectangle.of(13, 31, 58, 52);
  const rect2 = Rectangle.of(10, 99, 17, 87);
  const rect3 = Rectangle.of(26, 89, 56, 75);

  t.deepEqual(Rectangle.union(rect1, rect2, rect3).toJSON(), {
    type: "rectangle",
    x: 10,
    y: 31,
    width: 72,
    height: 155,
  });
});

test("#hash returns the same hash for rectangles with the same values", (t) => {
  const rect1 = Rectangle.of(13, 31, 58, 52);
  const rect2 = Rectangle.of(13, 31, 58, 52);

  const hash1 = FNV.empty();
  rect1.hash(hash1);

  const hash2 = FNV.empty();
  rect2.hash(hash2);

  t.equal(hash1.finish(), hash2.finish());
});

test("#equals returns true for same rectangle", (t) => {
  const rect = Rectangle.of(13, 31, 58, 52);

  t.equal(rect.equals(rect), true);
});

test("#equals returns true for rectangles with the same values", (t) => {
  const rect1 = Rectangle.of(13, 31, 58, 52);
  const rect2 = Rectangle.of(13, 31, 58, 52);

  t.equal(rect1.equals(rect2), true);
});

test("#equals returns false for rectangles with different x-coordinate", (t) => {
  const rect1 = Rectangle.of(13, 31, 58, 52);
  const rect2 = Rectangle.of(14, 31, 58, 52);

  t.equal(rect1.equals(rect2), false);
});

test("#equals returns false for rectangles with different y-coordinate", (t) => {
  const rect1 = Rectangle.of(13, 31, 58, 52);
  const rect2 = Rectangle.of(13, 32, 58, 52);

  t.equal(rect1.equals(rect2), false);
});

test("#equals returns false for rectangles with different width", (t) => {
  const rect1 = Rectangle.of(13, 31, 58, 52);
  const rect2 = Rectangle.of(13, 31, 59, 52);

  t.equal(rect1.equals(rect2), false);
});

test("#equals returns false for rectangles with different height", (t) => {
  const rect1 = Rectangle.of(13, 31, 58, 52);
  const rect2 = Rectangle.of(13, 31, 58, 53);

  t.equal(rect1.equals(rect2), false);
});
