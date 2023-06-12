import { FNV } from "@siteimprove/alfa-fnv";
import { test } from "@siteimprove/alfa-test";

import { Rectangle } from "../src";

const rect = Rectangle.of(28, 62, 54, 81);
const reverseRect = Rectangle.of(28, 62, -54, -81);

test("#x gets the x coordinate of the rectangles origin", (t) => {
  t.equal(rect.x, 28);
});

test("#y gets the y coordinate of the rectangles origin", (t) => {
  t.equal(rect.y, 62);
});

test("#width gets the width of the rectangle", (t) => {
  t.equal(rect.width, 54);
});

test("#height gets the height of the rectangle", (t) => {
  t.equal(rect.height, 81);
});

test("#top is equal to `y` if `height` is positive", (t) => {
  t.equal(rect.top, rect.y);
});

test("#top is equal to `y + height` if `height` is negative", (t) => {
  t.equal(reverseRect.top, reverseRect.y + reverseRect.height);
});

test("#top of empty rectangle is Infinity", (t) => {
  t.equal(Rectangle.empty().top, Infinity);
});

test("#top of full rectangle is -Infinity", (t) => {
  t.equal(Rectangle.full().top, -Infinity);
});

test("#right is equal to `x + width` if `width` is positive", (t) => {
  t.equal(rect.right, rect.x + rect.width);
});

test("#right is equal to `x` if `width` is negative", (t) => {
  t.equal(reverseRect.right, reverseRect.x);
});

test("#right of empty rectangle is Infinity", (t) => {
  t.equal(Rectangle.empty().right, Infinity);
});

test("#right of full rectangle is Infinity", (t) => {
  t.equal(Rectangle.full().right, Infinity);
});

test("#bottom is equal to `y + height` if `height` is positive", (t) => {
  t.equal(rect.bottom, rect.y + rect.height);
});

test("#bottom is equal to `y` if `height` is negative", (t) => {
  t.equal(reverseRect.bottom, reverseRect.y);
});

test("#bottom of empty rectangle is Infinity", (t) => {
  t.equal(Rectangle.empty().bottom, Infinity);
});

test("#bottom of full rectangle is Infinity", (t) => {
  t.equal(Rectangle.full().bottom, Infinity);
});

test("#left is equal to `x` if `width` is positive", (t) => {
  t.equal(rect.left, rect.x);
});

test("#left is equal to `x + width` if `width` is negative", (t) => {
  t.equal(reverseRect.left, reverseRect.x + reverseRect.width);
});

test("#left of empty rectangle is Infinity", (t) => {
  t.equal(Rectangle.empty().left, Infinity);
});

test("#left of full rectangle is -Infinity", (t) => {
  t.equal(Rectangle.full().left, -Infinity);
});

test("#center calculates the center point of a rectangle", (t) => {
  t.deepEqual(rect.center, { x: 55, y: 102.5 });
});

test("#area calculates the area of a rectangle", (t) => {
  t.equal(rect.area, 4374);
});

test("#area of empty rectangle is 0", (t) => {
  t.equal(Rectangle.empty().area, 0);
});

test("#area of full rectangle is Infinity", (t) => {
  t.equal(Rectangle.full().area, Infinity);
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

test("#contains of empty returns true", (t) => {
  t.equal(rect.contains(Rectangle.empty()), true);
});

test("#contains returns false when invoked on empty and non-empty rectangle", (t) => {
  t.equal(Rectangle.empty().contains(rect), false);
});

test("#contains returns true if both are empty", (t) => {
  t.equal(Rectangle.empty().contains(Rectangle.empty()), true);
});

test("#contains invoked on full rectangle returns true", (t) => {
  t.equal(Rectangle.full().contains(rect), true);
});

test("#contains returns false when invoked on non-full and full rectangle", (t) => {
  t.equal(rect.contains(Rectangle.full()), false);
});

test("#contains returns true when both rectangles are full", (t) => {
  t.equal(rect.contains(Rectangle.full()), false);
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

test("#isEmpty is true for any empty rectangle", (t) => {
  const newEmpty = Rectangle.of(Infinity, Infinity, 0, 0);
  t.equal(newEmpty.isEmpty(), true);
});

test("#isFull is true for any full rectangle", (t) => {
  const newFull = Rectangle.of(-Infinity, -Infinity, Infinity, Infinity);
  t.equal(newFull.isFull(), true);
});

test("#union calculates the smallest rectangle containing all input rectangles", (t) => {
  const rect1 = Rectangle.of(1, 1, 5, 3);
  const rect2 = Rectangle.of(8, 6, -4, -4);
  const rect3 = Rectangle.of(2, 3, 5, 4);

  t.deepEqual(Rectangle.union(rect1, rect2, rect3).toJSON(), {
    type: "rectangle",
    x: 1,
    y: 1,
    width: 7,
    height: 6,
  });
});

test("#union is symmetric", (t) => {
  const rect1 = Rectangle.of(0, 0, 16, 10);
  const rect2 = Rectangle.of(1, 1, 8, 5);
  t.deepEqual(rect1.union(rect2), rect2.union(rect1));
});

test("#union of nested rectangles returns outer rectangle", (t) => {
  const outer = Rectangle.of(1, 1, 7, 5);
  const inner = Rectangle.of(3, 3, 3, 2);
  t.equal(outer.union(inner), outer);
});

test("empty is left neutral with respect to #union", (t) => {
  t.equal(Rectangle.empty().union(rect), rect);
});

test("empty is right neutral with respect to #union", (t) => {
  t.equal(rect.union(Rectangle.empty()), rect);
});

test("full is left absorbing with respect to #union", (t) => {
  const full = Rectangle.full();
  t.equal(full.union(rect), full);
});

test("full is right absorbing with respect to #union", (t) => {
  const full = Rectangle.full();
  t.equal(rect.union(full), full);
});

test("#union of no rectangles returns empty rectangle", (t) => {
  t.equal(Rectangle.union(), Rectangle.empty());
});

test("#intersection of nested rectangles returns inner rectangle", (t) => {
  const outer = Rectangle.of(0, 0, 16, 10);
  const inner = Rectangle.of(1, 1, 8, 5);
  t.equal(outer.intersection(inner), inner);
});

test("#intersection calculates intersection of multiple intersecting rectangles", (t) => {
  const rect1 = Rectangle.of(1, 1, 5, 3);
  const rect2 = Rectangle.of(8, 6, -4, -4);
  const rect3 = Rectangle.of(2, 3, 5, 4);

  t.deepEqual(Rectangle.intersection(rect1, rect2, rect3).toJSON(), {
    type: "rectangle",
    x: 4,
    y: 3,
    width: 2,
    height: 1,
  });
});

test("#intersection of disjoint rectangles returns the empty rectangle", (t) => {
  const rect1 = Rectangle.of(1, 1, 4, 3);
  const rect2 = Rectangle.of(7, 6, 4, 3);

  t.equal(rect1.intersection(rect2), Rectangle.empty());
});

test("empty is left absorbing with respect to #intersection", (t) => {
  const empty = Rectangle.empty();
  t.equal(empty.intersection(rect), empty);
});

test("empty is right absorbing with respect to #intersection", (t) => {
  const empty = Rectangle.empty();
  t.equal(rect.intersection(empty), empty);
});

test("full is left neutral with respect to #intersection", (t) => {
  t.equal(Rectangle.full().intersection(rect), rect);
});

test("full is right neutral with respect to #intersection", (t) => {
  t.equal(rect.intersection(Rectangle.full()), rect);
});

test("#intersection of no rectangles returns full rectangle", (t) => {
  t.equal(Rectangle.intersection(), Rectangle.full());
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

test("#equals returns true for different representations of the same rectangle", (t) => {
  const rect1 = Rectangle.of(1, 1, 5, 3);
  const rect2 = Rectangle.of(6, 1, -5, 3);
  const rect3 = Rectangle.of(6, 4, -5, -3);
  const rect4 = Rectangle.of(1, 4, 5, -3);

  t.equal(rect1.equals(rect2), true, "rect1 !== rect2");
  t.equal(rect1.equals(rect3), true, "rect1 !== rect3");
  t.equal(rect1.equals(rect4), true, "rect1 !== rect4");
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
