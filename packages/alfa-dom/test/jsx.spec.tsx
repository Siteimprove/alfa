import { Device } from "@siteimprove/alfa-device";
import { test } from "@siteimprove/alfa-test";

test("Box attribute gets turned into box property", (t) => {
  const device = Device.standard();
  const element = (
    <div box={{ device, x: 12, y: 7, width: 3, height: 9 }}></div>
  );

  t.deepEqual(element.getBoundingBox(device).getUnsafe().toJSON(), {
    type: "rectangle",
    x: 12,
    y: 7,
    width: 3,
    height: 9,
  });
});

test("Element with box attribute without device has box property equal to `None`", (t) => {
  const device = Device.standard();
  const element = <div box={{ x: 12, y: 7, width: 3, height: 9 }}></div>;

  t.deepEqual(element.getBoundingBox(device).isNone(), true);
});

test("Element without box attribute has box property equal to `None`", (t) => {
  const device = Device.standard();
  const element = <div></div>;

  t.deepEqual(element.getBoundingBox(device).isNone(), true);
});

test("Elements accept an external Id", (t) => {
  const element = <div externalId="foo">Hello</div>;

  t.deepEqual(element.externalId, "foo");
});
