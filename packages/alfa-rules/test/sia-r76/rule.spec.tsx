import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R76, { Outcomes } from "../../src/sia-r76/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes implicit row headers`, async (t) => {
  const target1 = <th>Mon-Fri</th>;
  const target2 = <th>Sat-Sun</th>;

  const document = h.document([
    <table>
      <caption>Opening hours</caption>
      <tr>
        {target1}
        <td>8-17</td>
      </tr>
      <tr>
        {target2}
        <td>10-14</td>
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R76, { document }), [
    passed(R76, target1, {
      1: Outcomes.HasHeaderRole("rowheader"),
    }),
    passed(R76, target2, {
      1: Outcomes.HasHeaderRole("rowheader"),
    }),
  ]);
});

test(`evaluate() passes explicit headers`, async (t) => {
  const target1 = <th scope="col">Morning</th>;
  const target2 = <th scope="col">Afternoon</th>;
  const target3 = <th scope="row">Mon-Fri</th>;
  const target4 = <th scope="row">Sat-Sun</th>;

  const document = h.document([
    <table>
      <caption>Opening hours</caption>
      <tr>
        <td>Foo</td>
        {target1}
        {target2}
      </tr>
      <tr>
        {target3}
        <td>8-12</td>
        <td>13-17</td>
      </tr>
      <tr>
        {target4}
        <td>10-13</td>
        <td>Closed</td>
      </tr>
    </table>,
  ]);
  t.deepEqual(await evaluate(R76, { document }), [
    passed(R76, target1, {
      1: Outcomes.HasHeaderRole("columnheader"),
    }),
    passed(R76, target2, {
      1: Outcomes.HasHeaderRole("columnheader"),
    }),
    passed(R76, target3, {
      1: Outcomes.HasHeaderRole("rowheader"),
    }),
    passed(R76, target4, {
      1: Outcomes.HasHeaderRole("rowheader"),
    }),
  ]);
});

test(`evaluate() fails headers with neither scope nor role`, async (t) => {
  const target1 = <th id="t1">Morning</th>;
  const target2 = <th id="t2">Afternoon</th>;
  const target3 = <th id="t3">Mon-Fri</th>;
  const target4 = <th id="t4">Sat-Sun</th>;

  const document = h.document([
    <table>
      <tr>
        <td>Open</td>
        {target1}
        {target2}
      </tr>
      <tr>
        {target3}
        <td>8-12</td>
        <td>13-17</td>
      </tr>
      <tr>
        {target4}
        <td>10-13</td>
        <td>Closed</td>
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R76, { document }), [
    failed(R76, target1, {
      1: Outcomes.HasNoHeaderRole("cell"),
    }),
    failed(R76, target2, {
      1: Outcomes.HasNoHeaderRole("cell"),
    }),
    failed(R76, target3, {
      1: Outcomes.HasNoHeaderRole("cell"),
    }),
    failed(R76, target4, {
      1: Outcomes.HasNoHeaderRole("cell"),
    }),
  ]);
});

test(`evaluate() fails headers whose role has been changed`, async (t) => {
  const target1 = <th role="tab">Mon-Fri</th>;
  const target2 = <th role="tab">Sat-Sun</th>;

  const document = h.document([
    <table>
      <caption>Opening hours</caption>
      <tr>
        {target1}
        <td>8-17</td>
      </tr>
      <tr>
        {target2}
        <td>10-14</td>
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R76, { document }), [
    failed(R76, target1, {
      1: Outcomes.HasNoHeaderRole("tab"),
    }),
    failed(R76, target2, {
      1: Outcomes.HasNoHeaderRole("tab"),
    }),
  ]);
});

test(`evaluate() is inapplicable to headers in hidden tables`, async (t) => {
  const document = h.document([
    <table aria-hidden="true">
      <caption>Opening hours</caption>
      <tr>
        <td></td>
        <th>Morning</th>
        <th>Afternoon</th>
      </tr>
      <tr>
        <th>Mon-Fri</th>
        <td>8-12</td>
        <td>13-17</td>
      </tr>
      <tr>
        <th>Sat-Sun</th>
        <td>10-13</td>
        <td>Closed</td>
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R76, { document }), [inapplicable(R76)]);
});
