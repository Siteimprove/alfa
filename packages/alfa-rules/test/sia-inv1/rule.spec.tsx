// import { h } from "@siteimprove/alfa-dom";
// import { Option } from "@siteimprove/alfa-option";
// import { test } from "@siteimprove/alfa-test";
//
// import INV1, { ImageName as Inventory } from "../../src/sia-inv1/rule";
//
// import { evaluate } from "../common/evaluate";
// import { inapplicable, inventory } from "../common/outcome";
//
// test("evaluate() gets the name of an image", async (t) => {
//   const target = <img alt="Hello world" />;
//
//   const document = h.document([target]);
//
//   t.deepEqual(await evaluate(INV1, { document }), [
//     inventory(INV1, target, Inventory.of("", Option.of("Hello world"))),
//   ]);
// });
//
// test("evaluate() is inapplicable to an <img> element with a presentational role", async (t) => {
//   const document = h.document([<img role="none" />]);
//
//   t.deepEqual(await evaluate(INV1, { document }), [
//     /*inapplicable(INV1)*/
//   ]);
// });
//
// test("evaluate() is inapplicable to an <img> element that is hidden", async (t) => {
//   const document = h.document([<img hidden alt="Hello world" />]);
//
//   t.deepEqual(await evaluate(INV1, { document }), [
//     /*inapplicable(INV1)*/
//   ]);
// });
//
// test("evaluate() is inapplicable to a document without images", async (t) => {
//   const document = h.document([]);
//
//   t.deepEqual(await evaluate(INV1, { document }), [
//     /*inapplicable(INV1)*/
//   ]);
// });
