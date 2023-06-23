import { test } from "@siteimprove/alfa-test";

test("Box attribute gets turned into box property", (t) => {
  const element = <div box={{ x: 12, y: 7, width: 3, height: 9 }}></div>;

  t.deepEqual(element.box.getUnsafe().toJSON(), {
    type: "rectangle",
    x: 12,
    y: 7,
    width: 3,
    height: 9,
  });
});

test("Element without box attribute has box property equal to `None`", (t) => {
  const element = <div></div>;

  t.deepEqual(element.box.isNone(), true);
});
