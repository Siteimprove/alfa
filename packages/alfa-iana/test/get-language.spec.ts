import { test } from "@siteimprove/alfa-test";
import { getLanguage } from "../src/get-language";
import { PrimaryLanguages, Regions } from "../src/subtags";

test("Can parse an IANA language tag", t => {
  t.deepEqual(getLanguage("da-DK"), {
    primary: PrimaryLanguages.DA,
    region: Regions.DK
  });
});

test("Returns null when given a syntactically invalid language tag", t => {
  t.deepEqual(getLanguage("da-DK-DK"), null);
});
