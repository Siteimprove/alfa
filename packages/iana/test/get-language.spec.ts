import { test } from "@alfa/test";
import { getLanguage } from "../src/get-language";
import { PrimaryLanguages, Regions } from "../src/subtags";

test("Can parse an IANA language tag", async t => {
  t.deepEqual(getLanguage("da-DK"), {
    primary: PrimaryLanguages.DA,
    region: Regions.DK
  });
});
