import { test } from "@siteimprove/alfa-test";

import { None } from "@siteimprove/alfa-option";
import { getLanguage } from "../src/get-language";
import { PrimaryLanguages, Regions } from "../src/subtags";

test("Can parse an IANA language tag", t => {
  t.deepEqual(getLanguage("da-DK").toJSON(), {
    value: {
      primary: PrimaryLanguages.DA,
      region: Regions.DK
    }
  });
});

test("Returns none when given a syntactically invalid language tag", t => {
  t.deepEqual(getLanguage("da-DK-DK"), None);
});
