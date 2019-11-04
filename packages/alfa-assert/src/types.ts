import { Attribute, Document, Element } from "@siteimprove/alfa-dom";
import { Page } from "@siteimprove/alfa-web";

export type Input = Pick<Page, "document" | "device">;

export type Target = Attribute | Document | Element;

export type Assertable = Exclude<Target, Attribute>;
