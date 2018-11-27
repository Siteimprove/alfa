import { ReactWrapper, ShallowWrapper } from "enzyme";

export function isEnzymeWrapper(
  input: unknown
): input is ReactWrapper | ShallowWrapper {
  return input instanceof ReactWrapper || input instanceof ShallowWrapper;
}
