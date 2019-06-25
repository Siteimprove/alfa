import { Device } from "@siteimprove/alfa-device";
import { Attribute, Document, Element } from "@siteimprove/alfa-dom";

export type Aspect = Document | Device;

export type Target = Attribute | Document | Element;

export type Assertable = Exclude<Target, Attribute>;
