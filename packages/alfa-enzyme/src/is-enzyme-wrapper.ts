import { isCheerioElement } from "@siteimprove/alfa-cheerio";
import { ReactWrapper, ShallowWrapper } from "enzyme";
import { EnzymeWrapper } from "./types";

export function isEnzymeWrapper(input: unknown): input is EnzymeWrapper {
  return (
    input instanceof ReactWrapper ||
    input instanceof ShallowWrapper ||
    isCheerioElement(input)
  );
}
