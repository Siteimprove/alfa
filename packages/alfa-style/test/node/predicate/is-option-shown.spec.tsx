import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { isOptionShown } from "../../../dist/node/predicate/is-option-shown.js";

const device = Device.standard();

test("isOptionShown() returns true for isolated `<option>`", (t) => {
  const option = (<option />) as Element<"option">;

  t(isOptionShown(device)(option));
});

test("isOptionShown() returns true when bounding boxes exist", (t) => {
  // The mere presence of boxes makes isOptionShown useless and aborting early.
  const option = (
    <option box={{ device, x: 0, y: 0, width: 0, height: 0 }} />
  ) as Element<"option">;
  const select = (
    <select box={{ device, x: 0, y: 0, width: 0, height: 0 }}>{option}</select>
  );

  t(isOptionShown(device)(option));
});

test("isOptionShown() returns false for `<option>` in a single line `<select>`", (t) => {
  const options = [
    <option>one</option>,
    <option>two</option>,
    <option>three</option>,
  ] as Array<Element<"option">>;
  const select = <select>{options}</select>;

  for (const option of options) {
    t(!isOptionShown(device)(option));
  }
});

test("isOptionShown() returns false for `<option>` in a single line `<select>` with selected option", (t) => {
  const options = [
    <option>one</option>,
    <option selected>two</option>,
    <option>three</option>,
  ] as Array<Element<"option">>;
  const select = <select>{options}</select>;

  for (const option of options) {
    t(!isOptionShown(device)(option));
  }
});

test("isOptionShown() returns true for the first d `<option>` in a multi-line `<select>`", (t) => {
  // If the display size is 1, then it is a mono-line select
  for (let size = 2; size < 6; size++) {
    const options = [
      <option>one</option>,
      <option>two</option>,
      <option>three</option>,
      <option>four</option>,
      <option>five</option>,
    ] as Array<Element<"option">>;

    const select = <select size={`${size}`}>{options}</select>;

    for (let i = 0; i < size; i++) {
      t(isOptionShown(device)(options[i]));
    }
    for (let i = size; i < 5; i++) {
      t(!isOptionShown(device)(options[i]));
    }
  }
});

test("isOptionShown() returns true for the first d `<option>` multiple `<select>`", (t) => {
  // Even with a display size of 1, if the select is multiple, it shows an option.
  for (let size = 1; size < 6; size++) {
    const options = [
      <option>one</option>,
      <option>two</option>,
      <option>three</option>,
      <option>four</option>,
      <option>five</option>,
    ] as Array<Element<"option">>;

    const select = (
      <select size={`${size}`} multiple>
        {options}
      </select>
    );

    for (let i = 0; i < size; i++) {
      t(isOptionShown(device)(options[i]));
    }
    for (let i = size; i < 5; i++) {
      t(!isOptionShown(device)(options[i]));
    }
  }

  // Without explicit size, the display size of multiple select is 4.
  const options = [
    <option>one</option>,
    <option>two</option>,
    <option>three</option>,
    <option>four</option>,
    <option>five</option>,
  ] as Array<Element<"option">>;

  const select = <select multiple>{options}</select>;

  for (let i = 0; i < 4; i++) {
    t(isOptionShown(device)(options[i]));
  }
  for (let i = 4; i < 5; i++) {
    t(!isOptionShown(device)(options[i]));
  }
});

test("isOptionShown() returns true for the d `<option>` preceding the selected one in a mono-select", (t) => {
  const selectedIndex = 3;
  // If the display size is 1, then it is a mono-line select
  for (let size = 2; size < 6; size++) {
    const options = [
      <option>one</option>, // 0
      <option>two</option>, // 1
      <option>three</option>, // 2
      <option selected>four</option>, // 3
      <option>five</option>, // 4
      <option>six</option>, // 5
    ] as Array<Element<"option">>;

    const select = <select size={`${size}`}>{options}</select>;

    for (let i = 0; i < 6; i++) {
      if (i <= selectedIndex - size) {
        // If size is  less than 4 (the selected one), then the first
        // 4-size are not shown.
        t(!isOptionShown(device)(options[i]));
        continue;
      }

      if (i <= selectedIndex) {
        // Options before the selected one and after the initial non-shown ones
        // are shown.
        t(isOptionShown(device)(options[i]));
        continue;
      }

      if (i > selectedIndex && i < size) {
        // Options after the selected one are only shown if everything is taken
        // from the start, i.e. they are also in the first size options.
        t(isOptionShown(device)(options[i]));
        continue;
      }

      // The rest is not shown.
      t(!isOptionShown(device)(options[i]));
    }
  }
});

test("isOptionShown() returns true for the d `<option>` preceding the first selected one in a multi-select", (t) => {
  const selectedIndex = 2;
  // If the display size is 1, then it is a mono-line select
  for (let size = 1; size < 6; size++) {
    const options = [
      <option>one</option>, // 0
      <option>two</option>, // 1
      <option selected>three</option>, // 2
      <option>four</option>, // 3
      <option selected>five</option>, // 4
      <option>six</option>, // 5
    ] as Array<Element<"option">>;

    const select = (
      <select multiple size={`${size}`}>
        {options}
      </select>
    );

    for (let i = 0; i < 6; i++) {
      if (i <= selectedIndex - size) {
        // If size is  less than 4 (the selected one), then the first
        // 4-size are not shown.
        t(!isOptionShown(device)(options[i]));
        continue;
      }

      if (i <= selectedIndex) {
        // Options before the selected one and after the initial non-shown ones
        // are shown.
        t(isOptionShown(device)(options[i]));
        continue;
      }

      if (i > selectedIndex && i < size) {
        // Options after the selected one are only shown if everything is taken
        // from the start, i.e. they are also in the first size options.
        t(isOptionShown(device)(options[i]));
        continue;
      }

      // The rest is not shown.
      t(!isOptionShown(device)(options[i]));
    }
  }
});
