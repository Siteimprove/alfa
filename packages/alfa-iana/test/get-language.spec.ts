import { test } from "@siteimprove/alfa-test";

import { Some, None } from "@siteimprove/alfa-option";
import { getLanguage } from "../src/get-language";
import { PrimaryLanguages, Regions } from "../src/subtags";
import { Language } from "../src/types";

test("Can parse an IANA language tag", t => {
  t.deepEqual(
    getLanguage("da-DK"),
    Some.of<Language>({
      primary: PrimaryLanguages.DA,
      region: Regions.DK
    })
  );
});

test("Returns none when given a syntactically invalid language tag", t => {
  t.deepEqual(getLanguage("da-DK-DK"), None);
});
