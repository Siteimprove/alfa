import { values } from "@siteimprove/alfa-util";
import { Element } from "@siteimprove/alfa-dom";
import { Rule } from "@siteimprove/alfa-act";

import * as rules from "./rules";

export const Rules: Array<Rule<"document", Element>> = values(rules);
