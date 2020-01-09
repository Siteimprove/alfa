import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import R48 from "../sia-r48/rule";
import R49 from "../sia-r49/rule";

export default Rule.Composite.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r50.html",
  composes: [R48, R49],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: outcomes.some(Outcome.isPassed)
            ? Ok.of(
                `The total duration of the autoplaying audio output of the
                element either lasts no longer than 3 seconds or a mechanism to
                pause or stop the audio is available`
              )
            : Err.of(
                `The total duration of the autoplaying audio output of the
                element lasts longer than 3 seconds and no mechanism to pause or
                stop the audio is available`
              )
        };
      }
    };
  }
});
